import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');

    if (host && port) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: parseInt(port, 10) === 465,
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
      this.logger.log(`Mail transport configured: ${host}:${port}`);
    } else {
      this.logger.warn(
        'SMTP not configured — emails will be logged to console',
      );
    }
  }

  private get fromAddress(): string {
    return (
      this.configService.get('MAIL_FROM') || 'FinTrack <noreply@fintrack.app>'
    );
  }

  private get appUrl(): string {
    return this.configService.get('APP_URL') || 'http://localhost:3000';
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const resetLink = `${this.appUrl}/reset-password?token=${resetToken}`;
    const subject = 'Reset your password — FinTrack';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          You requested a password reset for your FinTrack account. Click the button below to set a new password.
          This link expires in 15 minutes.
        </p>
        <a href="${resetLink}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    await this.send(email, subject, html);
  }

  async sendWelcome(email: string, username: string): Promise<void> {
    const subject = 'Welcome to FinTrack!';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111; margin-bottom: 16px;">Welcome, ${username}!</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Your FinTrack account is ready. Start tracking your finances today.
        </p>
        <a href="${this.appUrl}/dashboard" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Go to Dashboard
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Quick tips: Press Ctrl+N to add an expense, Ctrl+I for income.
        </p>
      </div>
    `;

    await this.send(email, subject, html);
  }

  async sendBudgetAlert(
    email: string,
    categoryName: string,
    spent: number,
    budget: number,
  ): Promise<void> {
    const percentage = Math.round((spent / budget) * 100);
    const subject = `Budget alert: ${categoryName} at ${percentage}%`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111; margin-bottom: 16px;">Budget Alert</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Your <strong>${categoryName}</strong> budget has reached <strong>${percentage}%</strong>.
        </p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #333;">
            Spent: <strong>$${spent.toFixed(2)}</strong> / $${budget.toFixed(2)}
          </p>
          <div style="background: #e5e5e5; border-radius: 4px; height: 8px; margin-top: 8px; overflow: hidden;">
            <div style="background: ${percentage >= 100 ? '#ef4444' : '#f59e0b'}; height: 100%; width: ${Math.min(percentage, 100)}%; border-radius: 4px;"></div>
          </div>
        </div>
        <a href="${this.appUrl}/analytics" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          View Analytics
        </a>
      </div>
    `;

    await this.send(email, subject, html);
  }

  private async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[MAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }
}
