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
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { IncomeService } from '../services/income.service';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { QueryIncomeDto } from '../dto/query-income.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/decorators/current-user.decorator';

@ApiTags('Income')
@ApiErrorResponses()
@Controller('income')
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createIncomeDto: CreateIncomeDto,
    @Headers('x-client-timestamp') clientTs?: string
  ) {
    const clientTimestamp = clientTs ? Number(clientTs) : undefined;
    const result = await this.incomeService.create(user.id, createIncomeDto, clientTimestamp);

    return {
      success: true,
      message: result.conflict
        ? 'Server version is newer (conflict resolved)'
        : 'Income created successfully',
      data: result.data,
      conflict: result.conflict,
    };
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserData, @Query() query: QueryIncomeDto) {
    const result = await this.incomeService.findAll(user.id, query);

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
    const stats = await this.incomeService.getStats(user.id, startDate, endDate);

    return {
      success: true,
      data: stats,
    };
  }

  @Get('trend')
  async getTrend(@CurrentUser() user: CurrentUserData, @Query('days') days?: number) {
    const trend = await this.incomeService.getTrend(user.id, days ? Number(days) : 30);

    return {
      success: true,
      data: trend,
    };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const income = await this.incomeService.findOne(id, user.id);

    return {
      success: true,
      data: income,
    };
  }

  @Patch(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
    @Headers('x-client-timestamp') clientTs?: string
  ) {
    const clientTimestamp = clientTs ? Number(clientTs) : undefined;
    const result = await this.incomeService.update(id, user.id, updateIncomeDto, clientTimestamp);

    return {
      success: true,
      message: result.conflict
        ? 'Server version is newer (conflict resolved)'
        : 'Income updated successfully',
      data: result.data,
      conflict: result.conflict,
    };
  }

  @Delete(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    await this.incomeService.remove(id, user.id);

    return {
      success: true,
      message: 'Income deleted successfully',
    };
  }
}
