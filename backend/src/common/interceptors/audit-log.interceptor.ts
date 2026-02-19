import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!WRITE_METHODS.has(method)) {
      return next.handle();
    }

    const userId = request.user?.id || request.user?.sub || null;
    const path = request.url;
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers?.['user-agent'] || null;

    // Extract entity name from path (e.g., /api/v1/expenses -> expenses)
    const pathParts = path.split('/').filter(Boolean);
    const entity =
      pathParts.find(
        (p: string) =>
          !['api', 'v1'].includes(p) && !p.match(/^[0-9a-f-]{36}$/i),
      ) || 'unknown';

    // Extract entity ID from path params
    const entityId = request.params?.id || null;

    return next.handle().pipe(
      tap({
        next: () => {
          const httpResponse = context.switchToHttp().getResponse();
          const statusCode = httpResponse.statusCode;

          this.saveLog({
            userId,
            method,
            path,
            entity,
            entityId,
            statusCode,
            ipAddress,
            userAgent,
            changes: method === 'DELETE' ? null : (request.body || null),
          }).catch((err) =>
            this.logger.warn(`Failed to save audit log: ${err.message}`),
          );
        },
        error: () => {
          this.saveLog({
            userId,
            method,
            path,
            entity,
            entityId,
            statusCode: 500,
            ipAddress,
            userAgent,
            changes: null,
          }).catch((err) =>
            this.logger.warn(`Failed to save audit log: ${err.message}`),
          );
        },
      }),
    );
  }

  private async saveLog(data: Partial<AuditLog>): Promise<void> {
    const log = this.auditLogRepository.create(data);
    await this.auditLogRepository.save(log);
  }
}
