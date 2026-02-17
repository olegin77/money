import { IsOptional, IsDateString, IsIn } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['week', 'month', 'year', 'all'])
  period?: 'week' | 'month' | 'year' | 'all';
}
