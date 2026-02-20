import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Expense } from '../entities/expense.entity';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import {
  ExpenseCreatedEvent,
  ExpenseUpdatedEvent,
  ExpenseDeletedEvent,
} from '../../common/events/expense.events';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      userId,
      currency: createExpenseDto.currency || 'USD',
    });

    const saved = await this.expenseRepository.save(expense);

    this.eventEmitter.emit(
      'expense.created',
      new ExpenseCreatedEvent(
        userId,
        saved.id,
        Number(saved.amount),
        saved.currency,
        saved.categoryId || null,
        saved.description || null,
        saved.date
      )
    );

    return saved;
  }

  async createBatch(userId: string, expenses: CreateExpenseDto[]): Promise<Expense[]> {
    const expenseEntities = expenses.map(dto =>
      this.expenseRepository.create({
        ...dto,
        userId,
        currency: dto.currency || 'USD',
      })
    );

    return this.expenseRepository.save(expenseEntities);
  }

  async findAll(userId: string, query: QueryExpenseDto) {
    const { page = 1, limit = 20, categoryId, startDate, endDate, search, cursor } = query;

    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .orderBy('expense.date', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC');

    // Apply filters
    if (categoryId) {
      queryBuilder.andWhere('expense.categoryId = :categoryId', { categoryId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('expense.date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('expense.date <= :endDate', { endDate });
    }

    if (search) {
      queryBuilder.andWhere('expense.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Cursor-based pagination (takes priority over offset when provided)
    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded) {
        queryBuilder.andWhere(
          '(expense.date < :cursorDate OR (expense.date = :cursorDate AND expense.createdAt < :cursorCreatedAt))',
          { cursorDate: decoded.date, cursorCreatedAt: decoded.createdAt }
        );
      }
    }

    queryBuilder.take(limit + 1); // fetch one extra to determine hasMore

    if (!cursor) {
      // Offset pagination fallback
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const items = await queryBuilder.getMany();
    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor =
      hasMore && items.length > 0
        ? this.encodeCursor(items[items.length - 1].date, items[items.length - 1].createdAt)
        : null;

    // Only compute total for offset pagination
    if (!cursor) {
      const countBuilder = this.expenseRepository
        .createQueryBuilder('expense')
        .where('expense.userId = :userId', { userId });
      if (categoryId) countBuilder.andWhere('expense.categoryId = :categoryId', { categoryId });
      if (startDate) countBuilder.andWhere('expense.date >= :startDate', { startDate });
      if (endDate) countBuilder.andWhere('expense.date <= :endDate', { endDate });
      if (search)
        countBuilder.andWhere('expense.description ILIKE :search', { search: `%${search}%` });
      const total = await countBuilder.getCount();

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        cursor: nextCursor,
      };
    }

    return {
      items,
      cursor: nextCursor,
      hasMore,
    };
  }

  private encodeCursor(date: string | Date, createdAt: Date): string {
    return Buffer.from(
      JSON.stringify({ date: String(date), createdAt: createdAt.toISOString() })
    ).toString('base64');
  }

  private decodeCursor(cursor: string): { date: string; createdAt: string } | null {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
      if (decoded.date && decoded.createdAt) return decoded;
      return null;
    } catch {
      return null;
    }
  }

  async findOne(id: string, userId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(id: string, userId: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id, userId);

    Object.assign(expense, updateExpenseDto);

    const saved = await this.expenseRepository.save(expense);

    this.eventEmitter.emit(
      'expense.updated',
      new ExpenseUpdatedEvent(
        userId,
        saved.id,
        Number(saved.amount),
        saved.currency,
        saved.categoryId || null,
        saved.description || null,
        saved.date
      )
    );

    return saved;
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.findOne(id, userId);
    const expenseId = expense.id;
    const amount = Number(expense.amount);
    const currency = expense.currency;

    await this.expenseRepository.remove(expense);

    this.eventEmitter.emit(
      'expense.deleted',
      new ExpenseDeletedEvent(userId, expenseId, amount, currency)
    );
  }

  async getStats(userId: string, startDate?: string, endDate?: string) {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId });

    if (startDate && endDate) {
      queryBuilder.andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const expenses = await queryBuilder.getMany();

    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const count = expenses.length;
    const average = count > 0 ? total / count : 0;

    // Group by category
    const byCategory = expenses.reduce(
      (acc, exp) => {
        const catId = exp.categoryId || 'uncategorized';
        if (!acc[catId]) {
          acc[catId] = { total: 0, count: 0 };
        }
        acc[catId].total += Number(exp.amount);
        acc[catId].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    return {
      total,
      count,
      average,
      byCategory,
    };
  }

  async getTrend(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      .orderBy('expense.date', 'ASC')
      .getMany();

    // Group by date
    const dailyTotals = expenses.reduce(
      (acc, exp) => {
        const date = exp.date.toString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += Number(exp.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(dailyTotals).map(([date, total]) => ({
      date,
      total,
    }));
  }
}
