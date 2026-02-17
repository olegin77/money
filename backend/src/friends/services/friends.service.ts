import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from '../entities/friendship.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>
  ) {}

  // TODO: Implement friendship logic
}
