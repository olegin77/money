import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Expense } from '../entities/expense.entity';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let repo: Record<string, jest.Mock>;

  const mockExpense: Partial<Expense> = {
    id: 'exp-1',
    amount: 42.5,
    currency: 'USD',
    description: 'Lunch',
    categoryId: 'cat-1',
    date: new Date('2026-02-01'),
    userId: 'user-1',
    tags: ['food'],
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockExpense], 1]),
    getMany: jest.fn().mockResolvedValue([mockExpense]),
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation(data => ({ ...data })),
      save: jest
        .fn()
        .mockImplementation(entity =>
          Promise.resolve(Array.isArray(entity) ? entity : { ...mockExpense, ...entity })
        ),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpensesService, { provide: getRepositoryToken(Expense), useValue: repo }],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  describe('create', () => {
    it('should create an expense with default currency', async () => {
      const dto = { amount: 25.0, description: 'Coffee', date: '2026-02-10' as any };

      const result = await service.create('user-1', dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', currency: 'USD' })
      );
      expect(repo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should use provided currency', async () => {
      const dto = {
        amount: 100,
        description: 'Dinner',
        date: '2026-02-10' as any,
        currency: 'EUR',
      };

      await service.create('user-1', dto);

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ currency: 'EUR' }));
    });
  });

  describe('createBatch', () => {
    it('should create multiple expenses', async () => {
      const dtos = [
        { amount: 10, description: 'A', date: '2026-02-01' as any },
        { amount: 20, description: 'B', date: '2026-02-02' as any },
      ];

      await service.createBatch('user-1', dtos);

      expect(repo.create).toHaveBeenCalledTimes(2);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated expenses', async () => {
      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should apply category filter', async () => {
      await service.findAll('user-1', { page: 1, limit: 20, categoryId: 'cat-1' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('expense.categoryId = :categoryId', {
        categoryId: 'cat-1',
      });
    });

    it('should apply date range filter', async () => {
      await service.findAll('user-1', {
        page: 1,
        limit: 20,
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'expense.date BETWEEN :startDate AND :endDate',
        { startDate: '2026-01-01', endDate: '2026-02-01' }
      );
    });

    it('should apply search filter', async () => {
      await service.findAll('user-1', { page: 1, limit: 20, search: 'lunch' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('expense.description ILIKE :search', {
        search: '%lunch%',
      });
    });
  });

  describe('findOne', () => {
    it('should return an expense', async () => {
      repo.findOne.mockResolvedValue(mockExpense);

      const result = await service.findOne('exp-1', 'user-1');

      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an expense', async () => {
      repo.findOne.mockResolvedValue({ ...mockExpense });

      const result = await service.update('exp-1', 'user-1', { description: 'Updated' });

      expect(result.data.description).toBe('Updated');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an expense', async () => {
      repo.findOne.mockResolvedValue(mockExpense);

      await service.remove('exp-1', 'user-1');

      expect(repo.remove).toHaveBeenCalledWith(mockExpense);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return expense statistics', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([
        { amount: 50, categoryId: 'cat-1' },
        { amount: 30, categoryId: 'cat-1' },
        { amount: 20, categoryId: 'cat-2' },
      ]);

      const result = await service.getStats('user-1');

      expect(result.total).toBe(100);
      expect(result.count).toBe(3);
      expect(result.average).toBeCloseTo(33.33, 1);
      expect(result.byCategory['cat-1'].total).toBe(80);
      expect(result.byCategory['cat-2'].total).toBe(20);
    });
  });
});
