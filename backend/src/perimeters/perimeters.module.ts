import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerimetersController } from './controllers/perimeters.controller';
import { PerimetersService } from './services/perimeters.service';
import { Perimeter } from './entities/perimeter.entity';
import { PerimeterShare } from './entities/perimeter-share.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perimeter, PerimeterShare, Expense])],
  controllers: [PerimetersController],
  providers: [PerimetersService],
  exports: [PerimetersService],
})
export class PerimetersModule {}
