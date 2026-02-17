import { Controller, Get, Post, Body } from '@nestjs/common';
import { ExpensesService } from '../services/expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll() {
    return { message: 'Get all expenses - TODO' };
  }

  @Post()
  create(@Body() body: any) {
    return { message: 'Create expense - TODO' };
  }
}
