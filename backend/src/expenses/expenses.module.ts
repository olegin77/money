import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpensesService } from './services/expenses.service';
import { ReceiptService } from './services/receipt.service';
import { Expense } from './entities/expense.entity';
import { VirusScanService } from '../common/services/virus-scan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [ExpensesController],
  providers: [ExpensesService, ReceiptService, VirusScanService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
