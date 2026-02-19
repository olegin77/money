import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from './gateways/events.gateway';
import { NotificationService } from './services/notification.service';
import { CacheService } from './services/cache.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { AuditLog } from './entities/audit-log.entity';
import { GlobalExceptionFilter } from './filters/http-exception.filter';
import { AdminAuditLogsController } from './controllers/admin-audit-logs.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [AdminAuditLogsController],
  providers: [
    EventsGateway,
    NotificationService,
    CacheService,
    AuditLogInterceptor,
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
  exports: [EventsGateway, NotificationService, CacheService],
})
export class CommonModule {}
