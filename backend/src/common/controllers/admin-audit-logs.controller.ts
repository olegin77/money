import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '../decorators/api-error-responses.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';

@ApiTags('Admin')
@ApiErrorResponses()
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAuditLogsController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('userId') userId?: string,
    @Query('method') method?: string,
    @Query('entity') entity?: string
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);

    const qb = this.auditLogRepository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    if (userId) {
      qb.andWhere('log.userId = :userId', { userId });
    }
    if (method) {
      qb.andWhere('log.method = :method', { method });
    }
    if (entity) {
      qb.andWhere('log.entity = :entity', { entity });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      success: true,
      data: {
        items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    };
  }
}
