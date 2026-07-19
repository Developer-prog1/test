import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { API_ERROR_CODES } from '@gymhub/shared';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

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
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException({
        code: API_ERROR_CODES.UNAUTHORIZED,
        message: 'User not found',
      });
    }
    return user;
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
      select: { fullName: true, avatarUrl: true },
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        role,
        fullName: profile?.fullName ?? null,
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
