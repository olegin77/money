import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Enable2FADto } from '../dto/enable-2fa.dto';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { Public } from '../decorators/public.decorator';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';

@Controller('auth')
@Throttle({ default: { ttl: 60000, limit: 100 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);

    return {
      success: true,
      message: 'Registration successful',
      data: result,
    };
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || 'unknown';

    const result = await this.authService.login(loginDto, userAgent, ipAddress);

    if (result.requires2FA) {
      return {
        success: false,
        message: '2FA code required',
        requires2FA: true,
        data: {
          userId: result.user.id,
        },
      };
    }

    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: CurrentUserData, @Body() body: RefreshTokenDto) {
    await this.authService.logout(user.id, body.refreshToken);

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: CurrentUserData) {
    await this.authService.logoutAll(user.id);

    return {
      success: true,
      message: 'Logged out from all devices',
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const tokens = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
      userAgent,
      ipAddress
    );

    return {
      success: true,
      message: 'Tokens refreshed',
      data: tokens,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: CurrentUserData) {
    return {
      success: true,
      data: user,
    };
  }

  // 2FA endpoints
  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  @HttpCode(HttpStatus.OK)
  async generate2FA(@CurrentUser() user: CurrentUserData) {
    const result = await this.authService.generate2FASecret(user.id);

    return {
      success: true,
      message: '2FA secret generated. Scan QR code with authenticator app.',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  async enable2FA(@CurrentUser() user: CurrentUserData, @Body() dto: Enable2FADto) {
    await this.authService.enable2FA(user.id, dto.code);

    return {
      success: true,
      message: '2FA enabled successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disable2FA(@CurrentUser() user: CurrentUserData, @Body() dto: Verify2FADto) {
    await this.authService.disable2FA(user.id, dto.code);

    return {
      success: true,
      message: '2FA disabled successfully',
    };
  }

  // Password reset endpoints
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);

    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);

    return {
      success: true,
      message: 'Password reset successful',
    };
  }
}
