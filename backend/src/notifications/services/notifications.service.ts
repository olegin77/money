import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { UpdateNotificationPreferenceDto } from '../dto/update-notification-preference.dto';
import { EventsGateway } from '../../common/gateways/events.gateway';

/** Maps NotificationType to the corresponding preference flag. */
const TYPE_TO_PREFERENCE: Record<NotificationType, keyof NotificationPreference | null> = {
  [NotificationType.BUDGET_WARNING]: 'budgetAlerts',
  [NotificationType.BUDGET_EXCEEDED]: 'budgetAlerts',
  [NotificationType.FRIEND_REQUEST]: 'friendRequests',
  [NotificationType.FRIEND_ACCEPTED]: 'friendRequests',
  [NotificationType.PERIMETER_SHARED]: 'perimeterShares',
  [NotificationType.SYSTEM]: null, // system notifications always send
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    private eventsGateway: EventsGateway,
  ) {}

  // ─── Preferences ──────────────────────────────────────────────

  async getPreferences(userId: string): Promise<NotificationPreference> {
    let prefs = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!prefs) {
      // Create default preferences
      prefs = this.preferenceRepository.create({ userId });
      prefs = await this.preferenceRepository.save(prefs);
    }

    return prefs;
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    let prefs = await this.getPreferences(userId);

    Object.assign(prefs, dto);
    prefs = await this.preferenceRepository.save(prefs);

    return prefs;
  }

  /**
   * Check whether a notification of the given type should be delivered
   * to the user based on their preferences.
   */
  async shouldNotify(
    userId: string,
    type: NotificationType,
  ): Promise<boolean> {
    const prefKey = TYPE_TO_PREFERENCE[type];

    // System notifications always go through
    if (prefKey === null) {
      return true;
    }

    const prefs = await this.getPreferences(userId);
    return !!prefs[prefKey];
  }

  // ─── Core CRUD ────────────────────────────────────────────────

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message?: string,
    data?: Record<string, unknown>,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      data,
    });

    const saved = await this.notificationRepository.save(notification);

    // Push real-time notification via WebSocket
    this.eventsGateway.emitToUser(userId, 'notification', {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      message: saved.message,
      data: saved.data,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: Notification[]; total: number; unread: number }> {
    const [items, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unread = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return { items, total, unread };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepository.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }

  // ─── Convenience methods for creating typed notifications ─────

  async notifyFriendRequest(userId: string, fromUsername: string): Promise<void> {
    if (!(await this.shouldNotify(userId, NotificationType.FRIEND_REQUEST))) {
      return;
    }
    await this.create(
      userId,
      NotificationType.FRIEND_REQUEST,
      'New friend request',
      `${fromUsername} sent you a friend request`,
      { fromUsername },
    );
  }

  async notifyFriendAccepted(userId: string, friendUsername: string): Promise<void> {
    if (!(await this.shouldNotify(userId, NotificationType.FRIEND_ACCEPTED))) {
      return;
    }
    await this.create(
      userId,
      NotificationType.FRIEND_ACCEPTED,
      'Friend request accepted',
      `${friendUsername} accepted your friend request`,
      { friendUsername },
    );
  }

  async notifyBudgetWarning(
    userId: string,
    perimeterName: string,
    percentage: number,
  ): Promise<void> {
    if (!(await this.shouldNotify(userId, NotificationType.BUDGET_WARNING))) {
      return;
    }
    await this.create(
      userId,
      NotificationType.BUDGET_WARNING,
      'Budget warning',
      `You've used ${percentage}% of your ${perimeterName} budget`,
      { perimeterName, percentage },
    );
  }

  async notifyBudgetExceeded(
    userId: string,
    perimeterName: string,
  ): Promise<void> {
    if (!(await this.shouldNotify(userId, NotificationType.BUDGET_EXCEEDED))) {
      return;
    }
    await this.create(
      userId,
      NotificationType.BUDGET_EXCEEDED,
      'Budget exceeded',
      `You've exceeded your ${perimeterName} budget`,
      { perimeterName },
    );
  }

  async notifyPerimeterShared(
    userId: string,
    perimeterName: string,
    sharedByUsername: string,
  ): Promise<void> {
    if (!(await this.shouldNotify(userId, NotificationType.PERIMETER_SHARED))) {
      return;
    }
    await this.create(
      userId,
      NotificationType.PERIMETER_SHARED,
      'Category shared with you',
      `${sharedByUsername} shared "${perimeterName}" with you`,
      { perimeterName, sharedByUsername },
    );
  }
}
