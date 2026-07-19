import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { API_ERROR_CODES } from '@gymhub/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { computeCompleteness, isProfileComplete } from './completeness';

@Injectable()
export class OwnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyGym(ownerId: string) {
    const gym = await this.requireGym(ownerId);
    const completenessScore = computeCompleteness(gym);
    if (gym.completenessScore !== completenessScore) {
      await this.prisma.gym.update({
        where: { id: gym.id },
        data: { completenessScore },
      });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [newLeadsWeek, newLeadsToday, subscription] = await Promise.all([
      this.prisma.lead.count({
        where: { gymId: gym.id, createdAt: { gte: weekAgo } },
      }),
      this.prisma.lead.count({
        where: {
          gymId: gym.id,
          createdAt: {
            gte: new Date(now.toISOString().slice(0, 10)),
          },
        },
      }),
      this.prisma.gymSubscription.findFirst({
        where: { gymId: gym.id },
        orderBy: { endsAt: 'desc' },
      }),
    ]);

    return {
      ...gym,
      completenessScore,
      stats: {
        viewCount: gym.viewCount,
        newLeadsToday,
        newLeadsWeek,
      },
      subscription,
    };
  }

  async updateGym(
    ownerId: string,
    data: {
      name?: string;
      description?: string;
      city?: string;
      district?: string;
      address?: string;
      phone?: string;
      workingHours?: Record<string, unknown>;
      amenities?: string[];
    },
  ) {
    const gym = await this.requireGym(ownerId);
    const updated = await this.prisma.gym.update({
      where: { id: gym.id },
      data: {
        name: data.name,
        description: data.description,
        city: data.city,
        district: data.district,
        address: data.address,
        phone: data.phone,
        amenities: data.amenities,
        ...(data.workingHours !== undefined
          ? { workingHours: data.workingHours as object }
          : {}),
      },
      include: { media: true, trainers: true, plans: true },
    });
    const completenessScore = computeCompleteness(updated);
    return this.prisma.gym.update({
      where: { id: gym.id },
      data: { completenessScore },
      include: { media: true, trainers: true, plans: true },
    });
  }

  async submitForModeration(ownerId: string) {
    const gym = await this.requireGym(ownerId);
    if (!isProfileComplete(gym)) {
      throw new BadRequestException({
        code: API_ERROR_CODES.PROFILE_INCOMPLETE,
        message: 'Complete profile before submitting for moderation',
      });
    }
    return this.prisma.gym.update({
      where: { id: gym.id },
      data: { moderationStatus: 'PENDING' },
    });
  }

  async listTrainers(ownerId: string) {
    const gym = await this.requireGym(ownerId);
    return this.prisma.trainer.findMany({ where: { gymId: gym.id } });
  }

  async createTrainer(
    ownerId: string,
    data: {
      name: string;
      photoUrl?: string;
      specialization?: string;
      bio?: string;
      isActive?: boolean;
    },
  ) {
    const gym = await this.requireGym(ownerId);
    return this.prisma.trainer.create({
      data: {
        name: data.name,
        photoUrl: data.photoUrl,
        specialization: data.specialization,
        bio: data.bio,
        isActive: data.isActive ?? true,
        gymId: gym.id,
      },
    });
  }

  async updateTrainer(
    ownerId: string,
    trainerId: string,
    data: {
      name?: string;
      photoUrl?: string;
      specialization?: string;
      bio?: string;
      isActive?: boolean;
    },
  ) {
    const gym = await this.requireGym(ownerId);
    const trainer = await this.prisma.trainer.findFirst({
      where: { id: trainerId, gymId: gym.id },
    });
    if (!trainer) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Trainer not found',
      });
    }
    return this.prisma.trainer.update({ where: { id: trainerId }, data });
  }

  async deleteTrainer(ownerId: string, trainerId: string) {
    const gym = await this.requireGym(ownerId);
    const trainer = await this.prisma.trainer.findFirst({
      where: { id: trainerId, gymId: gym.id },
    });
    if (!trainer) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Trainer not found',
      });
    }
    await this.prisma.trainer.delete({ where: { id: trainerId } });
    return { ok: true };
  }

  async listPlans(ownerId: string) {
    const gym = await this.requireGym(ownerId);
    return this.prisma.membershipPlan.findMany({ where: { gymId: gym.id } });
  }

  async createPlan(
    ownerId: string,
    data: {
      title: string;
      description?: string;
      priceAmd: number;
      durationDays?: number;
      isActive?: boolean;
    },
  ) {
    const gym = await this.requireGym(ownerId);
    return this.prisma.membershipPlan.create({
      data: { ...data, gymId: gym.id },
    });
  }

  async updatePlan(
    ownerId: string,
    planId: string,
    data: {
      title?: string;
      description?: string;
      priceAmd?: number;
      durationDays?: number;
      isActive?: boolean;
    },
  ) {
    const gym = await this.requireGym(ownerId);
    const plan = await this.prisma.membershipPlan.findFirst({
      where: { id: planId, gymId: gym.id },
    });
    if (!plan) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Plan not found',
      });
    }
    return this.prisma.membershipPlan.update({ where: { id: planId }, data });
  }

  async deletePlan(ownerId: string, planId: string) {
    const gym = await this.requireGym(ownerId);
    const plan = await this.prisma.membershipPlan.findFirst({
      where: { id: planId, gymId: gym.id },
    });
    if (!plan) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Plan not found',
      });
    }
    await this.prisma.membershipPlan.delete({ where: { id: planId } });
    return { ok: true };
  }

  async requireGym(ownerId: string) {
    const gym = await this.prisma.gym.findFirst({
      where: { ownerId },
      include: { media: true, trainers: true, plans: true },
    });
    if (!gym) {
      throw new ForbiddenException({
        code: API_ERROR_CODES.FORBIDDEN,
        message: 'No gym linked to this owner',
      });
    }
    return gym;
  }
}
