import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

import { UsersService } from '../../users/services/users.service';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { JwtRefreshPayload } from '../strategies/jwt-refresh.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    user: Partial<User>;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const { email, username, password, ...rest } = registerDto;

    // Check if user already exists
    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUserByUsername = await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
      ...rest,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove sensitive data
    const { password: _, twoFaSecret: __, ...userWithoutSensitive } = user;

    return {
      user: userWithoutSensitive,
      tokens,
    };
  }

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{
    user: Partial<User>;
    tokens: { accessToken: string; refreshToken: string };
    requires2FA?: boolean;
  }> {
    const { email, password, twoFaCode } = loginDto;

    // Validate credentials
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.twoFaEnabled) {
      if (!twoFaCode) {
        return {
          user: { id: user.id, email: user.email },
          requires2FA: true,
          tokens: null,
        };
      }

      // Verify 2FA code
      const is2FAValid = this.verify2FACode(user.twoFaSecret, twoFaCode);
      if (!is2FAValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Update last login
    await this.usersService.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, userAgent, ipAddress);

    // Remove sensitive data
    const { password: _, twoFaSecret: __, ...userWithoutSensitive } = user;

    return {
      user: userWithoutSensitive,
      tokens,
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, userId },
    });

    if (token) {
      token.isRevoked = true;
      await this.refreshTokenRepository.save(token);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  async refreshTokens(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify refresh token
    let payload: JwtRefreshPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token exists and not revoked
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        userId: payload.sub,
        isRevoked: false,
      },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Refresh token not found or revoked');
    }

    // Check if token expired
    if (tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Revoke old refresh token
    tokenEntity.isRevoked = true;
    await this.refreshTokenRepository.save(tokenEntity);

    // Generate new tokens
    return this.generateTokens(user, userAgent, ipAddress);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async generate2FASecret(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFaEnabled) {
      throw new BadRequestException('2FA already enabled');
    }

    const secret = speakeasy.generateSecret({
      name: `${this.configService.get('TWO_FA_APP_NAME')} (${user.email})`,
      length: 32,
    });

    // Temporarily store secret (not yet enabled)
    await this.usersService.update(userId, {
      twoFaSecret: secret.base32,
    });

    // Generate QR code
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async enable2FA(userId: string, code: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFaSecret) {
      throw new BadRequestException('2FA secret not generated');
    }

    // Verify code
    const isValid = this.verify2FACode(user.twoFaSecret, code);
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Enable 2FA
    await this.usersService.update(userId, {
      twoFaEnabled: true,
    });
  }

  async disable2FA(userId: string, code: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFaEnabled) {
      throw new BadRequestException('2FA not enabled');
    }

    // Verify code
    const isValid = this.verify2FACode(user.twoFaSecret, code);
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Disable 2FA
    await this.usersService.update(userId, {
      twoFaEnabled: false,
      twoFaSecret: null,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // TODO: Generate reset token and send email
    // For now, just log it
    const resetToken = uuidv4();
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${this.configService.get('APP_URL')}/reset-password?token=${resetToken}`);

    // In production, you would:
    // 1. Store reset token in database with expiry
    // 2. Send email with reset link
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Implement password reset logic
    // For now, throw not implemented
    throw new BadRequestException('Password reset not yet implemented');

    // In production:
    // 1. Validate reset token
    // 2. Check if token expired
    // 3. Hash new password
    // 4. Update user password
    // 5. Invalidate reset token
    // 6. Revoke all refresh tokens
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get('BCRYPT_ROUNDS') || 12;
    return bcrypt.hash(password, parseInt(rounds.toString()));
  }

  private async generateTokens(
    user: User,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const tokenId = uuidv4();
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      email: user.email,
      tokenId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION') || '15m',
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.save({
      id: tokenId,
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private verify2FACode(secret: string, code: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 steps before/after for clock skew
    });
  }
}
