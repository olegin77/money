import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ExpensesService } from '../services/expenses.service';
import { ReceiptService } from '../services/receipt.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { BatchCreateExpenseDto } from '../dto/batch-create-expense.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiErrorResponses()
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly receiptService: ReceiptService
  ) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createExpenseDto: CreateExpenseDto,
    @Headers('x-client-timestamp') clientTs?: string
  ) {
    const clientTimestamp = clientTs ? Number(clientTs) : undefined;
    const result = await this.expensesService.create(user.id, createExpenseDto, clientTimestamp);

    return {
      success: true,
      message: result.conflict
        ? 'Server version is newer (conflict resolved)'
        : 'Expense created successfully',
      data: result.data,
      conflict: result.conflict,
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
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Headers('x-client-timestamp') clientTs?: string
  ) {
    const clientTimestamp = clientTs ? Number(clientTs) : undefined;
    const result = await this.expensesService.update(
      id,
      user.id,
      updateExpenseDto,
      clientTimestamp
    );

    return {
      success: true,
      message: result.conflict
        ? 'Server version is newer (conflict resolved)'
        : 'Expense updated successfully',
      data: result.data,
      conflict: result.conflict,
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

  @Post(':id/receipt')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('receipt', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @HttpCode(HttpStatus.OK)
  async uploadReceipt(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    // Verify expense belongs to user
    const expense = await this.expensesService.findOne(id, user.id);

    const receiptUrl = await this.receiptService.saveReceipt(file, user.id, expense.id);

    // Delete old receipt if replacing
    if (expense.receiptUrl) {
      this.receiptService.deleteReceipt(expense.receiptUrl);
    }

    await this.expensesService.updateReceiptUrl(id, user.id, receiptUrl);

    return {
      success: true,
      message: 'Receipt uploaded successfully',
      data: { receiptUrl },
    };
  }

  @Get(':id/receipt')
  async getReceipt(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const expense = await this.expensesService.findOne(id, user.id);

    if (!expense.receiptUrl) {
      return res.status(404).json({
        success: false,
        message: 'No receipt attached to this expense',
      });
    }

    const absPath = this.receiptService.getReceiptAbsolutePath(expense.receiptUrl);

    return res.sendFile(absPath);
  }
}
