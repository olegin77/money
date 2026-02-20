import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { BatchCreateExpenseDto } from '../dto/batch-create-expense.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/decorators/current-user.decorator';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: CurrentUserData, @Body() createExpenseDto: CreateExpenseDto) {
    const expense = await this.expensesService.create(user.id, createExpenseDto);

    return {
      success: true,
      message: 'Expense created successfully',
      data: expense,
    };
  }

  @Post('batch')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async createBatch(
    @CurrentUser() user: CurrentUserData,
    @Body() batchCreateExpenseDto: BatchCreateExpenseDto
  ) {
    const expenses = await this.expensesService.createBatch(
      user.id,
      batchCreateExpenseDto.expenses
    );

    return {
      success: true,
      message: `${expenses.length} expenses created successfully`,
      data: expenses,
    };
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserData, @Query() query: QueryExpenseDto) {
    const result = await this.expensesService.findAll(user.id, query);

    return {
      success: true,
      data: result,
    };
  }

  @Get('stats')
  async getStats(
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const stats = await this.expensesService.getStats(user.id, startDate, endDate);

    return {
      success: true,
      data: stats,
    };
  }

  @Get('trend')
  async getTrend(@CurrentUser() user: CurrentUserData, @Query('days') days?: number) {
    const trend = await this.expensesService.getTrend(user.id, days ? Number(days) : 30);

    return {
      success: true,
      data: trend,
    };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const expense = await this.expensesService.findOne(id, user.id);

    return {
      success: true,
      data: expense,
    };
  }

  @Patch(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto
  ) {
    const expense = await this.expensesService.update(id, user.id, updateExpenseDto);

    return {
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    };
  }

  @Delete(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    await this.expensesService.remove(id, user.id);

    return {
      success: true,
      message: 'Expense deleted successfully',
    };
  }
}
