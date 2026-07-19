import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { GymsService } from './gyms.service';

class ListTrainersQueryDto {
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

@ApiTags('trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly gymsService: GymsService) {}

  @Get()
  list(@Query() query: ListTrainersQueryDto) {
    return this.gymsService.listPublicTrainers(query);
  }
}
