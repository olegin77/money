import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from '../entities/income.entity';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>
  ) {}

  // TODO: Implement income logic
}
