import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { API_ERROR_CODES, SUBSCRIPTION_PRICE_AMD } from '@gymhub/shared';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { OwnerService } from '../owner/owner.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownerService: OwnerService,
    private readonly config: ConfigService,
  ) {}

  private get priceAmd() {
    return Number(
      this.config.get('SUBSCRIPTION_PRICE_AMD') ?? SUBSCRIPTION_PRICE_AMD,
    );
  }

  async getMine(ownerId: string) {
    const gym = await this.ownerService.requireGym(ownerId);
    const subscription = await this.prisma.gymSubscription.findFirst({
      where: { gymId: gym.id },
      orderBy: { endsAt: 'desc' },
    });
    return {
      gymId: gym.id,
      priceAmd: this.priceAmd,
      subscription,
    };
  }

  async checkout(ownerId: string) {
    const gym = await this.ownerService.requireGym(ownerId);
    const providerRef = `manual_${randomUUID()}`;
    const payment = await this.prisma.payment.create({
      data: {
        gymId: gym.id,
        amountAmd: this.priceAmd,
        status: 'PENDING',
        provider: 'manual',
        providerRef,
      },
    });

    // Manual provider: activate immediately (until real GW)
    return this.activateFromPayment(providerRef, payment.id);
  }

  async webhook(providerRef: string) {
    return this.activateFromPayment(providerRef);
  }

  private async activateFromPayment(providerRef: string, paymentId?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: paymentId ? { id: paymentId } : { providerRef },
    });
    if (!payment) {
      throw new NotFoundException({
        code: API_ERROR_CODES.NOT_FOUND,
        message: 'Payment not found',
      });
    }

    if (payment.status === 'PAID' && payment.subscriptionId) {
      return this.prisma.gymSubscription.findUnique({
        where: { id: payment.subscriptionId },
      });
    }

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + 1);

    const subscription = await this.prisma.gymSubscription.create({
      data: {
        gymId: payment.gymId,
        status: 'ACTIVE',
        priceAmd: payment.amountAmd,
        startsAt,
        endsAt,
      },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        subscriptionId: subscription.id,
        providerRef: payment.providerRef ?? providerRef,
      },
    });

    return subscription;
  }

  async adminActivate(gymId: string, months = 1, actorId: string) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + months);

    const subscription = await this.prisma.gymSubscription.create({
      data: {
        gymId,
        status: 'ACTIVE',
        priceAmd: this.priceAmd,
        startsAt,
        endsAt,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action: 'SUBSCRIPTION_ACTIVATE',
        entityType: 'GymSubscription',
        entityId: subscription.id,
        meta: { gymId, months },
      },
    });

    return subscription;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireSubscriptions() {
    const now = new Date();
    await this.prisma.gymSubscription.updateMany({
      where: { status: 'ACTIVE', endsAt: { lte: now } },
      data: { status: 'EXPIRED' },
    });
  }
}
