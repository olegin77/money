import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { MailService } from '../../mail/mail.service';
import { RefreshToken } from '../entities/refresh-token.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let mailService: Partial<Record<keyof MailService, jest.Mock>>;
  let refreshTokenRepo: Record<string, jest.Mock>;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    password: '$2b$12$hashedpassword',
    twoFaEnabled: false,
    twoFaSecret: null,
    isActive: true,
    lastLoginAt: null,
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };

    mailService = {
      sendWelcome: jest.fn().mockResolvedValue(undefined),
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    };

    refreshTokenRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-value') } },
        { provide: MailService, useValue: mailService },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokenRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@test.com',
      username: 'newuser',
      password: 'Password123!',
    };

    it('should register a new user and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersService.create.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        username: registerDto.username,
      });

      const result = await service.register(registerDto);

      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe('mock-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('twoFaSecret');
      expect(mailService.sendWelcome).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username already taken', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@test.com', password: 'Password123!' };

    it('should login and return user with tokens', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersService.update.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return requires2FA when 2FA enabled and no code provided', async () => {
      const user2FA = { ...mockUser, twoFaEnabled: true, twoFaSecret: 'secret' };
      usersService.findByEmail.mockResolvedValue(user2FA);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.requires2FA).toBe(true);
      expect(result.tokens).toBeNull();
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      const tokenEntity = { token: 'refresh-token', userId: 'user-1', isRevoked: false };
      refreshTokenRepo.findOne.mockResolvedValue(tokenEntity);

      await service.logout('user-1', 'refresh-token');

      expect(tokenEntity.isRevoked).toBe(true);
      expect(refreshTokenRepo.save).toHaveBeenCalledWith(tokenEntity);
    });

    it('should not throw if token not found', async () => {
      refreshTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.logout('user-1', 'invalid')).resolves.toBeUndefined();
    });
  });

  describe('logoutAll', () => {
    it('should revoke all user refresh tokens', async () => {
      await service.logoutAll('user-1');

      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        { userId: 'user-1', isRevoked: false },
        { isRevoked: true },
      );
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshTokens('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token not found in DB', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'test@test.com', tokenId: 'tid' });
      refreshTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens('valid-jwt')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'test@test.com', tokenId: 'tid' });
      refreshTokenRepo.findOne.mockResolvedValue({
        token: 'valid-jwt',
        expiresAt: new Date('2020-01-01'),
        isRevoked: false,
      });

      await expect(service.refreshTokens('valid-jwt')).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens on valid refresh', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'test@test.com', tokenId: 'tid' });
      const tokenEntity = {
        token: 'valid-jwt',
        expiresAt: new Date('2030-01-01'),
        isRevoked: false,
      };
      refreshTokenRepo.findOne.mockResolvedValue(tokenEntity);
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.refreshTokens('valid-jwt');

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(tokenEntity.isRevoked).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should not reveal if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('unknown@test.com')).resolves.toBeUndefined();
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('should send password reset email for existing user', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await service.forgotPassword('test@test.com');

      expect(jwtService.sign).toHaveBeenCalled();
      expect(mailService.sendPasswordReset).toHaveBeenCalledWith(
        mockUser.email,
        'mock-token',
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.resetPassword('bad-token', 'NewPass123!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for wrong token type', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'test@test.com', type: 'other' });

      await expect(service.resetPassword('token', 'NewPass123!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reset password and revoke all tokens', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'test@test.com',
        type: 'password-reset',
      });
      usersService.findById.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');

      await service.resetPassword('valid-token', 'NewPass123!');

      expect(usersService.update).toHaveBeenCalledWith('user-1', {
        password: 'new-hashed',
      });
      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        { userId: 'user-1', isRevoked: false },
        { isRevoked: true },
      );
    });
  });
});
