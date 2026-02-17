import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'USD', length: 3 })
  currency: string;

  @Column({ default: 'en', length: 5 })
  language: string;

  @Column({ name: 'theme_mode', default: 'dark' })
  themeMode: 'light' | 'dark';

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'two_fa_enabled', default: false })
  twoFaEnabled: boolean;

  @Column({ name: 'two_fa_secret', nullable: true })
  @Exclude()
  twoFaSecret: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }
}
