import { Controller, Get } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  @Get()
  findAll() {
    return { message: 'Get all notifications - TODO' };
  }
}
