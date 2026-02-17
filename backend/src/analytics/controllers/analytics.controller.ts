import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return { message: 'Get dashboard analytics - TODO' };
  }

  @Get('expenses/by-category')
  getExpensesByCategory() {
    return { message: 'Get expenses by category - TODO' };
  }
}
