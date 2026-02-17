import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpensesService } from './services/expenses.service';
import { Expense } from './entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
