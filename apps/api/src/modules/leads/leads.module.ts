import { Module } from '@nestjs/common';
import { OwnerModule } from '../owner/owner.module';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [OwnerModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
