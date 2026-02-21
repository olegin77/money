import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AnalyticsWriteService } from '../services/analytics-write.service';
import {
  ExpenseCreatedEvent,
  ExpenseUpdatedEvent,
  ExpenseDeletedEvent,
} from '../../common/events/expense.events';
import {
  IncomeCreatedEvent,
  IncomeUpdatedEvent,
  IncomeDeletedEvent,
} from '../../common/events/income.events';

/**
 * Event listener that delegates all write-side analytics work
 * (cache invalidation + debounced MV refresh) to AnalyticsWriteService.
 */
@Injectable()
export class AnalyticsCacheListener {
  constructor(private readonly writeService: AnalyticsWriteService) {}

  @OnEvent('expense.created')
  async handleExpenseCreated(event: ExpenseCreatedEvent): Promise<void> {
    await this.writeService.handleWriteEvent(event.userId);
  }

  @OnEvent('expense.updated')
  async handleExpenseUpdated(event: ExpenseUpdatedEvent): Promise<void> {
    await this.writeService.handleWriteEvent(event.userId);
  }

  @OnEvent('expense.deleted')
  async handleExpenseDeleted(event: ExpenseDeletedEvent): Promise<void> {
    await this.writeService.handleWriteEvent(event.userId);
  }

  @OnEvent('income.created')
  async handleIncomeCreated(event: IncomeCreatedEvent): Promise<void> {
    await this.writeService.handleWriteEvent(event.userId);
  }

  @OnEvent('income.updated')
  async handleIncomeUpdated(event: IncomeUpdatedEvent): Promise<void> {
    await this.writeService.handleWriteEvent(event.userId);
  }

  @OnEvent('income.deleted')
  async handleIncomeDeleted(event: IncomeDeletedEvent): Promise<void> {
    await this.writeService.handleWriteEvent(event.userId);
  }
}
