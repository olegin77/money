import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('currency_rates')
@Unique(['baseCurrency', 'targetCurrency', 'date'])
@Index(['baseCurrency', 'date'])
export class CurrencyRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'base_currency', length: 3 })
  baseCurrency: string;

  @Column({ name: 'target_currency', length: 3 })
  targetCurrency: string;

  @Column('decimal', { precision: 14, scale: 6 })
  rate: number;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
