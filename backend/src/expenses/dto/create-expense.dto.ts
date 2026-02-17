import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsBoolean,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateExpenseDto {
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

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
