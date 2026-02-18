import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from './gateways/events.gateway';
import { NotificationService } from './services/notification.service';
import { CacheService } from './services/cache.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  providers: [EventsGateway, NotificationService, CacheService],
  exports: [EventsGateway, NotificationService, CacheService],
})
export class CommonModule {}
