import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll() {
    return { message: 'Get all notifications - TODO' };
  }
}
