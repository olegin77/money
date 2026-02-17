import { Controller, Get, Post } from '@nestjs/common';
import { PerimetersService } from '../services/perimeters.service';

@Controller('perimeters')
export class PerimetersController {
  constructor(private readonly perimetersService: PerimetersService) {}

  @Get()
  findAll() {
    return { message: 'Get all perimeters - TODO' };
  }

  @Post()
  create() {
    return { message: 'Create perimeter - TODO' };
  }
}
