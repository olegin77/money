import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../income/entities/income.entity';
import { CurrencyRate } from '../common/entities/currency-rate.entity';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CurrencyRatesService } from './currency-rates.service';
import { CurrencyRatesController } from './currency-rates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Income, CurrencyRate])],
  controllers: [CurrencyRatesController],
  providers: [RecurringTransactionsService, CurrencyRatesService],
  exports: [CurrencyRatesService],
})
export class SchedulerModule {}
