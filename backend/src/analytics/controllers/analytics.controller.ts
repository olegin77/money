import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(
    @CurrentUser() user: CurrentUserData,
    @Query() query: DashboardQueryDto
  ) {
    const dashboard = await this.analyticsService.getDashboard(
      user.id,
      query.startDate,
      query.endDate,
      query.period
    );

    return {
      success: true,
      data: dashboard,
    };
  }

  @Get('expenses/by-category')
  async getExpensesByCategory(
    @CurrentUser() user: CurrentUserData,
    @Query() query: DashboardQueryDto
  ) {
    const { startDate, endDate, period } = query;
    const dateRange = period
      ? this.getDateRangeForPeriod(period)
      : { start: startDate, end: endDate };

    const data = await this.analyticsService.getExpensesByCategory(
      user.id,
      dateRange.start || startDate,
      dateRange.end || endDate
    );

    return {
      success: true,
      data,
    };
  }

  @Get('expenses/trend')
  async getExpensesTrend(
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: string
  ) {
    const data = await this.analyticsService.getExpensesTrend(
      user.id,
      startDate,
      endDate,
      groupBy
    );

    return {
      success: true,
      data,
    };
  }

  @Get('income/trend')
  async getIncomeTrend(
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: string
  ) {
    const data = await this.analyticsService.getIncomeTrend(user.id, startDate, endDate, groupBy);

    return {
      success: true,
      data,
    };
  }

  @Get('cash-flow')
  async getCashFlow(
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const data = await this.analyticsService.getCashFlow(user.id, startDate, endDate);

    return {
      success: true,
      data,
    };
  }

  @Get('monthly-comparison')
  async getMonthlyComparison(
    @CurrentUser() user: CurrentUserData,
    @Query('months') months?: number
  ) {
    const data = await this.analyticsService.getMonthlyComparison(
      user.id,
      months ? Number(months) : 6
    );

    return {
      success: true,
      data,
    };
  }

  private getDateRangeForPeriod(period: string): { start: string; end: string } {
    const now = new Date();
    let start: Date;

    switch (period) {
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        start = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        start = new Date(now.setDate(now.getDate() - 30));
    }

    return {
      start: start.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    };
  }
}
