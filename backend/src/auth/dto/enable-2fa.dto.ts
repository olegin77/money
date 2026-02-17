import { IsString, Length } from 'class-validator';

export class Enable2FADto {
  @IsString()
  @Length(6, 6, { message: 'Code must be 6 digits' })
  code: string;
}
