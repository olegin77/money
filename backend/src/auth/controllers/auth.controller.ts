import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return { message: 'Register endpoint - TODO' };
  }

  @Post('login')
  login(@Body() body: any) {
    return { message: 'Login endpoint - TODO' };
  }

  @Post('logout')
  logout() {
    return { message: 'Logout endpoint - TODO' };
  }

  @Post('refresh')
  refresh(@Body() body: any) {
    return { message: 'Refresh token endpoint - TODO' };
  }
}
