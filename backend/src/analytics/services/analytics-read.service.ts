import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';
import { Income } from '../../income/entities/income.entity';
import { CacheService } from '../../common/services/cache.service';
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

/**
 * CQRS Read Service — handles all analytics GET queries.
 * Uses a cache-first pattern: check cache -> check materialized view -> fallback to raw query.
 */
@Injectable()
export class AnalyticsReadService {
  private readonly logger = new Logger(AnalyticsReadService.name);

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource
  ) {}

  async getDashboard(userId: string, startDate?: string, endDate?: string, period?: string) {
    const cacheKey = this.cacheService.generateDashboardCacheKey(
      userId,
      `dashboard:${period || 'custom'}:${startDate || ''}:${endDate || ''}`
    );

    // 1. Cache-first: try cache
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for dashboard userId=${userId}`);
      return cached;
    }

    this.logger.debug(`Cache MISS for dashboard userId=${userId}`);

    // 2. Calculate date range based on period
    const dateRange = this.calculateDateRange(period);
    const actualStartDate = startDate || dateRange.start;
    const actualEndDate = endDate || dateRange.end;

    // 3. Try materialized view for summary data
    const mvSummary = await this.tryMaterializedDashboardSummary(
      userId,
      actualStartDate,
      actualEndDate
    );

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
      mvSummary ? [] : this.getExpensesInRange(userId, actualStartDate, actualEndDate),
      mvSummary ? [] : this.getIncomesInRange(userId, actualStartDate, actualEndDate),
      this.getExpensesByCategory(userId, actualStartDate, actualEndDate),
      this.getTopExpenses(userId, actualStartDate, actualEndDate, 5),
      this.getRecentTransactions(userId, 10),
      this.getExpensesInRange(userId, previousRange.start, previousRange.end),
      this.getIncomesInRange(userId, previousRange.start, previousRange.end),
    ]);

    // Calculate totals — prefer materialized view data if available
    let totalExpenses: number;
    let totalIncome: number;
    let expenseCount: number;
    let incomeCount: number;
    let avgExpense: number;
    let avgIncome: number;

    if (mvSummary) {
      totalExpenses = Number(mvSummary.totalExpenses || 0);
      totalIncome = Number(mvSummary.totalIncome || 0);
      expenseCount = Number(mvSummary.expenseCount || 0);
      incomeCount = Number(mvSummary.incomeCount || 0);
      avgExpense = Number(mvSummary.avgExpense || 0);
      avgIncome = Number(mvSummary.avgIncome || 0);
    } else {
      totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
      expenseCount = expenses.length;
      incomeCount = incomes.length;
      avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
      avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;
    }

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

    // Get savings rate
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : 0;

    const result = {
      summary: {
        totalExpenses,
        totalIncome,
        balance,
        expenseCount,
        incomeCount,
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

    // Cache result for 120s
    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  async getExpensesByCategory(userId: string, startDate: string, endDate: string) {
    const cacheKey = this.cacheService.generateUserCacheKey(
      userId,
      `category:${startDate}:${endDate}`
    );

    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Try materialized view first
    const mvResult = await this.tryMaterializedCategoryBreakdown(userId, startDate, endDate);
    if (mvResult && mvResult.length > 0) {
      await this.cacheService.set(cacheKey, mvResult, 120);
      return mvResult;
    }

    // Fallback to raw query
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('perimeters', 'p', 'p.id::text = expense.category_id')
      .select('expense.categoryId', 'categoryId')
      .addSelect("COALESCE(p.name, 'Uncategorized')", 'categoryName')
      .addSelect('p.icon', 'categoryIcon')
      .addSelect('p.color', 'categoryColor')
      .addSelect('SUM(expense.amount)', 'total')
      .addSelect('COUNT(expense.id)', 'count')
      .addSelect('AVG(expense.amount)', 'average')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('expense.categoryId')
      .addGroupBy('p.name')
      .addGroupBy('p.icon')
      .addGroupBy('p.color')
      .orderBy('total', 'DESC')
      .getRawMany();

    const total = expenses.reduce((sum, cat) => sum + Number(cat.total), 0);

    const result = expenses.map(cat => ({
      categoryId: cat.categoryId || 'uncategorized',
      categoryName: cat.categoryName || 'Uncategorized',
      categoryIcon: cat.categoryIcon || null,
      categoryColor: cat.categoryColor || null,
      total: Number(cat.total),
      count: Number(cat.count),
      average: Number(cat.average),
      percentage: total > 0 ? ((Number(cat.total) / total) * 100).toFixed(2) : 0,
    }));

    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  async getExpensesTrend(userId: string, startDate?: string, endDate?: string, groupBy = 'day') {
    const range = this.calculateDateRange('month');
    startDate = startDate || range.start;
    endDate = endDate || range.end;

    const cacheKey = this.cacheService.generateUserCacheKey(
      userId,
      `trend:expense:${startDate}:${endDate}:${groupBy}`
    );

    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('expense.date', 'ASC')
      .getMany();

    const result = this.groupByPeriod(expenses, groupBy);
    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  async getIncomeTrend(userId: string, startDate?: string, endDate?: string, groupBy = 'day') {
    const range = this.calculateDateRange('month');
    startDate = startDate || range.start;
    endDate = endDate || range.end;

    const cacheKey = this.cacheService.generateUserCacheKey(
      userId,
      `trend:income:${startDate}:${endDate}:${groupBy}`
    );

    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const incomes = await this.incomeRepository
      .createQueryBuilder('income')
      .where('income.userId = :userId', { userId })
      .andWhere('income.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('income.date', 'ASC')
      .getMany();

    const result = this.groupByPeriod(incomes, groupBy);
    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  async getCashFlow(userId: string, startDate?: string, endDate?: string) {
    const range = this.calculateDateRange('month');
    startDate = startDate || range.start;
    endDate = endDate || range.end;

    const cacheKey = this.cacheService.generateUserCacheKey(
      userId,
      `cashflow:${startDate}:${endDate}`
    );

    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const [expenses, incomes] = await Promise.all([
      this.getExpensesInRange(userId, startDate, endDate),
      this.getIncomesInRange(userId, startDate, endDate),
    ]);

    const expensesByDate = this.groupByDate(expenses);
    const incomesByDate = this.groupByDate(incomes);

    // Combine dates
    const allDates = new Set([...Object.keys(expensesByDate), ...Object.keys(incomesByDate)]);

    const result = Array.from(allDates)
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

    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  async getMonthlyComparison(userId: string, months = 6) {
    const cacheKey = this.cacheService.generateUserCacheKey(userId, `monthly-comparison:${months}`);

    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

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

    const result = Array.from(allMonths)
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

    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  // --- Materialized view query helpers ---

  /**
   * Attempt to read dashboard summary from materialized view.
   * Returns null if the MV does not exist or query fails (graceful fallback).
   */
  private async tryMaterializedDashboardSummary(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalExpenses: number;
    totalIncome: number;
    expenseCount: number;
    incomeCount: number;
    avgExpense: number;
    avgIncome: number;
  } | null> {
    try {
      const rows = await this.dataSource.query(
        `SELECT
           COALESCE(SUM(total_expenses), 0) AS "totalExpenses",
           COALESCE(SUM(total_income), 0) AS "totalIncome",
           COALESCE(SUM(expense_count), 0) AS "expenseCount",
           COALESCE(SUM(income_count), 0) AS "incomeCount",
           CASE WHEN SUM(expense_count) > 0
                THEN SUM(total_expenses) / SUM(expense_count) ELSE 0 END AS "avgExpense",
           CASE WHEN SUM(income_count) > 0
                THEN SUM(total_income) / SUM(income_count) ELSE 0 END AS "avgIncome"
         FROM mv_dashboard_summary
         WHERE user_id = $1
           AND month >= date_trunc('month', $2::date)
           AND month <= date_trunc('month', $3::date)`,
        [userId, startDate, endDate]
      );
      if (rows && rows.length > 0 && rows[0].totalExpenses !== null) {
        return rows[0];
      }
      return null;
    } catch (_err) {
      // MV may not exist yet — graceful fallback
      this.logger.debug('Materialized view mv_dashboard_summary not available, using raw query');
      return null;
    }
  }

  /**
   * Attempt to read category breakdown from materialized view.
   */
  private async tryMaterializedCategoryBreakdown(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<any[] | null> {
    try {
      const rows = await this.dataSource.query(
        `SELECT
           category_id AS "categoryId",
           category_name AS "categoryName",
           category_icon AS "categoryIcon",
           category_color AS "categoryColor",
           COALESCE(SUM(total_amount), 0) AS "total",
           COALESCE(SUM(expense_count), 0) AS "count",
           CASE WHEN SUM(expense_count) > 0
                THEN SUM(total_amount) / SUM(expense_count) ELSE 0 END AS "average"
         FROM mv_category_breakdown
         WHERE user_id = $1
           AND month >= date_trunc('month', $2::date)
           AND month <= date_trunc('month', $3::date)
         GROUP BY category_id, category_name, category_icon, category_color
         ORDER BY "total" DESC`,
        [userId, startDate, endDate]
      );

      if (!rows || rows.length === 0) return null;

      const total = rows.reduce((sum: number, cat: any) => sum + Number(cat.total), 0);

      return rows.map((cat: any) => ({
        categoryId: cat.categoryId || 'uncategorized',
        categoryName: cat.categoryName || 'Uncategorized',
        categoryIcon: cat.categoryIcon || null,
        categoryColor: cat.categoryColor || null,
        total: Number(cat.total),
        count: Number(cat.count),
        average: Number(cat.average),
        percentage: total > 0 ? ((Number(cat.total) / total) * 100).toFixed(2) : 0,
      }));
    } catch (_err) {
      this.logger.debug('Materialized view mv_category_breakdown not available, using raw query');
      return null;
    }
  }

  // --- Date calculation helpers (shared with the original service) ---

  calculateDateRange(period?: string): { start: string; end: string } {
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
        start = new Date('2000-01-01');
        break;
      default:
        start = subDays(now, 30);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    };
  }

  calculatePreviousPeriodRange(
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

  // --- Data access helpers ---

  async getExpensesInRange(userId: string, startDate: string, endDate: string) {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async getIncomesInRange(userId: string, startDate: string, endDate: string) {
    return this.incomeRepository
      .createQueryBuilder('income')
      .where('income.userId = :userId', { userId })
      .andWhere('income.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  private async getTopExpenses(userId: string, startDate: string, endDate: string, limit = 5) {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
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

  // --- Grouping helpers ---

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
