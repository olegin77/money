import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string; status: string } {
    return {
      message: 'FinTrack Pro API',
      version: '0.1.0',
      status: 'online',
    };
  }

  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
