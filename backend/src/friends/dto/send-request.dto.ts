import { IsUUID, IsEmail, IsOptional } from 'class-validator';

export class SendFriendRequestDto {
  @IsUUID()
  @IsOptional()
  addresseeId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
