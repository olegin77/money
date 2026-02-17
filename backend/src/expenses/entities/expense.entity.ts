import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_rule', nullable: true })
  recurrenceRule: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[];

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
