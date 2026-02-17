import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perimeter } from '../entities/perimeter.entity';
import { PerimeterShare } from '../entities/perimeter-share.entity';
import { CreatePerimeterDto } from '../dto/create-perimeter.dto';
import { UpdatePerimeterDto } from '../dto/update-perimeter.dto';
import { SharePerimeterDto } from '../dto/share-perimeter.dto';
import { Expense } from '../../expenses/entities/expense.entity';

@Injectable()
export class PerimetersService {
  constructor(
    @InjectRepository(Perimeter)
    private readonly perimeterRepository: Repository<Perimeter>,
    @InjectRepository(PerimeterShare)
    private readonly perimeterShareRepository: Repository<PerimeterShare>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>
  ) {}

  async create(userId: string, createPerimeterDto: CreatePerimeterDto): Promise<Perimeter> {
    const perimeter = this.perimeterRepository.create({
      ...createPerimeterDto,
      ownerId: userId,
    });

    return this.perimeterRepository.save(perimeter);
  }

  async findAll(userId: string): Promise<Perimeter[]> {
    // Get owned perimeters
    const owned = await this.perimeterRepository.find({
      where: { ownerId: userId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    // Get shared perimeters
    const shares = await this.perimeterShareRepository.find({
      where: { sharedWithId: userId },
      relations: ['perimeter'],
    });

    const shared = shares
      .filter((share) => !share.perimeter.isDeleted)
      .map((share) => ({
        ...share.perimeter,
        sharedRole: share.role,
      }));

    return [...owned, ...shared];
  }

  async findOne(id: string, userId: string): Promise<Perimeter> {
    const perimeter = await this.perimeterRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!perimeter) {
      throw new NotFoundException('Perimeter not found');
    }

    // Check access
    await this.checkAccess(id, userId, 'viewer');

    return perimeter;
  }

  async update(
    id: string,
    userId: string,
    updatePerimeterDto: UpdatePerimeterDto
  ): Promise<Perimeter> {
    const perimeter = await this.findOne(id, userId);

    // Check if user has permission to update
    await this.checkAccess(id, userId, 'manager');

    Object.assign(perimeter, updatePerimeterDto);

    return this.perimeterRepository.save(perimeter);
  }

  async remove(id: string, userId: string): Promise<void> {
    const perimeter = await this.findOne(id, userId);

    // Only owner can delete
    if (perimeter.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete this perimeter');
    }

    // Soft delete
    perimeter.isDeleted = true;
    await this.perimeterRepository.save(perimeter);
  }

  async share(
    id: string,
    userId: string,
    sharePerimeterDto: SharePerimeterDto
  ): Promise<PerimeterShare> {
    const perimeter = await this.findOne(id, userId);

    // Only owner or manager can share
    await this.checkAccess(id, userId, 'manager');

    // Check if already shared
    const existingShare = await this.perimeterShareRepository.findOne({
      where: {
        perimeterId: id,
        sharedWithId: sharePerimeterDto.userId,
      },
    });

    if (existingShare) {
      // Update role
      existingShare.role = sharePerimeterDto.role;
      return this.perimeterShareRepository.save(existingShare);
    }

    // Create new share
    const share = this.perimeterShareRepository.create({
      perimeterId: id,
      sharedWithId: sharePerimeterDto.userId,
      role: sharePerimeterDto.role,
    });

    // Mark perimeter as shared
    perimeter.isShared = true;
    await this.perimeterRepository.save(perimeter);

    return this.perimeterShareRepository.save(share);
  }

  async unshare(id: string, userId: string, targetUserId: string): Promise<void> {
    await this.checkAccess(id, userId, 'manager');

    const share = await this.perimeterShareRepository.findOne({
      where: {
        perimeterId: id,
        sharedWithId: targetUserId,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    await this.perimeterShareRepository.remove(share);

    // Check if still shared with others
    const remainingShares = await this.perimeterShareRepository.count({
      where: { perimeterId: id },
    });

    if (remainingShares === 0) {
      const perimeter = await this.perimeterRepository.findOne({ where: { id } });
      if (perimeter) {
        perimeter.isShared = false;
        await this.perimeterRepository.save(perimeter);
      }
    }
  }

  async getShares(id: string, userId: string): Promise<PerimeterShare[]> {
    await this.checkAccess(id, userId, 'viewer');

    return this.perimeterShareRepository.find({
      where: { perimeterId: id },
      relations: ['sharedWith'],
    });
  }

  async getBudgetStatus(id: string, userId: string) {
    await this.checkAccess(id, userId, 'viewer');

    const perimeter = await this.findOne(id, userId);

    if (!perimeter.budget) {
      return {
        budget: 0,
        spent: 0,
        remaining: 0,
        percentage: 0,
      };
    }

    // Calculate date range based on budget period
    const { startDate, endDate } = this.getBudgetPeriodDates(
      perimeter.budgetPeriod || 'monthly'
    );

    // Get total spent in period
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.categoryId = :categoryId', { categoryId: id })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    const spent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const remaining = perimeter.budget - spent;
    const percentage = (spent / perimeter.budget) * 100;

    return {
      budget: perimeter.budget,
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      period: perimeter.budgetPeriod,
      startDate,
      endDate,
    };
  }

  private async checkAccess(
    perimeterId: string,
    userId: string,
    requiredRole: 'viewer' | 'contributor' | 'manager'
  ): Promise<void> {
    const perimeter = await this.perimeterRepository.findOne({
      where: { id: perimeterId, isDeleted: false },
    });

    if (!perimeter) {
      throw new NotFoundException('Perimeter not found');
    }

    // Owner has all permissions
    if (perimeter.ownerId === userId) {
      return;
    }

    // Check shared access
    const share = await this.perimeterShareRepository.findOne({
      where: {
        perimeterId,
        sharedWithId: userId,
      },
    });

    if (!share) {
      throw new ForbiddenException('You do not have access to this perimeter');
    }

    // Check role hierarchy
    const roleHierarchy = {
      viewer: 1,
      contributor: 2,
      manager: 3,
    };

    if (roleHierarchy[share.role] < roleHierarchy[requiredRole]) {
      throw new ForbiddenException(
        `You need ${requiredRole} role to perform this action`
      );
    }
  }

  private getBudgetPeriodDates(period: string): { startDate: string; endDate: string } {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'monthly':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate,
    };
  }
}
