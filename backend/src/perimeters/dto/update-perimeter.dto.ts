import { PartialType } from '@nestjs/mapped-types';
import { CreatePerimeterDto } from './create-perimeter.dto';

export class UpdatePerimeterDto extends PartialType(CreatePerimeterDto) {}
