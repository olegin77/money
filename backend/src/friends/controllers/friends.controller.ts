import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { FriendsService } from '../services/friends.service';
import { SendFriendRequestDto } from '../dto/send-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/decorators/current-user.decorator';

@ApiTags('Friends')
@ApiErrorResponses()
@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  async getFriends(@CurrentUser() user: CurrentUserData) {
    const friends = await this.friendsService.getFriends(user.id);

    return {
      success: true,
      data: friends,
    };
  }

  @Get('requests/pending')
  async getPendingRequests(@CurrentUser() user: CurrentUserData) {
    const requests = await this.friendsService.getPendingRequests(user.id);

    return {
      success: true,
      data: requests,
    };
  }

  @Get('requests/sent')
  async getSentRequests(@CurrentUser() user: CurrentUserData) {
    const requests = await this.friendsService.getSentRequests(user.id);

    return {
      success: true,
      data: requests,
    };
  }

  @Get('search')
  async searchUsers(@CurrentUser() user: CurrentUserData, @Query('q') query: string) {
    const users = await this.friendsService.searchUsers(query, user.id);

    return {
      success: true,
      data: users,
    };
  }

  @Post('request')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async sendRequest(@CurrentUser() user: CurrentUserData, @Body() dto: SendFriendRequestDto) {
    const friendship = await this.friendsService.sendRequest(user.id, dto);

    return {
      success: true,
      message: 'Friend request sent',
      data: friendship,
    };
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptRequest(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const friendship = await this.friendsService.acceptRequest(id, user.id);

    return {
      success: true,
      message: 'Friend request accepted',
      data: friendship,
    };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectRequest(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    await this.friendsService.rejectRequest(id, user.id);

    return {
      success: true,
      message: 'Friend request rejected',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeFriend(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    await this.friendsService.removeFriend(id, user.id);

    return {
      success: true,
      message: 'Friend removed',
    };
  }
}
