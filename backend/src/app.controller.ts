import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from './common/decorators/api-error-responses.decorator';
import { AppService } from './app.service';

@ApiTags('Health')
@ApiErrorResponses()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { message: string; version: string; status: string } {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return this.appService.healthCheck();
  }
}
