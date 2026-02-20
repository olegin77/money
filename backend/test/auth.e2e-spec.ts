import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../src/auth/services/auth.service';
import { AuthController } from '../src/auth/controllers/auth.controller';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Auth e2e tests using a minimal module setup.
 * We mock the AuthService to avoid needing a real database or Redis.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    fullName: 'Test User',
    currency: 'USD',
    isActive: true,
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
    refreshTokens: jest.fn(),
    getProfile: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    generate2FASecret: jest.fn(),
    enable2FA: jest.fn(),
    disable2FA: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: context => {
          const req = context.switchToHttp().getRequest();
          // If Authorization header is present, simulate authenticated user
          if (req.headers.authorization) {
            req.user = mockUser;
            return true;
          }
          return false;
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

  describe('POST /api/v1/auth/register', () => {
    it('should return 201 on successful registration', async () => {
      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'new@test.com',
          username: 'newuser',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          username: 'newuser',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should return 400 for missing password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'new@test.com',
          username: 'newuser',
        })
        .expect(400);
    });

    it('should return 400 for weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'new@test.com',
          username: 'newuser',
          password: '123',
        })
        .expect(400);
    });

    it('should return 400 for missing username', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'new@test.com',
          password: 'Password123!',
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 on successful login', async () => {
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
        requires2FA: false,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      mockAuthService.login.mockRejectedValue(
        new (await import('@nestjs/common')).UnauthorizedException('Invalid credentials')
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should handle 2FA requirement', async () => {
      mockAuthService.login.mockResolvedValue({
        user: { id: 'user-1', email: 'test@test.com' },
        tokens: null,
        requires2FA: true,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.requires2FA).toBe(true);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 200 with user data when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });

    it('should return 403 without authorization header', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(403);
    });
  });
});
