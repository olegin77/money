import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsReadService } from './services/analytics-read.service';
import { AnalyticsWriteService } from './services/analytics-write.service';
import { AnalyticsCacheListener } from './listeners/analytics-cache.listener';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../income/entities/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Income])],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsReadService,
    AnalyticsWriteService,
    AnalyticsService,
    AnalyticsCacheListener,
  ],
  exports: [AnalyticsService, AnalyticsReadService, AnalyticsWriteService],
})
export class AnalyticsModule {}
