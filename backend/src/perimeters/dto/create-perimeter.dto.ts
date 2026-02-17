import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreatePerimeterDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @IsString()
  @IsOptional()
  @MaxLength(7)
  color?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsString()
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  budgetPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
