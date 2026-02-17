import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerimetersController } from './controllers/perimeters.controller';
import { PerimetersService } from './services/perimeters.service';
import { Perimeter } from './entities/perimeter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perimeter])],
  controllers: [PerimetersController],
  providers: [PerimetersService],
  exports: [PerimetersService],
})
export class PerimetersModule {}
