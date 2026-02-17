import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsController } from './controllers/friends.controller';
import { FriendsService } from './services/friends.service';
import { Friendship } from './entities/friendship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship])],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
