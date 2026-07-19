import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ROLES } from '@gymhub/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubscriptionsService } from './subscriptions.service';

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
  checkout(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.checkout(user.id);
  }

  @Post('owner/subscription/webhook')
  webhook(@Body() dto: WebhookDto) {
    return this.subscriptionsService.webhook(dto.providerRef);
  }
}
