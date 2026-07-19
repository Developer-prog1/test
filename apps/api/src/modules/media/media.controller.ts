import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ROLES } from '@gymhub/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MediaService } from './media.service';

@ApiTags('owner-media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.GYM_OWNER, ROLES.ADMIN)
@Controller('owner/gym/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.mediaService.list(user.id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        kind: { type: 'string', enum: ['cover', 'gallery'] },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Query('kind') kind?: 'cover' | 'gallery',
  ) {
    return this.mediaService.upload(user.id, file, kind ?? 'gallery');
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.mediaService.remove(user.id, id);
  }
}
