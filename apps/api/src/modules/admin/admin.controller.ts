import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ROLES } from '@gymhub/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminCreateGymDto, AdminUpdateGymDto } from './admin-gym.dto';
import { AdminService } from './admin.service';

class ModerateDto {
  @IsEnum(['APPROVED', 'REJECTED'] as const)
  status!: 'APPROVED' | 'REJECTED';
}

class FeaturedDto {
  @IsBoolean()
  isFeatured!: boolean;
}

class ActivateSubDto {
  @IsString()
  gymId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  months?: number;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('owners')
  listOwners() {
    return this.adminService.listOwners();
  }

  @Get('gyms')
  listGyms(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listGyms(
      Number(page ?? 1),
      Number(limit ?? 20),
      status,
    );
  }

  @Get('gyms/:id')
  getGym(@Param('id') id: string) {
    return this.adminService.getGym(id);
  }

  @Post('gyms')
  createGym(
    @CurrentUser() user: { id: string },
    @Body() dto: AdminCreateGymDto,
  ) {
    return this.adminService.createGymForOwner(user.id, dto);
  }

  @Patch('gyms/:id')
  updateGym(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AdminUpdateGymDto,
  ) {
    return this.adminService.updateGym(user.id, id, dto);
  }

  @Patch('gyms/:id/moderation')
  moderate(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ModerateDto,
  ) {
    return this.adminService.moderate(user.id, id, dto.status);
  }

  @Patch('gyms/:id/featured')
  featured(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: FeaturedDto,
  ) {
    return this.adminService.setFeatured(user.id, id, dto.isFeatured);
  }

  @Get('subscriptions')
  subscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listSubscriptions(
      Number(page ?? 1),
      Number(limit ?? 20),
    );
  }

  @Post('subscriptions/activate')
  activate(@CurrentUser() user: { id: string }, @Body() dto: ActivateSubDto) {
    return this.adminService.activateSubscription(
      user.id,
      dto.gymId,
      dto.months ?? 1,
    );
  }

  @Get('audit')
  audit() {
    return this.adminService.recentAudit();
  }
}
