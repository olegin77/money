import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateIncomeDto {
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  source?: string;

  @IsDateString()
  date: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;

  /** Client-side timestamp (epoch ms) for offline sync LWW conflict resolution */
  @IsNumber()
  @IsOptional()
  clientTimestamp?: number;
}
