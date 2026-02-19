import { Controller, Get, Post, Patch, Body, UseGuards, Delete, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() currentUser: CurrentUserData) {
    const user = await this.usersService.findById(currentUser.id);

    const { password, twoFaSecret, ...userWithoutSensitive } = user;

    return {
      success: true,
      data: userWithoutSensitive,
    };
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const user = await this.usersService.update(currentUser.id, updateUserDto);

    const { password, twoFaSecret, ...userWithoutSensitive } = user;

    return {
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutSensitive,
    };
  }

  @Delete('me')
  async deleteAccount(@CurrentUser() currentUser: CurrentUserData) {
    await this.usersService.delete(currentUser.id);

    return {
      success: true,
      message: 'Account scheduled for deletion in 30 days. Log in again to cancel.',
    };
  }

  @Post('me/cancel-deletion')
  @HttpCode(HttpStatus.OK)
  async cancelDeletion(@CurrentUser() currentUser: CurrentUserData) {
    await this.usersService.cancelDeletion(currentUser.id);

    return {
      success: true,
      message: 'Account deletion cancelled',
    };
  }

  // GDPR: Data processing consent
  @Post('me/consent')
  @HttpCode(HttpStatus.OK)
  async giveConsent(@CurrentUser() currentUser: CurrentUserData) {
    await this.usersService.update(currentUser.id, {
      consentGivenAt: new Date(),
    });

    return {
      success: true,
      message: 'Data processing consent recorded',
      data: { consentGivenAt: new Date() },
    };
  }

  // GDPR: Data portability export
  @Get('me/export')
  async exportData(@CurrentUser() currentUser: CurrentUserData, @Res() res: Response) {
    const data = await this.usersService.exportUserData(currentUser.id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fintrack-export-${currentUser.id}.json"`
    );
    res.send(JSON.stringify(data, null, 2));
  }
}
