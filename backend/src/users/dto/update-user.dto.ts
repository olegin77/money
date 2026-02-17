import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  language?: string;

  @IsString()
  @IsOptional()
  @IsIn(['light', 'dark'])
  themeMode?: 'light' | 'dark';
}
