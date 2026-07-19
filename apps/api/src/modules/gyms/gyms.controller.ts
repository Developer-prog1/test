import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { GymsService } from './gyms.service';

class ListGymsQueryDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  amenity?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

@ApiTags('gyms')
@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @Get()
  list(@Query() query: ListGymsQueryDto) {
    return this.gymsService.listPublic(query);
  }

  @Get('featured/weekly')
  featured() {
    return this.gymsService.getFeatured(6);
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.gymsService.getBySlug(slug);
  }
}
