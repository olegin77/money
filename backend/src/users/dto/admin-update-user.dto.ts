import { IsBoolean, IsOptional } from 'class-validator';

export class AdminUpdateUserDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;
}
