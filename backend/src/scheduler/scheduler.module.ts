import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../income/entities/income.entity';
import { RecurringTransactionsService } from './recurring-transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Income])],
  providers: [RecurringTransactionsService],
})
export class SchedulerModule {}
