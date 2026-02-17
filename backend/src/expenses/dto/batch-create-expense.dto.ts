import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExpenseDto } from './create-expense.dto';

export class BatchCreateExpenseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseDto)
  expenses: CreateExpenseDto[];
}
