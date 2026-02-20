import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Income } from '../income/entities/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Expense, Income])],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
