import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource
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

  async findAllAdmin(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.username ILIKE :search OR user.email ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((user) => {
        const { password, twoFaSecret, ...userData } = user;
        return userData;
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminStats() {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      adminUsers,
      users2FA,
      recentUsers,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { emailVerified: true } }),
      this.userRepository.count({ where: { isAdmin: true } }),
      this.userRepository.count({ where: { twoFaEnabled: true } }),
      this.userRepository.count({
        where: {
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) as any,
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      adminUsers,
      users2FA,
      recentUsers,
    };
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto): Promise<User> {
    await this.userRepository.update(id, dto);
    return this.findById(id);
  }

  // GDPR: Export all user data (data portability)
  async exportUserData(userId: string): Promise<object> {
    const user = await this.findById(userId);
    const { password, twoFaSecret, ...safeUser } = user;

    // Fetch all related data
    const [expenses, incomes, perimeters] = await Promise.all([
      this.dataSource.query(
        'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
        [userId]
      ),
      this.dataSource.query(
        'SELECT * FROM income_records WHERE user_id = $1 ORDER BY date DESC',
        [userId]
      ),
      this.dataSource.query(
        'SELECT * FROM perimeters WHERE owner_id = $1',
        [userId]
      ),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user: safeUser,
      expenses,
      incomes,
      perimeters,
    };
  }
}
