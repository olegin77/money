import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Perimeter } from './perimeter.entity';

@Entity('perimeter_shares')
@Unique(['perimeterId', 'sharedWithId'])
export class PerimeterShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'perimeter_id' })
  perimeterId: string;

  @ManyToOne(() => Perimeter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'perimeter_id' })
  perimeter: Perimeter;

  @Column({ name: 'shared_with_id' })
  sharedWithId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_with_id' })
  sharedWith: User;

  @Column({
    type: 'enum',
    enum: ['viewer', 'contributor', 'manager'],
    default: 'viewer',
  })
  role: 'viewer' | 'contributor' | 'manager';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
