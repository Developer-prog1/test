import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ROLES } from '@gymhub/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OwnerService } from './owner.service';

class UpdateGymDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsObject() workingHours?: Record<string, unknown>;
  @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];
}

class TrainerDto {
  @IsString() name!: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() bio?: string;
}

class UpdateTrainerDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() bio?: string;
}

class PlanDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsInt() @Min(0) priceAmd!: number;
  @IsOptional() @IsInt() durationDays?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class UpdatePlanDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) priceAmd?: number;
  @IsOptional() @IsInt() durationDays?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@ApiTags('owner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.GYM_OWNER, ROLES.ADMIN)
@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('gym')
  getGym(@CurrentUser() user: { id: string }) {
    return this.ownerService.getMyGym(user.id);
  }

  @Patch('gym')
  updateGym(@CurrentUser() user: { id: string }, @Body() dto: UpdateGymDto) {
    return this.ownerService.updateGym(user.id, dto);
  }

  @Post('gym/submit')
  submit(@CurrentUser() user: { id: string }) {
    return this.ownerService.submitForModeration(user.id);
  }

  @Get('trainers')
  trainers(@CurrentUser() user: { id: string }) {
    return this.ownerService.listTrainers(user.id);
  }

  @Post('trainers')
  createTrainer(@CurrentUser() user: { id: string }, @Body() dto: TrainerDto) {
    return this.ownerService.createTrainer(user.id, dto);
  }

  @Patch('trainers/:id')
  updateTrainer(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateTrainerDto,
  ) {
    return this.ownerService.updateTrainer(user.id, id, dto);
  }

  @Delete('trainers/:id')
  deleteTrainer(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ownerService.deleteTrainer(user.id, id);
  }

  @Get('plans')
  plans(@CurrentUser() user: { id: string }) {
    return this.ownerService.listPlans(user.id);
  }

  @Post('plans')
  createPlan(@CurrentUser() user: { id: string }, @Body() dto: PlanDto) {
    return this.ownerService.createPlan(user.id, dto);
  }

  @Patch('plans/:id')
  updatePlan(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.ownerService.updatePlan(user.id, id, dto);
  }

  @Delete('plans/:id')
  deletePlan(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ownerService.deletePlan(user.id, id);
  }
}
