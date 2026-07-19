import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { LISTING_PACKAGES, ROLES } from '@gymhub/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubscriptionsService } from './subscriptions.service';

const PACKAGE_IDS: string[] = LISTING_PACKAGES.map((item) => item.id);

class CheckoutDto {
  @IsOptional()
  @IsString()
  @IsIn(PACKAGE_IDS)
  packageId?: string;
}

class WebhookDto {
  @IsString()
  providerRef!: string;
}

@ApiTags('subscriptions')
@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.GYM_OWNER, ROLES.ADMIN)
  @Get('owner/subscription')
  mine(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.getMine(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.GYM_OWNER, ROLES.ADMIN)
  @Post('owner/subscription/checkout')
  checkout(
    @CurrentUser() user: { id: string },
    @Body() dto: CheckoutDto,
  ) {
    return this.subscriptionsService.checkout(user.id, dto.packageId);
  }

  @Post('owner/subscription/webhook')
  webhook(@Body() dto: WebhookDto) {
    return this.subscriptionsService.webhook(dto.providerRef);
  }
}
