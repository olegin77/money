import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string
  ) {
    const users = await this.usersService.findAllAdmin({
      page: Number(page),
      limit: Number(limit),
      search,
    });

    return {
      success: true,
      data: users,
    };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.usersService.getAdminStats();

    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    return {
      success: true,
      data: user,
    };
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    const user = await this.usersService.adminUpdate(id, dto);

    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.delete(id);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
