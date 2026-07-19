import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { API_ERROR_CODES } from '@gymhub/shared';
import { R2StorageService } from '../../common/storage/r2-storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OwnerService } from '../owner/owner.service';
import { computeCompleteness } from '../owner/completeness';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownerService: OwnerService,
    private readonly r2: R2StorageService,
  ) {}

  async list(ownerId: string) {
    const gym = await this.ownerService.requireGym(ownerId);
    return this.prisma.gymMedia.findMany({
      where: { gymId: gym.id },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upload(
    ownerId: string,
    file: Express.Multer.File,
    kind: 'cover' | 'gallery' = 'gallery',
  ) {
    if (!file) {
      throw new BadRequestException({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: 'File required',
      });
    }
    if (!ALLOWED_MIME.has(file.mimetype) || file.size > MAX_BYTES) {
      throw new BadRequestException({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid image type or size (max 5MB jpeg/png/webp)',
      });
    }

    const gym = await this.ownerService.requireGym(ownerId);
    const key = `gyms/${gym.id}/${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const url = await this.r2.uploadObject(key, file.buffer, file.mimetype);

    const count = await this.prisma.gymMedia.count({
      where: { gymId: gym.id },
    });
    const media = await this.prisma.gymMedia.create({
      data: {
        gymId: gym.id,
        url,
        kind,
        sortOrder: kind === 'cover' ? 0 : count + 1,
      },
    });

    const full = await this.ownerService.requireGym(ownerId);
    await this.prisma.gym.update({
      where: { id: gym.id },
      data: { completenessScore: computeCompleteness(full) },
    });

    return media;
  }

  async replaceUrls(ownerId: string, urls: string[]) {
    const gym = await this.ownerService.requireGym(ownerId);
    const cleaned = urls.map((url) => url.trim()).filter(Boolean);

    await this.prisma.$transaction(async (tx) => {
      await tx.gymMedia.deleteMany({ where: { gymId: gym.id } });
      if (cleaned.length === 0) return;
      await tx.gymMedia.createMany({
        data: cleaned.map((url, index) => ({
          gymId: gym.id,
          url,
          kind: index === 0 ? 'cover' : 'gallery',
          sortOrder: index,
        })),
      });
    });

    const full = await this.ownerService.requireGym(ownerId);
    await this.prisma.gym.update({
      where: { id: gym.id },
      data: { completenessScore: computeCompleteness(full) },
    });

    return this.list(ownerId);
  }

  async remove(ownerId: string, mediaId: string) {
    const gym = await this.ownerService.requireGym(ownerId);
    const media = await this.prisma.gymMedia.findFirst({
      where: { id: mediaId, gymId: gym.id },
    });
    if (!media) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Media not found',
      });
    }

    await this.r2.deleteByPublicUrl(media.url);
    await this.prisma.gymMedia.delete({ where: { id: mediaId } });
    return { ok: true };
  }
}
