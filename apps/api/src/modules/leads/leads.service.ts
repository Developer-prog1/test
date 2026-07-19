import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { API_ERROR_CODES } from '@gymhub/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { OwnerService } from '../owner/owner.service';

function normalizeAmPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('374') && digits.length >= 11) {
    return `+${digits.slice(0, 11)}`;
  }
  if (digits.startsWith('0') && digits.length === 9) {
    return `+374${digits.slice(1)}`;
  }
  if (digits.length === 8) {
    return `+374${digits}`;
  }
  return phone.trim();
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownerService: OwnerService,
  ) {}

  async create(input: {
    gymId: string;
    name: string;
    phone: string;
    note?: string;
    wantsTrialDay?: boolean;
    honeypot?: string;
    userId?: string;
  }) {
    if (input.honeypot) {
      return { ok: true };
    }

    const now = new Date();
    const gym = await this.prisma.gym.findFirst({
      where: {
        id: input.gymId,
        moderationStatus: 'APPROVED',
        subscriptions: {
          some: { status: 'ACTIVE', endsAt: { gt: now } },
        },
      },
      include: { owner: true },
    });

    if (!gym) {
      throw new NotFoundException({
        code: API_ERROR_CODES.GYM_NOT_PUBLIC,
        message: 'Gym is not accepting leads',
      });
    }

    const phone = normalizeAmPhone(input.phone);
    if (!/^\+374\d{8}$/.test(phone)) {
      throw new BadRequestException({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid Armenian phone number',
      });
    }

    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const duplicate = await this.prisma.lead.findFirst({
      where: {
        gymId: gym.id,
        phone,
        createdAt: { gte: dayAgo },
      },
    });
    if (duplicate) {
      throw new ConflictException({
        code: API_ERROR_CODES.LEAD_DUPLICATE,
        message: 'Lead already submitted for this gym in the last 24 hours',
      });
    }

    const lead = await this.prisma.lead.create({
      data: {
        gymId: gym.id,
        userId: input.userId,
        name: input.name.trim(),
        phone,
        note: input.note,
        wantsTrialDay: Boolean(input.wantsTrialDay),
      },
    });

    // Email notify stub — logs when Resend key missing
    if (process.env.RESEND_API_KEY && gym.owner.email) {
      // Wiring reserved for Resend client
    } else {
      console.info('[leads] notify stub', {
        gymId: gym.id,
        ownerEmail: gym.owner.email,
        leadId: lead.id,
      });
    }

    return lead;
  }

  async listForOwner(ownerId: string) {
    const gym = await this.ownerService.requireGym(ownerId);
    return this.prisma.lead.findMany({
      where: { gymId: gym.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    ownerId: string,
    leadId: string,
    status: 'NEW' | 'READ' | 'ARCHIVED',
  ) {
    const gym = await this.ownerService.requireGym(ownerId);
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, gymId: gym.id },
    });
    if (!lead) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Lead not found',
      });
    }
    return this.prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });
  }
}
