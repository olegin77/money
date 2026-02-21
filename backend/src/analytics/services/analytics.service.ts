import { Injectable } from '@nestjs/common';
import { AnalyticsReadService } from './analytics-read.service';
import { AnalyticsWriteService } from './analytics-write.service';

/**
 * Main AnalyticsService facade — delegates to AnalyticsReadService / AnalyticsWriteService.
 * Preserves the original public API so controllers remain unchanged.
 */
@Injectable()
export class AnalyticsService {
  constructor(
    private readonly readService: AnalyticsReadService,
    private readonly writeService: AnalyticsWriteService
  ) {}

  // --- Read operations — delegated to AnalyticsReadService ---

  async getDashboard(userId: string, startDate?: string, endDate?: string, period?: string) {
    return this.readService.getDashboard(userId, startDate, endDate, period);
  }

  async getExpensesByCategory(userId: string, startDate: string, endDate: string) {
    return this.readService.getExpensesByCategory(userId, startDate, endDate);
  }

  async getExpensesTrend(userId: string, startDate?: string, endDate?: string, groupBy = 'day') {
    return this.readService.getExpensesTrend(userId, startDate, endDate, groupBy);
  }

  async getIncomeTrend(userId: string, startDate?: string, endDate?: string, groupBy = 'day') {
    return this.readService.getIncomeTrend(userId, startDate, endDate, groupBy);
  }

  async getCashFlow(userId: string, startDate?: string, endDate?: string) {
    return this.readService.getCashFlow(userId, startDate, endDate);
  }

  async getMonthlyComparison(userId: string, months = 6) {
    return this.readService.getMonthlyComparison(userId, months);
  }

  // --- Write operations — delegated to AnalyticsWriteService ---

  async handleWriteEvent(userId: string): Promise<void> {
    return this.writeService.handleWriteEvent(userId);
  }

  async refreshMaterializedViews(): Promise<void> {
    return this.writeService.refreshMaterializedViews();
  }
}
