import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let configValues: Record<string, string>;

  beforeEach(async () => {
    configValues = {
      APP_URL: 'https://fintrack.app',
      MAIL_FROM: 'FinTrack <noreply@fintrack.app>',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configValues[key]),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordReset', () => {
    it('should not throw when SMTP is not configured (console fallback)', async () => {
      await expect(
        service.sendPasswordReset('test@test.com', 'reset-token-123'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendWelcome', () => {
    it('should not throw when SMTP is not configured (console fallback)', async () => {
      await expect(
        service.sendWelcome('test@test.com', 'testuser'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendBudgetAlert', () => {
    it('should not throw when SMTP is not configured (console fallback)', async () => {
      await expect(
        service.sendBudgetAlert('test@test.com', 'Food', 450, 500),
      ).resolves.toBeUndefined();
    });
  });
});
