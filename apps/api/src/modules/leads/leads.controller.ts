import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ROLES } from '@gymhub/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LeadsService } from './leads.service';

class CreateLeadDto {
  @IsString()
  gymId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  wantsTrialDay?: boolean;

  @IsOptional()
  @IsString()
  website?: string;
}

class UpdateLeadDto {
  @IsEnum(['NEW', 'READ', 'ARCHIVED'] as const)
  status!: 'NEW' | 'READ' | 'ARCHIVED';
}

@ApiTags('leads')
@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('leads')
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create({
      gymId: dto.gymId,
      name: dto.name,
      phone: dto.phone,
      note: dto.note,
      wantsTrialDay: dto.wantsTrialDay,
      honeypot: dto.website,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.GYM_OWNER, ROLES.ADMIN)
  @Get('owner/leads')
  list(@CurrentUser() user: { id: string }) {
    return this.leadsService.listForOwner(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.GYM_OWNER, ROLES.ADMIN)
  @Patch('owner/leads/:id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.updateStatus(user.id, id, dto.status);
  }
}
