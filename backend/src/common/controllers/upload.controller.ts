import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '../decorators/api-error-responses.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { UploadService } from '../services/upload.service';

@ApiTags('Upload')
@ApiErrorResponses()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5242880 } }))
  async uploadFile(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File
  ) {
    const result = await this.uploadService.saveFile(file, user.id);
    return { success: true, data: result };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fileSize: 5242880 } }))
  async uploadMultiple(
    @CurrentUser() user: CurrentUserData,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const results = await Promise.all(
      files.map(file => this.uploadService.saveFile(file, user.id))
    );
    return { success: true, data: results };
  }
}
