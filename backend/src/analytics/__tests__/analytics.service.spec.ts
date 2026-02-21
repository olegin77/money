import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsReadService } from '../services/analytics-read.service';
import { AnalyticsWriteService } from '../services/analytics-write.service';
import { Expense } from '../../expenses/entities/expense.entity';
import { Income } from '../../income/entities/income.entity';
import { CacheService } from '../../common/services/cache.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let readService: AnalyticsReadService;
  let expenseRepo: Record<string, jest.Mock>;
  let incomeRepo: Record<string, jest.Mock>;

  const mockExpenses: Partial<Expense>[] = [
    {
      id: 'exp-1',
      amount: 50,
      currency: 'USD',
      description: 'Lunch',
      categoryId: 'cat-1',
      date: new Date('2026-02-01'),
      userId: 'user-1',
      createdAt: new Date('2026-02-01T10:00:00Z'),
    },
    {
      id: 'exp-2',
      amount: 30,
      currency: 'USD',
      description: 'Coffee',
      categoryId: 'cat-1',
      date: new Date('2026-02-02'),
      userId: 'user-1',
      createdAt: new Date('2026-02-02T10:00:00Z'),
    },
    {
      id: 'exp-3',
      amount: 100,
      currency: 'USD',
      description: 'Groceries',
      categoryId: 'cat-2',
      date: new Date('2026-02-03'),
      userId: 'user-1',
      createdAt: new Date('2026-02-03T10:00:00Z'),
    },
  ];

  const mockIncomes: Partial<Income>[] = [
    {
      id: 'inc-1',
      amount: 3000,
      currency: 'USD',
      description: 'Salary',
      source: 'employer',
      date: new Date('2026-02-01'),
      userId: 'user-1',
      createdAt: new Date('2026-02-01T10:00:00Z'),
    },
  ];

  const createMockQueryBuilder = (returnData: any[] = []) => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(returnData),
    getRawMany: jest.fn().mockResolvedValue([]),
  });

  const mockCacheService = {
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn().mockResolvedValue(undefined),
    generateUserCacheKey: jest
      .fn()
      .mockImplementation((userId: string, prefix: string) => `user:${userId}:${prefix}`),
    generateDashboardCacheKey: jest
      .fn()
      .mockImplementation((userId: string, period: string) => `dashboard:${userId}:${period}`),
    invalidateUserCache: jest.fn().mockResolvedValue(undefined),
  };

  const mockDataSource = {
    query: jest.fn().mockRejectedValue(new Error('MV does not exist')),
  };

  beforeEach(async () => {
    const expenseQB = createMockQueryBuilder(mockExpenses);
    const incomeQB = createMockQueryBuilder(mockIncomes);

    expenseRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(expenseQB),
    };

    incomeRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(incomeQB),
    };

    // Reset mocks
    mockCacheService.get.mockResolvedValue(undefined);
    mockDataSource.query.mockRejectedValue(new Error('MV does not exist'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        AnalyticsReadService,
        AnalyticsWriteService,
        { provide: getRepositoryToken(Expense), useValue: expenseRepo },
        { provide: getRepositoryToken(Income), useValue: incomeRepo },
        { provide: CacheService, useValue: mockCacheService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    readService = module.get<AnalyticsReadService>(AnalyticsReadService);
  });

  describe('getDashboard', () => {
    it('should return dashboard summary with totals', async () => {
      const result = await service.getDashboard('user-1', '2026-02-01', '2026-02-28');

      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('totalExpenses');
      expect(result.summary).toHaveProperty('totalIncome');
      expect(result.summary).toHaveProperty('balance');
    });

    it('should calculate expense and income totals correctly', async () => {
      const result = await service.getDashboard('user-1', '2026-02-01', '2026-02-28');

      // 50 + 30 + 100 = 180 for expenses
      expect(result.summary.totalExpenses).toBe(180);
      // 3000 for income
      expect(result.summary.totalIncome).toBe(3000);
      // Balance = income - expenses
      expect(result.summary.balance).toBe(2820);
    });

    it('should include period information', async () => {
      const result = await service.getDashboard('user-1', '2026-02-01', '2026-02-28');

      expect(result.period).toEqual({
        start: '2026-02-01',
        end: '2026-02-28',
        label: 'custom',
      });
    });

    it('should include savings rate', async () => {
      const result = await service.getDashboard('user-1', '2026-02-01', '2026-02-28');

      expect(result.summary.savingsRate).toBeDefined();
      expect(typeof result.summary.savingsRate).toBe('number');
    });

    it('should use default date range when no dates provided', async () => {
      const result = await service.getDashboard('user-1');

      expect(result).toHaveProperty('summary');
      expect(result.period.label).toBe('custom');
    });

    it('should handle period parameter for date range', async () => {
      const result = await service.getDashboard('user-1', undefined, undefined, 'month');

      expect(result.period.label).toBe('month');
    });

    it('should use cached result when available', async () => {
      const cachedData = {
        summary: { totalExpenses: 999 },
        period: { label: 'cached' },
      };
      mockCacheService.get.mockResolvedValueOnce(cachedData);

      const result = await service.getDashboard('user-1', '2026-02-01', '2026-02-28');

      expect(result).toBe(cachedData);
    });
  });

  describe('getExpensesByCategory', () => {
    it('should return category breakdown', async () => {
      const rawData = [
        {
          categoryId: 'cat-1',
          categoryName: 'Food',
          categoryIcon: null,
          categoryColor: '#FF0000',
          total: '80',
          count: '2',
          average: '40',
        },
        {
          categoryId: 'cat-2',
          categoryName: 'Groceries',
          categoryIcon: null,
          categoryColor: '#00FF00',
          total: '100',
          count: '1',
          average: '100',
        },
      ];

      // Override the getRawMany mock for this test
      const qb = createMockQueryBuilder();
      qb.getRawMany.mockResolvedValue(rawData);
      expenseRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getExpensesByCategory('user-1', '2026-02-01', '2026-02-28');

      expect(result).toHaveLength(2);
      expect(result[0].categoryId).toBe('cat-1');
      expect(result[0].total).toBe(80);
      expect(result[0].count).toBe(2);
    });

    it('should calculate percentages correctly', async () => {
      const rawData = [
        {
          categoryId: 'cat-1',
          categoryName: 'Food',
          categoryIcon: null,
          categoryColor: null,
          total: '75',
          count: '3',
          average: '25',
        },
        {
          categoryId: 'cat-2',
          categoryName: 'Transport',
          categoryIcon: null,
          categoryColor: null,
          total: '25',
          count: '1',
          average: '25',
        },
      ];

      const qb = createMockQueryBuilder();
      qb.getRawMany.mockResolvedValue(rawData);
      expenseRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getExpensesByCategory('user-1', '2026-02-01', '2026-02-28');

      expect(result[0].percentage).toBe('75.00');
      expect(result[1].percentage).toBe('25.00');
    });

    it('should handle empty results', async () => {
      const qb = createMockQueryBuilder();
      qb.getRawMany.mockResolvedValue([]);
      expenseRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getExpensesByCategory('user-1', '2026-02-01', '2026-02-28');

      expect(result).toHaveLength(0);
    });

    it('should default uncategorized expenses', async () => {
      const rawData = [
        {
          categoryId: null,
          categoryName: null,
          categoryIcon: null,
          categoryColor: null,
          total: '50',
          count: '1',
          average: '50',
        },
      ];

      const qb = createMockQueryBuilder();
      qb.getRawMany.mockResolvedValue(rawData);
      expenseRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getExpensesByCategory('user-1', '2026-02-01', '2026-02-28');

      expect(result[0].categoryId).toBe('uncategorized');
      expect(result[0].categoryName).toBe('Uncategorized');
    });

    it('should query with correct user and date parameters', async () => {
      const qb = createMockQueryBuilder();
      qb.getRawMany.mockResolvedValue([]);
      expenseRepo.createQueryBuilder.mockReturnValue(qb);

      await service.getExpensesByCategory('user-1', '2026-02-01', '2026-02-28');

      expect(qb.where).toHaveBeenCalledWith('expense.userId = :userId', {
        userId: 'user-1',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('expense.date BETWEEN :startDate AND :endDate', {
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });
    });
  });

  describe('getExpensesTrend', () => {
    it('should return grouped expense trend data', async () => {
      const result = await service.getExpensesTrend('user-1', '2026-02-01', '2026-02-28');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should use default date range when no dates provided', async () => {
      const result = await service.getExpensesTrend('user-1');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCashFlow', () => {
    it('should return cash flow data with expenses, income, and balance', async () => {
      const result = await service.getCashFlow('user-1', '2026-02-01', '2026-02-28');

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('date');
        expect(result[0]).toHaveProperty('expenses');
        expect(result[0]).toHaveProperty('income');
        expect(result[0]).toHaveProperty('balance');
      }
    });
  });

  describe('CQRS delegation', () => {
    it('should delegate getDashboard to readService', async () => {
      const spy = jest.spyOn(readService, 'getDashboard');
      await service.getDashboard('user-1', '2026-02-01', '2026-02-28');
      expect(spy).toHaveBeenCalledWith('user-1', '2026-02-01', '2026-02-28', undefined);
    });

    it('should delegate getExpensesByCategory to readService', async () => {
      const spy = jest.spyOn(readService, 'getExpensesByCategory');
      await service.getExpensesByCategory('user-1', '2026-02-01', '2026-02-28');
      expect(spy).toHaveBeenCalledWith('user-1', '2026-02-01', '2026-02-28');
    });
  });
});
