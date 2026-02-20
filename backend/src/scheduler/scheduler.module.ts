import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../income/entities/income.entity';
import { CurrencyRate } from '../common/entities/currency-rate.entity';
import { Perimeter } from '../perimeters/entities/perimeter.entity';
import { User } from '../users/entities/user.entity';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransactionsProcessor } from './recurring-transactions.processor';
import { CurrencyRatesService } from './currency-rates.service';
import { CurrencyRatesController } from './currency-rates.controller';
import { AccountCleanupService } from './account-cleanup.service';
import { BudgetAlertService } from './budget-alert.service';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Income, CurrencyRate, Perimeter, User]),
    BullModule.registerQueue({
      name: 'recurring-transactions',
    }),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [CurrencyRatesController],
  providers: [
    RecurringTransactionsService,
    RecurringTransactionsProcessor,
    CurrencyRatesService,
    AccountCleanupService,
    BudgetAlertService,
  ],
  exports: [CurrencyRatesService],
})
export class SchedulerModule {}
