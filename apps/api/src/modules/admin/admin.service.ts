import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { API_ERROR_CODES } from '@gymhub/shared';
import * as argon2 from 'argon2';
import { Prisma } from '@gymhub/database';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { paginate } from '../../common/dto/pagination.dto';
import { computeCompleteness } from '../owner/completeness';
import type {
  AdminCreateGymDto,
  AdminPlanInputDto,
  AdminTrainerInputDto,
  AdminUpdateGymDto,
} from './admin-gym.dto';

const DEFAULT_OWNER_PASSWORD = 'Owner123!';

type ListingPackageInput = {
  code: string;
  months: number;
  priceAmd: number;
  popular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

type ListingPackagePatch = {
  code?: string;
  months?: number;
  priceAmd?: number;
  popular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async listOwners() {
    return this.prisma.user.findMany({
      where: { role: 'GYM_OWNER' },
      orderBy: { email: 'asc' },
      select: { id: true, email: true, fullName: true },
    });
  }

  async listGyms(page = 1, limit = 20, status?: string) {
    const { skip, take, page: p, pageSize } = paginate(page, limit);
    const where = status
      ? {
          moderationStatus: status as
            'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED',
        }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.gym.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: { select: { id: true, email: true, fullName: true } },
          subscriptions: { orderBy: { endsAt: 'desc' }, take: 1 },
          media: { orderBy: { sortOrder: 'asc' }, take: 1 },
          plans: {
            where: { isActive: true },
            orderBy: { priceAmd: 'asc' },
            take: 1,
            select: { priceAmd: true },
          },
          _count: { select: { media: true, trainers: true, plans: true } },
        },
      }),
      this.prisma.gym.count({ where }),
    ]);
    return { items, total, page: p, pageSize };
  }

  async getGym(gymId: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { id: gymId },
      include: {
        owner: { select: { id: true, email: true, fullName: true } },
        media: { orderBy: { sortOrder: 'asc' } },
        trainers: { orderBy: { name: 'asc' } },
        plans: { orderBy: { priceAmd: 'asc' } },
        subscriptions: { orderBy: { endsAt: 'desc' }, take: 1 },
      },
    });
    if (!gym) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Gym not found',
      });
    }
    return gym;
  }

  async moderate(
    actorId: string,
    gymId: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const gym = await this.prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Gym not found',
      });
    }
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid moderation status',
      });
    }

    const updated = await this.prisma.gym.update({
      where: { id: gymId },
      data: { moderationStatus: status },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action: `GYM_${status}`,
        entityType: 'Gym',
        entityId: gymId,
        meta: { previous: gym.moderationStatus },
      },
    });

    return updated;
  }

  async setFeatured(actorId: string, gymId: string, isFeatured: boolean) {
    const updated = await this.prisma.gym.update({
      where: { id: gymId },
      data: { isFeatured },
    });
    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action: 'GYM_FEATURED',
        entityType: 'Gym',
        entityId: gymId,
        meta: { isFeatured },
      },
    });
    return updated;
  }

  async listSubscriptions(page = 1, limit = 20) {
    const { skip, take, page: p, pageSize } = paginate(page, limit);
    const [items, total] = await Promise.all([
      this.prisma.gymSubscription.findMany({
        orderBy: { endsAt: 'desc' },
        skip,
        take,
        include: { gym: { select: { id: true, name: true, slug: true } } },
      }),
      this.prisma.gymSubscription.count(),
    ]);
    return { items, total, page: p, pageSize };
  }

  async activateSubscription(actorId: string, gymId: string, months = 1) {
    return this.subscriptionsService.adminActivate(gymId, months, actorId);
  }

  async recentAudit() {
    return this.prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        actor: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  async createGymForOwner(actorId: string, data: AdminCreateGymDto) {
    const owner = await this.resolveOwner(
      data.ownerEmail,
      data.ownerFullName ?? `${data.name} Owner`,
    );
    const slug = await this.uniqueSlug(data.name);
    const moderationStatus = data.moderationStatus ?? 'APPROVED';

    const gym = await this.prisma.gym.create({
      data: {
        ownerId: owner.id,
        slug,
        name: data.name.trim(),
        city: data.city.trim(),
        district: data.district?.trim() || null,
        address: data.address.trim(),
        phone: data.phone?.trim() || null,
        description: data.description?.trim() || null,
        amenities: data.amenities ?? [],
        workingHours: (data.workingHours as object | undefined) ?? undefined,
        isFeatured: data.isFeatured ?? false,
        moderationStatus,
      },
    });

    await this.replaceNested(gym.id, {
      mediaUrls: data.mediaUrls,
      trainers: data.trainers,
      plans: data.plans,
    });

    if (data.activateMonths && data.activateMonths > 0) {
      await this.subscriptionsService.adminActivate(
        gym.id,
        data.activateMonths,
        actorId,
      );
    }

    const full = await this.refreshCompleteness(gym.id);

    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action: 'GYM_CREATE',
        entityType: 'Gym',
        entityId: gym.id,
        meta: {
          ownerEmail: data.ownerEmail,
          ownerCreated: owner.created,
        },
      },
    });

    return {
      ...full,
      ownerCreated: owner.created,
      temporaryOwnerPassword: owner.created
        ? DEFAULT_OWNER_PASSWORD
        : undefined,
    };
  }

  async updateGym(actorId: string, gymId: string, data: AdminUpdateGymDto) {
    const existing = await this.prisma.gym.findUnique({ where: { id: gymId } });
    if (!existing) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Gym not found',
      });
    }

    let ownerId = existing.ownerId;
    if (data.ownerEmail) {
      const owner = await this.resolveOwner(
        data.ownerEmail,
        `${data.name ?? existing.name} Owner`,
      );
      ownerId = owner.id;
    }

    await this.prisma.gym.update({
      where: { id: gymId },
      data: {
        ownerId,
        name: data.name?.trim(),
        city: data.city?.trim(),
        district:
          data.district !== undefined
            ? data.district.trim() || null
            : undefined,
        address: data.address?.trim(),
        phone: data.phone !== undefined ? data.phone.trim() || null : undefined,
        description:
          data.description !== undefined
            ? data.description.trim() || null
            : undefined,
        amenities: data.amenities,
        ...(data.workingHours !== undefined
          ? { workingHours: data.workingHours as object }
          : {}),
        isFeatured: data.isFeatured,
        moderationStatus: data.moderationStatus,
      },
    });

    if (
      data.mediaUrls !== undefined ||
      data.trainers !== undefined ||
      data.plans !== undefined
    ) {
      await this.replaceNested(gymId, {
        mediaUrls: data.mediaUrls,
        trainers: data.trainers,
        plans: data.plans,
      });
    }

    const full = await this.refreshCompleteness(gymId);

    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action: 'GYM_UPDATE',
        entityType: 'Gym',
        entityId: gymId,
        meta: { fields: Object.keys(data) },
      },
    });

    return full;
  }

  private async resolveOwner(email: string, fullName: string) {
    const normalized = email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      if (existing.role !== 'GYM_OWNER' && existing.role !== 'ADMIN') {
        throw new BadRequestException({
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: 'User exists but is not a gym owner',
        });
      }
      return { id: existing.id, created: false as const };
    }

    const passwordHash = await argon2.hash(DEFAULT_OWNER_PASSWORD);
    const created = await this.prisma.user.create({
      data: {
        email: normalized,
        fullName: fullName.trim() || 'Gym Owner',
        role: 'GYM_OWNER',
        passwordHash,
      },
    });
    return { id: created.id, created: true as const };
  }

  private async uniqueSlug(name: string): Promise<string> {
    const slugBase = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    let slug = slugBase || `gym-${Date.now()}`;
    let i = 1;
    while (await this.prisma.gym.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${i}`;
      i += 1;
    }
    return slug;
  }

  private async replaceNested(
    gymId: string,
    data: {
      mediaUrls?: string[];
      trainers?: AdminTrainerInputDto[];
      plans?: AdminPlanInputDto[];
    },
  ) {
    if (data.mediaUrls !== undefined) {
      await this.prisma.gymMedia.deleteMany({ where: { gymId } });
      const urls = data.mediaUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
      if (urls.length > 0) {
        await this.prisma.gymMedia.createMany({
          data: urls.map((url, index) => ({
            gymId,
            url,
            kind: index === 0 ? 'cover' : 'gallery',
            sortOrder: index,
          })),
        });
      }
    }

    if (data.trainers !== undefined) {
      await this.prisma.trainer.deleteMany({ where: { gymId } });
      const trainers = data.trainers.filter((item) => item.name.trim());
      if (trainers.length > 0) {
        await this.prisma.trainer.createMany({
          data: trainers.map((item) => ({
            gymId,
            name: item.name.trim(),
            photoUrl: item.photoUrl?.trim() || null,
            specialization: item.specialization?.trim() || null,
            bio: item.bio?.trim() || null,
          })),
        });
      }
    }

    if (data.plans !== undefined) {
      await this.prisma.membershipPlan.deleteMany({ where: { gymId } });
      const plans = data.plans.filter((item) => item.title.trim());
      if (plans.length > 0) {
        await this.prisma.membershipPlan.createMany({
          data: plans.map((item) => ({
            gymId,
            title: item.title.trim(),
            description: item.description?.trim() || null,
            priceAmd: item.priceAmd,
            durationDays: item.durationDays ?? 30,
            isActive: item.isActive ?? true,
          })),
        });
      }
    }
  }

  private async refreshCompleteness(gymId: string) {
    const full = await this.prisma.gym.findUniqueOrThrow({
      where: { id: gymId },
      include: {
        owner: { select: { id: true, email: true, fullName: true } },
        media: { orderBy: { sortOrder: 'asc' } },
        trainers: { orderBy: { name: 'asc' } },
        plans: { orderBy: { priceAmd: 'asc' } },
        subscriptions: { orderBy: { endsAt: 'desc' }, take: 1 },
      },
    });
    const completenessScore = computeCompleteness(full);
    if (full.completenessScore !== completenessScore) {
      return this.prisma.gym.update({
        where: { id: gymId },
        data: { completenessScore },
        include: {
          owner: { select: { id: true, email: true, fullName: true } },
          media: { orderBy: { sortOrder: 'asc' } },
          trainers: { orderBy: { name: 'asc' } },
          plans: { orderBy: { priceAmd: 'asc' } },
          subscriptions: { orderBy: { endsAt: 'desc' }, take: 1 },
        },
      });
    }
    return full;
  }

  listListingPackages() {
    return this.subscriptionsService.listAllPackages();
  }

  async createListingPackage(actorId: string, data: ListingPackageInput) {
    const code = data.code.trim().toLowerCase();
    try {
      const created = await this.prisma.listingPackage.create({
        data: {
          code,
          months: data.months,
          priceAmd: data.priceAmd,
          popular: data.popular ?? false,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      });
      await this.prisma.adminAuditLog.create({
        data: {
          actorId,
          action: 'LISTING_PACKAGE_CREATE',
          entityType: 'ListingPackage',
          entityId: created.id,
          meta: { code: created.code },
        },
      });
      return created;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: API_ERROR_CODES.CONFLICT,
          message: 'Package code already exists',
        });
      }
      throw error;
    }
  }

  async updateListingPackage(
    actorId: string,
    id: string,
    data: ListingPackagePatch,
  ) {
    const existing = await this.prisma.listingPackage.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Package not found',
      });
    }

    try {
      const updated = await this.prisma.listingPackage.update({
        where: { id },
        data: {
          ...(data.code != null
            ? { code: data.code.trim().toLowerCase() }
            : {}),
          ...(data.months != null ? { months: data.months } : {}),
          ...(data.priceAmd != null ? { priceAmd: data.priceAmd } : {}),
          ...(data.popular != null ? { popular: data.popular } : {}),
          ...(data.isActive != null ? { isActive: data.isActive } : {}),
          ...(data.sortOrder != null ? { sortOrder: data.sortOrder } : {}),
        },
      });
      await this.prisma.adminAuditLog.create({
        data: {
          actorId,
          action: 'LISTING_PACKAGE_UPDATE',
          entityType: 'ListingPackage',
          entityId: updated.id,
          meta: data,
        },
      });
      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: API_ERROR_CODES.CONFLICT,
          message: 'Package code already exists',
        });
      }
      throw error;
    }
  }

  async deleteListingPackage(actorId: string, id: string) {
    const existing = await this.prisma.listingPackage.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Package not found',
      });
    }

    const activeCount = await this.prisma.listingPackage.count({
      where: { isActive: true },
    });
    if (existing.isActive && activeCount <= 1) {
      throw new BadRequestException({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: 'Keep at least one active package',
      });
    }

    await this.prisma.listingPackage.delete({ where: { id } });
    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action: 'LISTING_PACKAGE_DELETE',
        entityType: 'ListingPackage',
        entityId: id,
        meta: { code: existing.code },
      },
    });
    return { ok: true };
  }
}
