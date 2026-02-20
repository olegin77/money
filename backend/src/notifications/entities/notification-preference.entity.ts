import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: true })
  budgetAlerts: boolean;

  @Column({ default: true })
  recurringReminders: boolean;

  @Column({ default: true })
  friendRequests: boolean;

  @Column({ default: true })
  perimeterShares: boolean;

  @Column({ type: 'simple-array', default: 'in-app' })
  preferredChannels: string[];

  @Column({ nullable: true })
  quietHoursStart: string;

  @Column({ nullable: true })
  quietHoursEnd: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
