import { Module } from '@nestjs/common';
import { OwnerModule } from '../owner/owner.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [OwnerModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
