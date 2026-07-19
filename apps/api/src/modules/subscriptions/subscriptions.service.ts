import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  API_ERROR_CODES,
  LISTING_PACKAGES,
  SUBSCRIPTION_PRICE_AMD,
} from '@gymhub/shared';
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

  /** Ensure default packages exist (first boot / empty table). */
  async ensureDefaultPackages() {
    const count = await this.prisma.listingPackage.count();
    if (count > 0) return;

    await this.prisma.listingPackage.createMany({
      data: LISTING_PACKAGES.map((item, index) => ({
        code: item.id,
        months: item.months,
        priceAmd: item.priceAmd,
        popular: item.popular,
        isActive: true,
        sortOrder: index,
      })),
    });
  }

  async listActivePackages() {
    await this.ensureDefaultPackages();
    return this.prisma.listingPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { months: 'asc' }],
    });
  }

  async listAllPackages() {
    await this.ensureDefaultPackages();
    return this.prisma.listingPackage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { months: 'asc' }],
    });
  }

  private async resolvePackage(packageId?: string) {
    await this.ensureDefaultPackages();

    if (packageId) {
      const byId = await this.prisma.listingPackage.findFirst({
        where: { id: packageId, isActive: true },
      });
      if (byId) return byId;

      const byCode = await this.prisma.listingPackage.findFirst({
        where: { code: packageId, isActive: true },
      });
      if (byCode) return byCode;
    }

    const fallback = await this.prisma.listingPackage.findFirst({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { months: 'asc' }],
    });
    if (!fallback) {
      throw new BadRequestException({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: 'No listing packages configured',
      });
    }
    return fallback;
  }

  async getMine(ownerId: string) {
    const gym = await this.ownerService.requireGym(ownerId);
    const [subscription, packages] = await Promise.all([
      this.prisma.gymSubscription.findFirst({
        where: { gymId: gym.id },
        orderBy: { endsAt: 'desc' },
      }),
      this.listActivePackages(),
    ]);

    return {
      gymId: gym.id,
      priceAmd: this.priceAmd,
      packages: packages.map((item) => ({
        id: item.id,
        code: item.code,
        months: item.months,
        priceAmd: item.priceAmd,
        popular: item.popular,
      })),
      subscription,
    };
  }

  async checkout(ownerId: string, packageId?: string) {
    const pack = await this.resolvePackage(packageId);
    const gym = await this.ownerService.requireGym(ownerId);
    const providerRef = `manual_${randomUUID()}`;
    const payment = await this.prisma.payment.create({
      data: {
        gymId: gym.id,
        amountAmd: pack.priceAmd,
        status: 'PENDING',
        provider: 'manual',
        providerRef,
      },
    });

    // Manual provider: activate immediately (until real GW)
    return this.activateFromPayment(providerRef, payment.id, pack.months);
  }

  async webhook(providerRef: string) {
    return this.activateFromPayment(providerRef);
  }

  private async activateFromPayment(
    providerRef: string,
    paymentId?: string,
    months = 1,
  ) {
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

    const now = new Date();
    const active = await this.prisma.gymSubscription.findFirst({
      where: {
        gymId: payment.gymId,
        status: 'ACTIVE',
        endsAt: { gt: now },
      },
      orderBy: { endsAt: 'desc' },
    });

    const startsAt =
      active && active.endsAt.getTime() > now.getTime()
        ? new Date(active.endsAt)
        : now;
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + months);

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
    const now = new Date();
    const active = await this.prisma.gymSubscription.findFirst({
      where: {
        gymId,
        status: 'ACTIVE',
        endsAt: { gt: now },
      },
      orderBy: { endsAt: 'desc' },
    });

    const startsAt =
      active && active.endsAt.getTime() > now.getTime()
        ? new Date(active.endsAt)
        : now;
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + months);

    const subscription = await this.prisma.gymSubscription.create({
      data: {
        gymId,
        status: 'ACTIVE',
        priceAmd: this.priceAmd * months,
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
