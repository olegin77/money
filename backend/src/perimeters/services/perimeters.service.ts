import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perimeter } from '../entities/perimeter.entity';

@Injectable()
export class PerimetersService {
  constructor(
    @InjectRepository(Perimeter)
    private readonly perimeterRepository: Repository<Perimeter>
  ) {}

  // TODO: Implement perimeter logic
}
