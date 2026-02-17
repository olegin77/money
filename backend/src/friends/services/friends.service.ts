import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../../users/entities/user.entity';
import { SendFriendRequestDto } from '../dto/send-request.dto';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async sendRequest(requesterId: string, dto: SendFriendRequestDto): Promise<Friendship> {
    let addresseeId = dto.addresseeId;

    // Find user by email if provided
    if (!addresseeId && dto.email) {
      const user = await this.userRepository.findOne({ where: { email: dto.email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      addresseeId = user.id;
    }

    if (!addresseeId) {
      throw new BadRequestException('Either addresseeId or email is required');
    }

    // Can't send request to yourself
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if friendship already exists
    const existing = await this.friendshipRepository.findOne({
      where: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictException('Already friends');
      }
      if (existing.status === 'pending') {
        throw new ConflictException('Friend request already pending');
      }
      // If rejected, allow new request
      existing.status = 'pending';
      existing.requesterId = requesterId;
      existing.addresseeId = addresseeId;
      return this.friendshipRepository.save(existing);
    }

    // Create new request
    const friendship = this.friendshipRepository.create({
      requesterId,
      addresseeId,
      status: 'pending',
    });

    return this.friendshipRepository.save(friendship);
  }

  async acceptRequest(friendshipId: string, userId: string): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findOne({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    if (friendship.addresseeId !== userId) {
      throw new BadRequestException('Only the addressee can accept this request');
    }

    if (friendship.status !== 'pending') {
      throw new BadRequestException('Request is not pending');
    }

    friendship.status = 'accepted';
    return this.friendshipRepository.save(friendship);
  }

  async rejectRequest(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    if (friendship.addresseeId !== userId) {
      throw new BadRequestException('Only the addressee can reject this request');
    }

    friendship.status = 'rejected';
    await this.friendshipRepository.save(friendship);
  }

  async removeFriend(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    // Either party can remove friendship
    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw new BadRequestException('You are not part of this friendship');
    }

    await this.friendshipRepository.remove(friendship);
  }

  async getFriends(userId: string): Promise<any[]> {
    const friendships = await this.friendshipRepository.find({
      where: [
        { requesterId: userId, status: 'accepted' },
        { addresseeId: userId, status: 'accepted' },
      ],
      relations: ['requester', 'addressee'],
    });

    return friendships.map((friendship) => {
      const friend =
        friendship.requesterId === userId ? friendship.addressee : friendship.requester;

      const { password, twoFaSecret, ...friendData } = friend;

      return {
        friendshipId: friendship.id,
        friend: friendData,
        since: friendship.createdAt,
      };
    });
  }

  async getPendingRequests(userId: string): Promise<any[]> {
    const requests = await this.friendshipRepository.find({
      where: { addresseeId: userId, status: 'pending' },
      relations: ['requester'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => {
      const { password, twoFaSecret, ...userData } = request.requester;

      return {
        id: request.id,
        requester: userData,
        createdAt: request.createdAt,
      };
    });
  }

  async getSentRequests(userId: string): Promise<any[]> {
    const requests = await this.friendshipRepository.find({
      where: { requesterId: userId, status: 'pending' },
      relations: ['addressee'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => {
      const { password, twoFaSecret, ...userData } = request.addressee;

      return {
        id: request.id,
        addressee: userData,
        createdAt: request.createdAt,
      };
    });
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere(
        '(user.username ILIKE :query OR user.email ILIKE :query OR user.fullName ILIKE :query)',
        { query: `%${query}%` }
      )
      .limit(10)
      .getMany();

    return users.map((user) => {
      const { password, twoFaSecret, ...userData } = user;
      return userData as User;
    });
  }
}
