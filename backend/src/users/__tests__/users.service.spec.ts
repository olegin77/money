import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Record<string, jest.Mock>;
  let dataSource: Record<string, jest.Mock>;

  const mockUser: Partial<User> = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    password: '$2b$12$hashedpassword',
    fullName: 'Test User',
    currency: 'USD',
    language: 'en',
    isActive: true,
    isAdmin: false,
    emailVerified: false,
    twoFaEnabled: false,
    twoFaSecret: null,
    scheduledForDeletionAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation(data => ({ ...data })),
      save: jest.fn().mockImplementation(entity => Promise.resolve({ ...mockUser, ...entity })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn().mockResolvedValue(10),
      createQueryBuilder: jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      }),
    };

    dataSource = {
      query: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should return null when user not found', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@test.com');

      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });

    it('should return null when email not found', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('missing@test.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const userData = {
        email: 'new@test.com',
        username: 'newuser',
        password: 'hashed-password',
      };

      const result = await service.create(userData);

      expect(repo.create).toHaveBeenCalledWith(userData);
      expect(repo.save).toHaveBeenCalled();
      expect(result.email).toBeDefined();
    });

    it('should pass all provided fields to create', async () => {
      const userData = {
        email: 'new@test.com',
        username: 'newuser',
        password: 'hashed-password',
        fullName: 'New User',
        currency: 'EUR',
      };

      await service.create(userData);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'New User',
          currency: 'EUR',
        })
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      repo.findOne.mockResolvedValue({ ...mockUser, fullName: 'Updated Name' });

      const result = await service.update('user-1', { fullName: 'Updated Name' });

      expect(repo.update).toHaveBeenCalledWith('user-1', {
        fullName: 'Updated Name',
      });
      expect(result.fullName).toBe('Updated Name');
    });

    it('should call update with the correct id', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      await service.update('user-1', { language: 'ru' });

      expect(repo.update).toHaveBeenCalledWith('user-1', { language: 'ru' });
    });
  });

  describe('delete', () => {
    it('should soft-delete by setting isActive to false and scheduling deletion', async () => {
      await service.delete('user-1');

      expect(repo.update).toHaveBeenCalledWith('user-1', {
        isActive: false,
        scheduledForDeletionAt: expect.any(Date),
      });
    });

    it('should schedule deletion 30 days in the future', async () => {
      const now = Date.now();
      await service.delete('user-1');

      const callArgs = repo.update.mock.calls[0][1];
      const scheduledDate = callArgs.scheduledForDeletionAt.getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      // Allow 5 second tolerance
      expect(scheduledDate).toBeGreaterThan(now + thirtyDaysMs - 5000);
      expect(scheduledDate).toBeLessThan(now + thirtyDaysMs + 5000);
    });
  });

  describe('cancelDeletion', () => {
    it('should restore active status and clear scheduled deletion', async () => {
      await service.cancelDeletion('user-1');

      expect(repo.update).toHaveBeenCalledWith('user-1', {
        isActive: true,
        scheduledForDeletionAt: null,
      });
    });
  });

  describe('exportUserData', () => {
    it('should return user data as JSON by default', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      dataSource.query.mockResolvedValue([]);

      const result = await service.exportUserData('user-1');

      expect(result).toHaveProperty('exportedAt');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('expenses');
      expect(result).toHaveProperty('incomes');
      expect(result).toHaveProperty('perimeters');
    });

    it('should exclude password and twoFaSecret from exported user data', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      dataSource.query.mockResolvedValue([]);

      const result = (await service.exportUserData('user-1')) as Record<string, any>;

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('twoFaSecret');
    });

    it('should return CSV string when format is csv', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      dataSource.query.mockResolvedValue([]);

      const result = await service.exportUserData('user-1', 'csv');

      expect(typeof result).toBe('string');
      expect(result).toContain('# User Profile');
    });

    it('should query expenses, incomes and perimeters in parallel', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      dataSource.query.mockResolvedValue([]);

      await service.exportUserData('user-1');

      expect(dataSource.query).toHaveBeenCalledTimes(3);
      expect(dataSource.query).toHaveBeenCalledWith(expect.stringContaining('expenses'), [
        'user-1',
      ]);
      expect(dataSource.query).toHaveBeenCalledWith(expect.stringContaining('income_records'), [
        'user-1',
      ]);
      expect(dataSource.query).toHaveBeenCalledWith(expect.stringContaining('perimeters'), [
        'user-1',
      ]);
    });
  });

  describe('purgeScheduledDeletions', () => {
    it('should return count of purged users', async () => {
      const result = await service.purgeScheduledDeletions();

      expect(result).toBe(2);
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found by username', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });
  });
});
