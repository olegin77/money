import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['entity', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ length: 10 })
  method: string;

  @Column()
  path: string;

  @Column({ length: 50 })
  entity: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'status_code', type: 'int' })
  statusCode: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
