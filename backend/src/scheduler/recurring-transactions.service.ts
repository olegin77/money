import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class RecurringTransactionsService {
  private readonly logger = new Logger(RecurringTransactionsService.name);

  constructor(
    @InjectQueue('recurring-transactions')
    private readonly recurringQueue: Queue
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleRecurringTransactions() {
    this.logger.log('Scheduling recurring transactions job via BullMQ queue...');

    try {
      await this.recurringQueue.add(
        'process-recurring',
        {},
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      this.logger.log('Recurring transactions job added to queue');
    } catch (error) {
      this.logger.error('Failed to enqueue recurring transactions job', error);
    }
  }
}
