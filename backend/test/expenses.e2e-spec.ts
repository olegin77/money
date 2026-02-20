import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ExpensesService } from '../src/expenses/services/expenses.service';
import { ExpensesController } from '../src/expenses/controllers/expenses.controller';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Expenses e2e tests using a minimal module setup.
 * We mock the ExpensesService to avoid needing a real database.
 */
describe('Expenses (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
  };

  const mockExpense = {
    id: 'exp-1',
    amount: 42.5,
    currency: 'USD',
    description: 'Lunch',
    categoryId: 'cat-1',
    date: '2026-02-10',
    userId: 'user-1',
    tags: ['food'],
    isRecurring: false,
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z',
  };

  const mockExpensesService = {
    create: jest.fn(),
    createBatch: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    getTrend: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: mockExpensesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: context => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/expenses', () => {
    it('should return 201 on successful creation', async () => {
      mockExpensesService.create.mockResolvedValue(mockExpense);

      const response = await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 42.5,
          description: 'Lunch',
          date: '2026-02-10',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockExpense);
      expect(mockExpensesService.create).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          amount: 42.5,
          description: 'Lunch',
          date: '2026-02-10',
        })
      );
    });

    it('should return 400 for missing required amount', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .set('Authorization', 'Bearer valid-token')
        .send({
          description: 'Lunch',
          date: '2026-02-10',
        })
        .expect(400);
    });

    it('should return 400 for missing required date', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 42.5,
          description: 'Lunch',
        })
        .expect(400);
    });

    it('should return 400 for invalid date format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 42.5,
          date: 'not-a-date',
        })
        .expect(400);
    });

    it('should return 400 for forbidden extra fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/expenses')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 42.5,
          date: '2026-02-10',
          hackerField: 'injection',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/expenses', () => {
    it('should return 200 with paginated expenses', async () => {
      mockExpensesService.findAll.mockResolvedValue({
        items: [mockExpense],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/expenses')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should pass query parameters to service', async () => {
      mockExpensesService.findAll.mockResolvedValue({
        items: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
      });

      await request(app.getHttpServer())
        .get('/api/v1/expenses?page=2&limit=10')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockExpensesService.findAll).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ page: 2, limit: 10 })
      );
    });

    it('should handle empty results', async () => {
      mockExpensesService.findAll.mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/expenses')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.data.items).toHaveLength(0);
    });
  });

  describe('PATCH /api/v1/expenses/:id', () => {
    it('should return 200 on successful update', async () => {
      const updatedExpense = { ...mockExpense, description: 'Updated Lunch' };
      mockExpensesService.update.mockResolvedValue(updatedExpense);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/expenses/exp-1')
        .set('Authorization', 'Bearer valid-token')
        .send({ description: 'Updated Lunch' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated Lunch');
      expect(mockExpensesService.update).toHaveBeenCalledWith(
        'exp-1',
        'user-1',
        expect.objectContaining({ description: 'Updated Lunch' })
      );
    });

    it('should return 400 for forbidden extra fields', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/expenses/exp-1')
        .set('Authorization', 'Bearer valid-token')
        .send({ hackerField: 'injection' })
        .expect(400);
    });

    it('should return 404 when expense not found', async () => {
      mockExpensesService.update.mockRejectedValue(
        new (await import('@nestjs/common')).NotFoundException('Expense not found')
      );

      await request(app.getHttpServer())
        .patch('/api/v1/expenses/nonexistent')
        .set('Authorization', 'Bearer valid-token')
        .send({ description: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/expenses/:id', () => {
    it('should return 200 on successful deletion', async () => {
      mockExpensesService.remove.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/expenses/exp-1')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockExpensesService.remove).toHaveBeenCalledWith('exp-1', 'user-1');
    });

    it('should return 404 when expense not found', async () => {
      mockExpensesService.remove.mockRejectedValue(
        new (await import('@nestjs/common')).NotFoundException('Expense not found')
      );

      await request(app.getHttpServer())
        .delete('/api/v1/expenses/nonexistent')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });
});
