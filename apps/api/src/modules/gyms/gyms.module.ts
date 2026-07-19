import { Module } from '@nestjs/common';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';
import { TrainersController } from './trainers.controller';

@Module({
  controllers: [GymsController, TrainersController],
  providers: [GymsService],
  exports: [GymsService],
})
export class GymsModule {}
