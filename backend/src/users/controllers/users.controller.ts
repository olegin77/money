import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  // @UseGuards(JwtAuthGuard) // TODO: uncomment when auth is ready
  getProfile() {
    return { message: 'Get current user profile' };
  }
}
