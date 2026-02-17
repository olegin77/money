import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from '../entities/income.entity';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { QueryIncomeDto } from '../dto/query-income.dto';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>
  ) {}

  async create(userId: string, createIncomeDto: CreateIncomeDto): Promise<Income> {
    const income = this.incomeRepository.create({
      ...createIncomeDto,
      userId,
      currency: createIncomeDto.currency || 'USD',
    });

    return this.incomeRepository.save(income);
  }

  async findAll(userId: string, query: QueryIncomeDto) {
    const { page = 1, limit = 20, startDate, endDate, search } = query;

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
      queryBuilder.andWhere(
        '(income.description ILIKE :search OR income.source ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
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

    return this.incomeRepository.save(income);
  }

  async remove(id: string, userId: string): Promise<void> {
    const income = await this.findOne(id, userId);
    await this.incomeRepository.remove(income);
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
    const bySource = incomes.reduce((acc, inc) => {
      const source = inc.source || 'Other';
      if (!acc[source]) {
        acc[source] = { total: 0, count: 0 };
      }
      acc[source].total += Number(inc.amount);
      acc[source].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

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
    const dailyTotals = incomes.reduce((acc, inc) => {
      const date = inc.date.toString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Number(inc.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyTotals).map(([date, total]) => ({
      date,
      total,
    }));
  }
}
