import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRATION') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
