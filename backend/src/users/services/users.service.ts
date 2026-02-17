import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
