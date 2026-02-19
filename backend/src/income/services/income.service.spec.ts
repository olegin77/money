import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { IncomeService } from './income.service';
import { Income } from '../entities/income.entity';

describe('IncomeService', () => {
  let service: IncomeService;
  let repo: Record<string, jest.Mock>;

  const mockIncome: Partial<Income> = {
    id: 'inc-1',
    amount: 3000,
    currency: 'USD',
    description: 'Salary',
    source: 'Employment',
    date: new Date('2026-02-01'),
    userId: 'user-1',
    isRecurring: true,
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
    getManyAndCount: jest.fn().mockResolvedValue([[mockIncome], 1]),
    getMany: jest.fn().mockResolvedValue([mockIncome]),
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation((data) => ({ ...data })),
      save: jest.fn().mockImplementation((entity) =>
        Promise.resolve({ ...mockIncome, ...entity }),
      ),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomeService,
        { provide: getRepositoryToken(Income), useValue: repo },
      ],
    }).compile();

    service = module.get<IncomeService>(IncomeService);
  });

  describe('create', () => {
    it('should create an income record with default currency', async () => {
      const dto = { amount: 5000, description: 'Bonus', source: 'Work', date: '2026-02-15' as any };

      const result = await service.create('user-1', dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', currency: 'USD' }),
      );
      expect(result).toBeDefined();
    });

    it('should use provided currency', async () => {
      const dto = {
        amount: 1000,
        description: 'Freelance',
        date: '2026-02-10' as any,
        currency: 'EUR',
      };

      await service.create('user-1', dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'EUR' }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated income', async () => {
      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should apply date range filter', async () => {
      await service.findAll('user-1', {
        page: 1,
        limit: 20,
        startDate: '2026-01-01',
        endDate: '2026-02-28',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'income.date BETWEEN :startDate AND :endDate',
        { startDate: '2026-01-01', endDate: '2026-02-28' },
      );
    });

    it('should apply search filter', async () => {
      await service.findAll('user-1', { page: 1, limit: 20, search: 'salary' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(income.description ILIKE :search OR income.source ILIKE :search)',
        { search: '%salary%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return an income record', async () => {
      repo.findOne.mockResolvedValue(mockIncome);

      const result = await service.findOne('inc-1', 'user-1');

      expect(result).toEqual(mockIncome);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an income record', async () => {
      repo.findOne.mockResolvedValue({ ...mockIncome });

      const result = await service.update('inc-1', 'user-1', { amount: 3500 });

      expect(result).toBeDefined();
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an income record', async () => {
      repo.findOne.mockResolvedValue(mockIncome);

      await service.remove('inc-1', 'user-1');

      expect(repo.remove).toHaveBeenCalledWith(mockIncome);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return income statistics', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([
        { amount: 3000, source: 'Employment' },
        { amount: 500, source: 'Freelance' },
        { amount: 200, source: 'Employment' },
      ]);

      const result = await service.getStats('user-1');

      expect(result.total).toBe(3700);
      expect(result.count).toBe(3);
      expect(result.average).toBeCloseTo(1233.33, 1);
      expect(result.bySource['Employment'].total).toBe(3200);
      expect(result.bySource['Freelance'].total).toBe(500);
    });

    it('should return zero stats for no income', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      const result = await service.getStats('user-1');

      expect(result.total).toBe(0);
      expect(result.count).toBe(0);
      expect(result.average).toBe(0);
    });
  });
});
