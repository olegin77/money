import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class VirusScanService {
  private readonly logger = new Logger(VirusScanService.name);
  private clamAvailable: boolean | null = null;

  /**
   * Checks whether ClamAV (clamscan) is available on the system.
   * Caches the result after the first probe.
   */
  private async isClamAvailable(): Promise<boolean> {
    if (this.clamAvailable !== null) {
      return this.clamAvailable;
    }

    try {
      await execFileAsync('clamscan', ['--version']);
      this.clamAvailable = true;
      this.logger.log('ClamAV detected — virus scanning enabled');
    } catch {
      this.clamAvailable = false;
      this.logger.warn(
        'ClamAV (clamscan) not found — virus scanning disabled. ' +
          'Install ClamAV for production use.',
      );
    }

    return this.clamAvailable;
  }

  /**
   * Scans a file for viruses using ClamAV.
   * Returns `{ clean: true }` when ClamAV is unavailable (graceful degradation).
   * Returns `{ clean: false, reason }` when malware is detected.
   */
  async scanFile(
    filePath: string,
  ): Promise<{ clean: boolean; reason?: string }> {
    const available = await this.isClamAvailable();

    if (!available) {
      this.logger.warn(
        `Skipping virus scan for ${filePath} — ClamAV not installed`,
      );
      return { clean: true };
    }

    try {
      // --no-summary suppresses the summary line, exit code 0 = clean
      await execFileAsync('clamscan', ['--no-summary', filePath]);
      this.logger.debug(`Virus scan passed: ${filePath}`);
      return { clean: true };
    } catch (error: unknown) {
      const err = error as { code?: number; stdout?: string };
      // Exit code 1 = virus found, 2 = error
      if (err.code === 1) {
        const reason =
          (typeof err.stdout === 'string' && err.stdout.trim()) ||
          'Malware detected';
        this.logger.error(`Virus detected in ${filePath}: ${reason}`);
        return { clean: false, reason };
      }
      // Any other error — treat as scan failure, log and allow
      this.logger.warn(
        `Virus scan error for ${filePath}, allowing file (scan inconclusive)`,
      );
      return { clean: true };
    }
  }
}
