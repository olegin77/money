import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeController } from './controllers/income.controller';
import { IncomeService } from './services/income.service';
import { Income } from './entities/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Income])],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
