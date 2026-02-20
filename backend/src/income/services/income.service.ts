import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Income } from '../entities/income.entity';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { QueryIncomeDto } from '../dto/query-income.dto';
import {
  IncomeCreatedEvent,
  IncomeUpdatedEvent,
  IncomeDeletedEvent,
} from '../../common/events/income.events';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(userId: string, createIncomeDto: CreateIncomeDto): Promise<Income> {
    const income = this.incomeRepository.create({
      ...createIncomeDto,
      userId,
      currency: createIncomeDto.currency || 'USD',
    });

    const saved = await this.incomeRepository.save(income);

    this.eventEmitter.emit(
      'income.created',
      new IncomeCreatedEvent(
        userId,
        saved.id,
        Number(saved.amount),
        saved.currency,
        saved.source || null,
        saved.description || null,
        saved.date
      )
    );

    return saved;
  }

  async findAll(userId: string, query: QueryIncomeDto) {
    const { page = 1, limit = 20, startDate, endDate, search, cursor } = query;

    const queryBuilder = this.incomeRepository
      .createQueryBuilder('income')
      .where('income.userId = :userId', { userId })
      .orderBy('income.date', 'DESC')
      .addOrderBy('income.createdAt', 'DESC');

    // Apply filters
    if (startDate && endDate) {
      queryBuilder.andWhere('income.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('income.date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('income.date <= :endDate', { endDate });
    }

    if (search) {
      queryBuilder.andWhere('(income.description ILIKE :search OR income.source ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    // Cursor-based pagination (takes priority over offset when provided)
    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded) {
        queryBuilder.andWhere(
          '(income.date < :cursorDate OR (income.date = :cursorDate AND income.createdAt < :cursorCreatedAt))',
          { cursorDate: decoded.date, cursorCreatedAt: decoded.createdAt }
        );
      }
    }

    queryBuilder.take(limit + 1);

    if (!cursor) {
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

    if (!cursor) {
      const countBuilder = this.incomeRepository
        .createQueryBuilder('income')
        .where('income.userId = :userId', { userId });
      if (startDate) countBuilder.andWhere('income.date >= :startDate', { startDate });
      if (endDate) countBuilder.andWhere('income.date <= :endDate', { endDate });
      if (search)
        countBuilder.andWhere('(income.description ILIKE :search OR income.source ILIKE :search)', {
          search: `%${search}%`,
        });
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

  async findOne(id: string, userId: string): Promise<Income> {
    const income = await this.incomeRepository.findOne({
      where: { id, userId },
    });

    if (!income) {
      throw new NotFoundException('Income not found');
    }

    return income;
  }

  async update(id: string, userId: string, updateIncomeDto: UpdateIncomeDto): Promise<Income> {
    const income = await this.findOne(id, userId);

    Object.assign(income, updateIncomeDto);

    const saved = await this.incomeRepository.save(income);

    this.eventEmitter.emit(
      'income.updated',
      new IncomeUpdatedEvent(
        userId,
        saved.id,
        Number(saved.amount),
        saved.currency,
        saved.source || null,
        saved.description || null,
        saved.date
      )
    );

    return saved;
  }

  async remove(id: string, userId: string): Promise<void> {
    const income = await this.findOne(id, userId);
    const incomeId = income.id;
    const amount = Number(income.amount);
    const currency = income.currency;

    await this.incomeRepository.remove(income);

    this.eventEmitter.emit(
      'income.deleted',
      new IncomeDeletedEvent(userId, incomeId, amount, currency)
    );
  }

  async getStats(userId: string, startDate?: string, endDate?: string) {
    const queryBuilder = this.incomeRepository
      .createQueryBuilder('income')
      .where('income.userId = :userId', { userId });

    if (startDate && endDate) {
      queryBuilder.andWhere('income.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const incomes = await queryBuilder.getMany();

    const total = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const count = incomes.length;
    const average = count > 0 ? total / count : 0;

    // Group by source
    const bySource = incomes.reduce(
      (acc, inc) => {
        const source = inc.source || 'Other';
        if (!acc[source]) {
          acc[source] = { total: 0, count: 0 };
        }
        acc[source].total += Number(inc.amount);
        acc[source].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    return {
      total,
      count,
      average,
      bySource,
    };
  }

  async getTrend(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const incomes = await this.incomeRepository
      .createQueryBuilder('income')
      .where('income.userId = :userId', { userId })
      .andWhere('income.date BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      .orderBy('income.date', 'ASC')
      .getMany();

    // Group by date
    const dailyTotals = incomes.reduce(
      (acc, inc) => {
        const date = inc.date.toString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += Number(inc.amount);
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
