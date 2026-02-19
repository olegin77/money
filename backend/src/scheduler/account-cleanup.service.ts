import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class AccountCleanupService {
  private readonly logger = new Logger(AccountCleanupService.name);

  constructor(private readonly usersService: UsersService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeDeletedAccounts() {
    try {
      const count = await this.usersService.purgeScheduledDeletions();
      if (count > 0) {
        this.logger.log(`Purged ${count} accounts past 30-day grace period`);
      }
    } catch (error) {
      this.logger.error('Failed to purge scheduled deletions', error);
    }
  }
}
