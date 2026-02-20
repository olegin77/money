import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from '../services/notifications.service';
import { Notification, NotificationType } from '../entities/notification.entity';
import { EventsGateway } from '../../common/gateways/events.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: Record<string, jest.Mock>;
  let eventsGateway: Partial<Record<keyof EventsGateway, jest.Mock>>;

  const mockNotification: Partial<Notification> = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.SYSTEM,
    title: 'Test notification',
    message: 'This is a test',
    data: null,
    isRead: false,
    createdAt: new Date('2026-02-10T10:00:00Z'),
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation(data => ({ ...data })),
      save: jest
        .fn()
        .mockImplementation(entity => Promise.resolve({ ...mockNotification, ...entity })),
      findAndCount: jest.fn().mockResolvedValue([[mockNotification], 1]),
      count: jest.fn().mockResolvedValue(3),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    eventsGateway = {
      emitToUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: repo },
        { provide: EventsGateway, useValue: eventsGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('findAll', () => {
    it('should return paginated notifications with total and unread count', async () => {
      const result = await service.findAll('user-1', 1, 20);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.unread).toBe(3);
    });

    it('should use correct pagination parameters', async () => {
      await service.findAll('user-1', 2, 10);

      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        skip: 10,
        take: 10,
      });
    });

    it('should use default pagination when not provided', async () => {
      await service.findAll('user-1');

      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should count unread notifications for the user', async () => {
      await service.findAll('user-1');

      expect(repo.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
    });

    it('should handle empty results', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      repo.count.mockResolvedValue(0);

      const result = await service.findAll('user-1');

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.unread).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      await service.markAsRead('notif-1', 'user-1');

      expect(repo.update).toHaveBeenCalledWith(
        { id: 'notif-1', userId: 'user-1' },
        { isRead: true }
      );
    });

    it('should only update the notification belonging to the user', async () => {
      await service.markAsRead('notif-1', 'user-2');

      expect(repo.update).toHaveBeenCalledWith(
        { id: 'notif-1', userId: 'user-2' },
        { isRead: true }
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read for a user', async () => {
      await service.markAllAsRead('user-1');

      expect(repo.update).toHaveBeenCalledWith(
        { userId: 'user-1', isRead: false },
        { isRead: true }
      );
    });

    it('should target only the specified user', async () => {
      await service.markAllAsRead('user-2');

      expect(repo.update).toHaveBeenCalledWith(
        { userId: 'user-2', isRead: false },
        { isRead: true }
      );
    });
  });

  describe('create', () => {
    it('should create a notification and emit via websocket', async () => {
      const result = await service.create(
        'user-1',
        NotificationType.SYSTEM,
        'Test Title',
        'Test message',
        { key: 'value' }
      );

      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: NotificationType.SYSTEM,
        title: 'Test Title',
        message: 'Test message',
        data: { key: 'value' },
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should emit real-time notification to user via websocket', async () => {
      await service.create(
        'user-1',
        NotificationType.BUDGET_WARNING,
        'Budget alert',
        'Warning message'
      );

      expect(eventsGateway.emitToUser).toHaveBeenCalledWith(
        'user-1',
        'notification',
        expect.objectContaining({
          type: NotificationType.BUDGET_WARNING,
          title: 'Budget alert',
          message: 'Warning message',
        })
      );
    });

    it('should create notification without optional message and data', async () => {
      await service.create('user-1', NotificationType.SYSTEM, 'Simple Title');

      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: NotificationType.SYSTEM,
        title: 'Simple Title',
        message: undefined,
        data: undefined,
      });
    });

    it('should handle friend request notifications', async () => {
      await service.notifyFriendRequest('user-1', 'john');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.FRIEND_REQUEST,
          title: 'New friend request',
        })
      );
    });

    it('should handle budget exceeded notifications', async () => {
      await service.notifyBudgetExceeded('user-1', 'Food');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.BUDGET_EXCEEDED,
          title: 'Budget exceeded',
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a notification by id and userId', async () => {
      await service.delete('notif-1', 'user-1');

      expect(repo.delete).toHaveBeenCalledWith({
        id: 'notif-1',
        userId: 'user-1',
      });
    });

    it('should only delete notification belonging to the user', async () => {
      await service.delete('notif-1', 'user-2');

      expect(repo.delete).toHaveBeenCalledWith({
        id: 'notif-1',
        userId: 'user-2',
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(3);
      expect(repo.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
    });
  });

  describe('convenience methods', () => {
    it('should create friend accepted notification', async () => {
      await service.notifyFriendAccepted('user-1', 'jane');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.FRIEND_ACCEPTED,
          data: { friendUsername: 'jane' },
        })
      );
    });

    it('should create budget warning notification with percentage', async () => {
      await service.notifyBudgetWarning('user-1', 'Food', 80);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.BUDGET_WARNING,
          data: { perimeterName: 'Food', percentage: 80 },
        })
      );
    });
  });
});
