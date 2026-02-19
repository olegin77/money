import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
  ];

  constructor(private readonly configService: ConfigService) {
    this.uploadDir =
      this.configService.get('UPLOAD_DIR') ||
      path.join(process.cwd(), 'uploads');
    this.maxFileSize =
      parseInt(this.configService.get('MAX_FILE_SIZE') || '5242880', 10); // 5MB

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ filename: string; path: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed. Allowed: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${Math.round(this.maxFileSize / 1024 / 1024)}MB`,
      );
    }

    // Create user-specific subdirectory
    const userDir = path.join(this.uploadDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(userDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const appUrl =
      this.configService.get('API_URL') || 'http://localhost:4000';

    return {
      filename,
      path: `${userId}/${filename}`,
      url: `${appUrl}/uploads/${userId}/${filename}`,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
