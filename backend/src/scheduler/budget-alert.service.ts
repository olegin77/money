import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perimeter } from '../perimeters/entities/perimeter.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/services/notifications.service';

@Injectable()
export class BudgetAlertService {
  private readonly logger = new Logger(BudgetAlertService.name);
  // Track alerts sent to avoid duplicates (reset daily)
  private alertsSent = new Set<string>();

  constructor(
    @InjectRepository(Perimeter)
    private readonly perimeterRepository: Repository<Perimeter>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkBudgets() {
    try {
      const perimeters = await this.perimeterRepository.find({
        where: { isDeleted: false },
      });

      const budgeted = perimeters.filter(p => p.budget && Number(p.budget) > 0);

      for (const perimeter of budgeted) {
        await this.checkPerimeterBudget(perimeter);
      }
    } catch (error) {
      this.logger.error('Budget alert check failed', error);
    }
  }

  // Reset duplicate tracking daily
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  resetAlerts() {
    this.alertsSent.clear();
  }

  private async checkPerimeterBudget(perimeter: Perimeter) {
    const { startDate, endDate } = this.getBudgetPeriodDates(perimeter.budgetPeriod || 'monthly');

    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.categoryId = :categoryId', { categoryId: perimeter.id })
      .andWhere('expense.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const spent = Number(result?.total || 0);
    const budget = Number(perimeter.budget);
    const percentage = Math.round((spent / budget) * 100);

    // Check if user has budget alerts enabled
    const user = await this.userRepository.findOne({
      where: { id: perimeter.ownerId },
    });
    if (!user || !user.notifyBudgetAlerts) return;

    const alertKey = `${perimeter.id}-${percentage >= 100 ? 'exceeded' : 'warning'}`;
    if (this.alertsSent.has(alertKey)) return;

    if (percentage >= 100) {
      await this.notificationsService.notifyBudgetExceeded(
        perimeter.ownerId,
        perimeter.name,
      );
      this.alertsSent.add(alertKey);
      this.logger.log(`Budget exceeded alert: ${perimeter.name} (${percentage}%)`);
    } else if (percentage >= 80) {
      await this.notificationsService.notifyBudgetWarning(
        perimeter.ownerId,
        perimeter.name,
        percentage,
      );
      this.alertsSent.add(alertKey);
      this.logger.log(`Budget warning alert: ${perimeter.name} (${percentage}%)`);
    }
  }

  private getBudgetPeriodDates(period: string): { startDate: string; endDate: string } {
    const now = new Date();
    let start: Date;

    switch (period) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        start = new Date(now);
        start.setDate(start.getDate() - start.getDay());
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'monthly':
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
  }
}
