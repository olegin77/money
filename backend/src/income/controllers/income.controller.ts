import { Controller, Get, Post } from '@nestjs/common';
import { IncomeService } from '../services/income.service';

@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll() {
    return { message: 'Get all income - TODO' };
  }

  @Post()
  create() {
    return { message: 'Create income - TODO' };
  }
}
