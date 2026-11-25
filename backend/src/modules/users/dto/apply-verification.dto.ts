import { IsString, Length } from 'class-validator';

export class ApplyVerificationDto {
  @IsString()
  @Length(2, 100)
  school: string;

  @IsString()
  @Length(2, 50)
  realName: string;

  @IsString()
  @Length(4, 64)
  studentNo: string;
}
