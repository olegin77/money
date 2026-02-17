import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>
  ) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      userId,
      currency: createExpenseDto.currency || 'USD',
    });

    return this.expenseRepository.save(expense);
  }

  async createBatch(userId: string, expenses: CreateExpenseDto[]): Promise<Expense[]> {
    const expenseEntities = expenses.map((dto) =>
      this.expenseRepository.create({
        ...dto,
        userId,
        currency: dto.currency || 'USD',
      })
    );

    return this.expenseRepository.save(expenseEntities);
  }

  async findAll(userId: string, query: QueryExpenseDto) {
    const { page = 1, limit = 20, categoryId, startDate, endDate, search } = query;

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

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

    return this.expenseRepository.save(expense);
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.findOne(id, userId);
    await this.expenseRepository.remove(expense);
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
    const byCategory = expenses.reduce((acc, exp) => {
      const catId = exp.categoryId || 'uncategorized';
      if (!acc[catId]) {
        acc[catId] = { total: 0, count: 0 };
      }
      acc[catId].total += Number(exp.amount);
      acc[catId].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

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
    const dailyTotals = expenses.reduce((acc, exp) => {
      const date = exp.date.toString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Number(exp.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyTotals).map(([date, total]) => ({
      date,
      total,
    }));
  }
}
