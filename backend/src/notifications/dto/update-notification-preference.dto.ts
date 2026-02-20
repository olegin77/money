import {
  IsBoolean,
  IsOptional,
  IsArray,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  budgetAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  recurringReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  friendRequests?: boolean;

  @IsOptional()
  @IsBoolean()
  perimeterShares?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredChannels?: string[];

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Must be HH:mm format' })
  quietHoursStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Must be HH:mm format' })
  quietHoursEnd?: string;
}
