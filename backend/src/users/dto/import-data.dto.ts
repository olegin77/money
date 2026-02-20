import {
  IsArray,
  IsOptional,
  ValidateNested,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImportExpenseItem {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  category?: string;
}

class ImportIncomeItem {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class ImportDataDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportExpenseItem)
  expenses?: ImportExpenseItem[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportIncomeItem)
  incomes?: ImportIncomeItem[];
}
