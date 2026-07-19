import { Injectable, NotFoundException } from '@nestjs/common';
import { API_ERROR_CODES } from '@gymhub/shared';
import { Prisma } from '@gymhub/database';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';

export type PublicGymFilters = {
  city?: string;
  district?: string;
  amenity?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  limit?: number;
};

@Injectable()
export class GymsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(filters: PublicGymFilters) {
    const { skip, take, page, pageSize } = paginate(
      filters.page,
      filters.limit,
    );
    const now = new Date();

    const where: Prisma.GymWhereInput = {
      moderationStatus: 'APPROVED',
      subscriptions: {
        some: {
          status: 'ACTIVE',
          endsAt: { gt: now },
        },
      },
      ...(filters.city ? { city: filters.city } : {}),
      ...(filters.district ? { district: filters.district } : {}),
      ...(filters.amenity ? { amenities: { has: filters.amenity } } : {}),
      ...(filters.featured ? { isFeatured: true } : {}),
      ...(filters.minPrice != null || filters.maxPrice != null
        ? {
            plans: {
              some: {
                isActive: true,
                ...(filters.minPrice != null
                  ? { priceAmd: { gte: filters.minPrice } }
                  : {}),
                ...(filters.maxPrice != null
                  ? { priceAmd: { lte: filters.maxPrice } }
                  : {}),
              },
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.gym.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isFeatured: 'desc' },
          { viewCount: 'desc' },
          { name: 'asc' },
        ],
        include: {
          media: { orderBy: { sortOrder: 'asc' }, take: 1 },
          plans: {
            where: { isActive: true },
            orderBy: { priceAmd: 'asc' },
            take: 1,
          },
        },
      }),
      this.prisma.gym.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getFeatured(limit = 6) {
    const result = await this.listPublic({ featured: true, limit, page: 1 });
    if (result.items.length >= 3) {
      return result.items;
    }
    const fallback = await this.listPublic({ limit, page: 1 });
    return fallback.items;
  }

  async listPublicTrainers(filters: { page?: number; limit?: number } = {}) {
    const { skip, take, page, pageSize } = paginate(
      filters.page,
      filters.limit ?? 48,
    );
    const now = new Date();
    const gymWhere: Prisma.GymWhereInput = {
      moderationStatus: 'APPROVED',
      subscriptions: {
        some: {
          status: 'ACTIVE',
          endsAt: { gt: now },
        },
      },
    };

    const where: Prisma.TrainerWhereInput = {
      isActive: true,
      gym: gymWhere,
    };

    const [items, total] = await Promise.all([
      this.prisma.trainer.findMany({
        where,
        skip,
        take,
        orderBy: [{ name: 'asc' }],
        include: {
          gym: {
            select: {
              id: true,
              slug: true,
              name: true,
              district: true,
              city: true,
            },
          },
        },
      }),
      this.prisma.trainer.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getBySlug(slug: string) {
    const now = new Date();
    const gym = await this.prisma.gym.findFirst({
      where: {
        slug,
        moderationStatus: 'APPROVED',
        subscriptions: {
          some: { status: 'ACTIVE', endsAt: { gt: now } },
        },
      },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        trainers: { where: { isActive: true }, orderBy: { name: 'asc' } },
        plans: { where: { isActive: true }, orderBy: { priceAmd: 'asc' } },
        subscriptions: {
          where: { status: 'ACTIVE', endsAt: { gt: now } },
          orderBy: { endsAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!gym) {
      throw new NotFoundException({
        code: API_ERROR_CODES.GYM_NOT_PUBLIC,
        message: 'Gym not found or not publicly listed',
      });
    }

    await this.prisma.gym.update({
      where: { id: gym.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...gym,
      verified: true,
      activeSubscription: gym.subscriptions[0] ?? null,
    };
  }
}
