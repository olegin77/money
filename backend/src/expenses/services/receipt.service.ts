import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { VirusScanService } from '../../common/services/virus-scan.service';

const RECEIPT_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_WIDTH = 1200;

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);
  private readonly receiptsDir: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly virusScanService: VirusScanService,
  ) {
    const uploadDir =
      this.configService.get('UPLOAD_DIR') ||
      path.join(process.cwd(), 'uploads');
    this.receiptsDir = path.join(uploadDir, 'receipts');

    if (!fs.existsSync(this.receiptsDir)) {
      fs.mkdirSync(this.receiptsDir, { recursive: true });
    }
  }

  /**
   * Validates and saves a receipt file, runs virus scan, optional image optimization.
   * Returns the relative path for DB storage.
   */
  async saveReceipt(
    file: Express.Multer.File,
    userId: string,
    expenseId: string,
  ): Promise<string> {
    // --- Validate mime type ---
    if (!RECEIPT_ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Accepted: jpg, png, pdf`,
      );
    }

    // --- Validate size ---
    if (file.size > MAX_RECEIPT_SIZE) {
      throw new BadRequestException(
        `File size exceeds the 5 MB limit (got ${(file.size / 1024 / 1024).toFixed(1)} MB)`,
      );
    }

    // Write temp file for virus scan
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const filename = `${uuidv4()}${ext}`;
    const userDir = path.join(this.receiptsDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    const filePath = path.join(userDir, filename);

    let buffer = file.buffer;

    // --- Image optimization (sharp, if available) ---
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png'
    ) {
      buffer = await this.optimizeImage(buffer);
    }

    fs.writeFileSync(filePath, buffer);

    // --- Virus scan ---
    const scanResult = await this.virusScanService.scanFile(filePath);
    if (!scanResult.clean) {
      // Remove infected file immediately
      fs.unlinkSync(filePath);
      throw new BadRequestException(
        `File rejected by virus scan: ${scanResult.reason}`,
      );
    }

    const relativePath = `receipts/${userId}/${filename}`;
    this.logger.log(
      `Receipt saved for expense ${expenseId}: ${relativePath}`,
    );
    return relativePath;
  }

  /**
   * Returns the absolute path for a stored receipt, or throws 404.
   */
  getReceiptAbsolutePath(receiptUrl: string): string {
    const uploadDir =
      this.configService.get('UPLOAD_DIR') ||
      path.join(process.cwd(), 'uploads');
    const absPath = path.join(uploadDir, receiptUrl);

    // Prevent path traversal
    const resolved = path.resolve(absPath);
    const resolvedUploadDir = path.resolve(uploadDir);
    if (!resolved.startsWith(resolvedUploadDir)) {
      throw new BadRequestException('Invalid receipt path');
    }

    if (!fs.existsSync(absPath)) {
      throw new NotFoundException('Receipt file not found');
    }
    return absPath;
  }

  /**
   * Deletes a receipt file from disk.
   */
  deleteReceipt(receiptUrl: string): void {
    try {
      const absPath = this.getReceiptAbsolutePath(receiptUrl);
      fs.unlinkSync(absPath);
    } catch {
      this.logger.warn(`Could not delete receipt file: ${receiptUrl}`);
    }
  }

  /**
   * Optimizes an image buffer: resize to max 1200px width (if sharp is available).
   * Falls back gracefully if sharp is not installed.
   */
  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      // Dynamic import — sharp is an optional dependency
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sharp = require('sharp');
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.width > MAX_IMAGE_WIDTH) {
        const optimized = await sharp(buffer)
          .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
          .toBuffer();
        this.logger.debug(
          `Image resized from ${metadata.width}px to ${MAX_IMAGE_WIDTH}px`,
        );
        return optimized;
      }
      return buffer;
    } catch {
      this.logger.warn(
        'sharp is not installed — skipping image optimization',
      );
      return buffer;
    }
  }
}
