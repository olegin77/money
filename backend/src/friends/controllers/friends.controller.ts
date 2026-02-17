import { Controller, Get, Post } from '@nestjs/common';
import { FriendsService } from '../services/friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  findAll() {
    return { message: 'Get all friends - TODO' };
  }

  @Post('request')
  sendRequest() {
    return { message: 'Send friend request - TODO' };
  }
}
