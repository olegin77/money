import { IsUUID, IsIn } from 'class-validator';

export class SharePerimeterDto {
  @IsUUID()
  userId: string;

  @IsIn(['viewer', 'contributor', 'manager'])
  role: 'viewer' | 'contributor' | 'manager';
}
