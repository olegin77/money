import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../gateways/events.gateway';

export interface Notification {
  id: string;
  userId: string;
  type: 'expense' | 'income' | 'friend_request' | 'perimeter_shared' | 'budget_alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  constructor(private eventsGateway: EventsGateway) {}

  async notifyExpenseCreated(userId: string, expense: any) {
    this.eventsGateway.emitToUser(userId, 'expense:created', expense);
  }

  async notifyExpenseUpdated(userId: string, expense: any) {
    this.eventsGateway.emitToUser(userId, 'expense:updated', expense);
  }

  async notifyExpenseDeleted(userId: string, expenseId: string) {
    this.eventsGateway.emitToUser(userId, 'expense:deleted', { id: expenseId });
  }

  async notifyIncomeCreated(userId: string, income: any) {
    this.eventsGateway.emitToUser(userId, 'income:created', income);
  }

  async notifyFriendRequest(userId: string, request: any) {
    this.eventsGateway.emitToUser(userId, 'friend:request', request);
  }

  async notifyFriendAccepted(userId: string, friendship: any) {
    this.eventsGateway.emitToUser(userId, 'friend:accepted', friendship);
  }

  async notifyPerimeterShared(userId: string, perimeter: any) {
    this.eventsGateway.emitToUser(userId, 'perimeter:shared', perimeter);
  }

  async notifyBudgetAlert(userId: string, perimeter: any, percentage: number) {
    this.eventsGateway.emitToUser(userId, 'budget:alert', {
      perimeter,
      percentage,
      message: `Budget at ${percentage.toFixed(1)}% for ${perimeter.name}`,
    });
  }

  async sendNotification(userId: string, notification: Partial<Notification>) {
    this.eventsGateway.emitToUser(userId, 'notification', notification);
  }
}
