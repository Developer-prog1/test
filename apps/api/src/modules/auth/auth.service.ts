import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { API_ERROR_CODES } from '@gymhub/shared';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ChangePasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto';

const PROFILE_SELECT = {
  id: true,
  email: true,
  role: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  createdAt: true,
} as const;

const AVATAR_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

@Injectable()
export class AuthService {
  private readonly s3: S3Client | null;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly apiPublicUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    const endpoint = config.get<string>('R2_ENDPOINT');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('R2_BUCKET_NAME', 'gym');
    this.publicUrl = config.get<string>('R2_PUBLIC_URL', '');
    this.apiPublicUrl = (
      config.get<string>('API_URL') ?? 'http://localhost:4000'
    ).replace(/\/$/, '');

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.s3 = null;
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException({
        code: API_ERROR_CODES.CONFLICT,
        message: 'Email already registered',
      });
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: dto.role,
      },
    });

    if (dto.role === 'GYM_OWNER') {
      const slug = await this.uniqueSlug(
        dto.fullName ?? dto.email.split('@')[0],
      );
      await this.prisma.gym.create({
        data: {
          ownerId: user.id,
          slug,
          name: dto.fullName ? `${dto.fullName} Gym` : 'Իմ GYM',
          city: 'Yerevan',
          address: 'Հասցեն կլրացվի',
          moderationStatus: 'DRAFT',
        },
      });
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }
    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        email: string;
        role: 'USER' | 'GYM_OWNER' | 'ADMIN';
      }>(dto.refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      return this.issueTokens(payload.sub, payload.email, payload.role);
    } catch {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    });
    if (!user) {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.UNAUTHORIZED,
        message: 'User not found',
      });
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
    if (!current) {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.UNAUTHORIZED,
        message: 'User not found',
      });
    }

    const data: {
      fullName?: string | null;
      phone?: string;
      email?: string;
    } = {};

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim() || null;
    }
    if (dto.phone !== undefined) {
      data.phone = dto.phone.trim();
    }
    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      if (email !== current.email) {
        const clash = await this.prisma.user.findUnique({ where: { email } });
        if (clash) {
          throw new ConflictException({
            code: API_ERROR_CODES.CONFLICT,
            message: 'Email already registered',
          });
        }
        data.email = email;
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: PROFILE_SELECT,
    });

    if (data.email) {
      const tokens = await this.issueTokens(user.id, user.email, user.role);
      return {
        ...user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }

    return user;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: 'File required',
      });
    }
    if (!AVATAR_MIME.has(file.mimetype) || file.size > AVATAR_MAX_BYTES) {
      throw new BadRequestException({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid image type or size (max 2MB jpeg/png/webp)',
      });
    }

    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });
    if (!current) {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.UNAUTHORIZED,
        message: 'User not found',
      });
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `avatars/${userId}/${randomUUID()}-${safeName}`;
    let url: string;

    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      url = `${this.publicUrl.replace(/\/$/, '')}/${key}`;
    } else {
      const dir = join(process.cwd(), 'uploads', 'avatars');
      await mkdir(dir, { recursive: true });
      const ext =
        file.mimetype === 'image/png'
          ? 'png'
          : file.mimetype === 'image/webp'
            ? 'webp'
            : 'jpg';
      const filename = `${userId}-${randomUUID()}.${ext}`;
      await writeFile(join(dir, filename), file.buffer);
      url = `${this.apiPublicUrl}/uploads/avatars/${filename}`;
    }

    await this.deleteStoredAvatar(current.avatarUrl);

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
      select: PROFILE_SELECT,
    });
  }

  async removeAvatar(userId: string) {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });
    if (!current) {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.UNAUTHORIZED,
        message: 'User not found',
      });
    }

    await this.deleteStoredAvatar(current.avatarUrl);

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: PROFILE_SELECT,
    });
  }

  private async deleteStoredAvatar(avatarUrl: string | null | undefined) {
    if (!avatarUrl) return;

    if (this.s3 && this.publicUrl && avatarUrl.includes(this.publicUrl)) {
      const key = avatarUrl.replace(`${this.publicUrl.replace(/\/$/, '')}/`, '');
      await this.s3
        .send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
        .catch(() => undefined);
      return;
    }

    const localPrefix = `${this.apiPublicUrl}/uploads/avatars/`;
    if (avatarUrl.startsWith(localPrefix)) {
      const filename = avatarUrl.slice(localPrefix.length);
      if (filename && !filename.includes('..') && !filename.includes('/') && !filename.includes('\\')) {
        await unlink(join(process.cwd(), 'uploads', 'avatars', filename)).catch(
          () => undefined,
        );
      }
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.UNAUTHORIZED,
        message: 'User not found',
      });
    }

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Current password is incorrect',
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await argon2.hash(dto.newPassword) },
    });

    return { ok: true as const };
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: 'USER' | 'GYM_OWNER' | 'ADMIN',
  ) {
    const payload = { sub: userId, email, role };
    const accessExpires =
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshExpires =
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpires as `${number}m`,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpires as `${number}d`,
    });
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, avatarUrl: true, phone: true },
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        role,
        fullName: profile?.fullName ?? null,
        phone: profile?.phone ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
      },
    };
  }

  private async uniqueSlug(base: string) {
    const normalized =
      base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'gym';
    let slug = normalized;
    let i = 1;
    while (await this.prisma.gym.findUnique({ where: { slug } })) {
      slug = `${normalized}-${i}`;
      i += 1;
    }
    return slug;
  }
}
