import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';
import { Income } from '../../income/entities/income.entity';
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  endOfWeek,
  endOfMonth,
  format,
} from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>
  ) {}

  async getDashboard(userId: string, startDate?: string, endDate?: string, period?: string) {
    // Calculate date range based on period
    const dateRange = this.calculateDateRange(period);
    const actualStartDate = startDate || dateRange.start;
    const actualEndDate = endDate || dateRange.end;

    // Calculate previous period range for comparison
    const previousRange = this.calculatePreviousPeriodRange(period, actualStartDate, actualEndDate);

    // Run queries in parallel for better performance
    const [
      expenses,
      incomes,
      expensesByCategory,
      topExpenses,
      recentTransactions,
      previousExpenses,
      previousIncomes,
    ] = await Promise.all([
      this.getExpensesInRange(userId, actualStartDate, actualEndDate),
      this.getIncomesInRange(userId, actualStartDate, actualEndDate),
      this.getExpensesByCategory(userId, actualStartDate, actualEndDate),
      this.getTopExpenses(userId, actualStartDate, actualEndDate, 5),
      this.getRecentTransactions(userId, 10),
      this.getExpensesInRange(userId, previousRange.start, previousRange.end),
      this.getIncomesInRange(userId, previousRange.start, previousRange.end),
    ]);

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const balance = totalIncome - totalExpenses;

    // Calculate previous period totals
    const previousExpenseTotal = previousExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const previousIncomeTotal = previousIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0);

    // Calculate percentage changes
    const expenseChange =
      previousExpenseTotal > 0
        ? ((totalExpenses - previousExpenseTotal) / previousExpenseTotal) * 100
        : 0;
    const incomeChange =
      previousIncomeTotal > 0
        ? ((totalIncome - previousIncomeTotal) / previousIncomeTotal) * 100
        : 0;

    // Calculate averages
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;

    // Get savings rate
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : 0;

    return {
      summary: {
        totalExpenses,
        totalIncome,
        balance,
        expenseCount: expenses.length,
        incomeCount: incomes.length,
        avgExpense,
        avgIncome,
        savingsRate: Number(savingsRate),
        previousExpenseTotal,
        previousIncomeTotal,
        expenseChange: Number(expenseChange.toFixed(2)),
        incomeChange: Number(incomeChange.toFixed(2)),
      },
      expensesByCategory,
      topExpenses,
      recentTransactions,
      period: {
        start: actualStartDate,
        end: actualEndDate,
        label: period || 'custom',
      },
    };
  }

  async getExpensesByCategory(userId: string, startDate: string, endDate: string) {
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('perimeters', 'p', 'p.id = expense.category_id')
      .select('expense.categoryId', 'categoryId')
      .addSelect("COALESCE(p.name, 'Uncategorized')", 'categoryName')
      .addSelect('p.icon', 'categoryIcon')
      .addSelect('p.color', 'categoryColor')
      .addSelect('SUM(expense.amount)', 'total')
      .addSelect('COUNT(expense.id)', 'count')
      .addSelect('AVG(expense.amount)', 'average')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('expense.categoryId')
      .addGroupBy('p.name')
      .addGroupBy('p.icon')
      .addGroupBy('p.color')
      .orderBy('total', 'DESC')
      .getRawMany();

    const total = expenses.reduce((sum, cat) => sum + Number(cat.total), 0);

    return expenses.map(cat => ({
      categoryId: cat.categoryId || 'uncategorized',
      categoryName: cat.categoryName || 'Uncategorized',
      categoryIcon: cat.categoryIcon || null,
      categoryColor: cat.categoryColor || null,
      total: Number(cat.total),
      count: Number(cat.count),
      average: Number(cat.average),
      percentage: total > 0 ? ((Number(cat.total) / total) * 100).toFixed(2) : 0,
    }));
  }

  async getExpensesTrend(userId: string, startDate?: string, endDate?: string, groupBy = 'day') {
    const range = this.calculateDateRange('month');
    startDate = startDate || range.start;
    endDate = endDate || range.end;
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('expense.date', 'ASC')
      .getMany();

    return this.groupByPeriod(expenses, groupBy);
  }

  async getIncomeTrend(userId: string, startDate?: string, endDate?: string, groupBy = 'day') {
    const range = this.calculateDateRange('month');
    startDate = startDate || range.start;
    endDate = endDate || range.end;
    const incomes = await this.incomeRepository
      .createQueryBuilder('income')
      .where('income.userId = :userId', { userId })
      .andWhere('income.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('income.date', 'ASC')
      .getMany();

    return this.groupByPeriod(incomes, groupBy);
  }

  async getCashFlow(userId: string, startDate?: string, endDate?: string) {
    const range = this.calculateDateRange('month');
    startDate = startDate || range.start;
    endDate = endDate || range.end;
    const [expenses, incomes] = await Promise.all([
      this.getExpensesInRange(userId, startDate, endDate),
      this.getIncomesInRange(userId, startDate, endDate),
    ]);

    const expensesByDate = this.groupByDate(expenses);
    const incomesByDate = this.groupByDate(incomes);

    // Combine dates
    const allDates = new Set([...Object.keys(expensesByDate), ...Object.keys(incomesByDate)]);

    return Array.from(allDates)
      .sort()
      .map(date => {
        const expenseTotal = expensesByDate[date] || 0;
        const incomeTotal = incomesByDate[date] || 0;
        return {
          date,
          expenses: expenseTotal,
          income: incomeTotal,
          balance: incomeTotal - expenseTotal,
        };
      });
  }

  async getMonthlyComparison(userId: string, months = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const [expenses, incomes] = await Promise.all([
      this.getExpensesInRange(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ),
      this.getIncomesInRange(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ),
    ]);

    const expensesByMonth = this.groupByMonth(expenses);
    const incomesByMonth = this.groupByMonth(incomes);

    const allMonths = new Set([...Object.keys(expensesByMonth), ...Object.keys(incomesByMonth)]);

    return Array.from(allMonths)
      .sort()
      .map(month => {
        const expenseTotal = expensesByMonth[month] || 0;
        const incomeTotal = incomesByMonth[month] || 0;
        return {
          month,
          expenses: expenseTotal,
          income: incomeTotal,
          balance: incomeTotal - expenseTotal,
          savingsRate:
            incomeTotal > 0 ? (((incomeTotal - expenseTotal) / incomeTotal) * 100).toFixed(2) : 0,
        };
      });
  }

  private calculatePreviousPeriodRange(
    period: string | undefined,
    currentStart: string,
    currentEnd: string
  ): { start: string; end: string } {
    const currentStartDate = new Date(currentStart);
    const currentEndDate = new Date(currentEnd);

    switch (period) {
      case 'week': {
        const prevWeekStart = startOfWeek(subWeeks(currentStartDate, 1));
        const prevWeekEnd = endOfWeek(subWeeks(currentStartDate, 1));
        return {
          start: format(prevWeekStart, 'yyyy-MM-dd'),
          end: format(prevWeekEnd, 'yyyy-MM-dd'),
        };
      }
      case 'month': {
        const prevMonthStart = startOfMonth(subMonths(currentStartDate, 1));
        const prevMonthEnd = endOfMonth(subMonths(currentStartDate, 1));
        return {
          start: format(prevMonthStart, 'yyyy-MM-dd'),
          end: format(prevMonthEnd, 'yyyy-MM-dd'),
        };
      }
      default: {
        // For custom or other periods, shift back by the same duration
        const durationMs = currentEndDate.getTime() - currentStartDate.getTime();
        const prevEnd = new Date(currentStartDate.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - durationMs);
        return {
          start: format(prevStart, 'yyyy-MM-dd'),
          end: format(prevEnd, 'yyyy-MM-dd'),
        };
      }
    }
  }

  // Helper methods
  private async getExpensesInRange(userId: string, startDate: string, endDate: string) {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();
  }

  private async getIncomesInRange(userId: string, startDate: string, endDate: string) {
    return this.incomeRepository
      .createQueryBuilder('income')
      .where('income.userId = :userId', { userId })
      .andWhere('income.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();
  }

  private async getTopExpenses(userId: string, startDate: string, endDate: string, limit = 5) {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('expense.amount', 'DESC')
      .limit(limit)
      .getMany();
  }

  private async getRecentTransactions(userId: string, limit = 10) {
    const [expenses, incomes] = await Promise.all([
      this.expenseRepository
        .createQueryBuilder('expense')
        .where('expense.userId = :userId', { userId })
        .orderBy('expense.createdAt', 'DESC')
        .limit(limit / 2)
        .getMany(),
      this.incomeRepository
        .createQueryBuilder('income')
        .where('income.userId = :userId', { userId })
        .orderBy('income.createdAt', 'DESC')
        .limit(limit / 2)
        .getMany(),
    ]);

    const transactions = [
      ...expenses.map(exp => ({
        ...exp,
        type: 'expense' as const,
        timestamp: exp.createdAt,
      })),
      ...incomes.map(inc => ({
        ...inc,
        type: 'income' as const,
        timestamp: inc.createdAt,
      })),
    ];

    return transactions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private calculateDateRange(period?: string): { start: string; end: string } {
    const now = new Date();
    let start: Date;

    switch (period) {
      case 'week':
        start = startOfWeek(now);
        break;
      case 'month':
        start = startOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        break;
      case 'all':
        // Return a wide range covering all historical data
        start = new Date('2000-01-01');
        break;
      default:
        start = subDays(now, 30); // Default to last 30 days
    }

    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    };
  }

  private groupByDate(items: any[]): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        const date = item.date.toString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += Number(item.amount);
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private groupByMonth(items: any[]): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        const date = new Date(item.date);
        const month = format(date, 'yyyy-MM');
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += Number(item.amount);
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private groupByPeriod(items: any[], groupBy: string) {
    const grouped = items.reduce(
      (acc, item) => {
        let key: string;
        const date = new Date(item.date);

        switch (groupBy) {
          case 'week':
            key = format(startOfWeek(date), 'yyyy-MM-dd');
            break;
          case 'month':
            key = format(date, 'yyyy-MM');
            break;
          default:
            key = format(date, 'yyyy-MM-dd');
        }

        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += Number(item.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(grouped)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
