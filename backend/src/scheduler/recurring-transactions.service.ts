import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../income/entities/income.entity';

interface RecurRule {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  day?: number;
}

@Injectable()
export class RecurringTransactionsService {
  private readonly logger = new Logger(RecurringTransactionsService.name);

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleRecurringTransactions() {
    this.logger.log('Starting recurring transactions processing...');

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    try {
      const [expenseCount, incomeCount] = await Promise.all([
        this.processRecurringExpenses(today, dateStr),
        this.processRecurringIncome(today, dateStr),
      ]);

      this.logger.log(
        `Recurring transactions complete: ${expenseCount} expenses, ${incomeCount} income created`,
      );
    } catch (error) {
      this.logger.error('Failed to process recurring transactions', error);
    }
  }

  private async processRecurringExpenses(
    today: Date,
    dateStr: string,
  ): Promise<number> {
    const recurringExpenses = await this.expenseRepository.find({
      where: { isRecurring: true },
    });

    let created = 0;

    for (const expense of recurringExpenses) {
      if (!expense.recurrenceRule) continue;

      try {
        const rule: RecurRule = JSON.parse(expense.recurrenceRule);
        if (!this.shouldRunToday(rule, today)) continue;

        const newExpense = this.expenseRepository.create({
          amount: expense.amount,
          currency: expense.currency,
          description: expense.description,
          categoryId: expense.categoryId,
          date: dateStr as unknown as Date,
          paymentMethod: expense.paymentMethod,
          location: expense.location,
          tags: expense.tags,
          userId: expense.userId,
          isRecurring: false,
        });

        await this.expenseRepository.save(newExpense);
        created++;
      } catch (error) {
        this.logger.warn(
          `Failed to process recurring expense ${expense.id}: ${error}`,
        );
      }
    }

    return created;
  }

  private async processRecurringIncome(
    today: Date,
    dateStr: string,
  ): Promise<number> {
    const recurringIncome = await this.incomeRepository.find({
      where: { isRecurring: true },
    });

    let created = 0;

    for (const income of recurringIncome) {
      if (!income.recurrenceRule) continue;

      try {
        const rule: RecurRule = JSON.parse(income.recurrenceRule);
        if (!this.shouldRunToday(rule, today)) continue;

        const newIncome = this.incomeRepository.create({
          amount: income.amount,
          currency: income.currency,
          description: income.description,
          source: income.source,
          date: dateStr as unknown as Date,
          userId: income.userId,
          isRecurring: false,
        });

        await this.incomeRepository.save(newIncome);
        created++;
      } catch (error) {
        this.logger.warn(
          `Failed to process recurring income ${income.id}: ${error}`,
        );
      }
    }

    return created;
  }

  private shouldRunToday(rule: RecurRule, today: Date): boolean {
    const dayOfWeek = today.getDay(); // 0=Sunday
    const dayOfMonth = today.getDate();
    const month = today.getMonth(); // 0-indexed

    switch (rule.period) {
      case 'daily':
        return true;

      case 'weekly':
        // Run on the same day of week as original (default Monday=1)
        return dayOfWeek === (rule.day ?? 1);

      case 'monthly':
        // Run on specified day of month (default 1st)
        return dayOfMonth === (rule.day ?? 1);

      case 'yearly':
        // Run on Jan 1 (or specified day in January)
        return month === 0 && dayOfMonth === (rule.day ?? 1);

      default:
        return false;
    }
  }
}
