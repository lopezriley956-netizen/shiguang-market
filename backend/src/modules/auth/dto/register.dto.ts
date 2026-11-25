import { IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(6, 20)
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @Length(1, 50)
  nickname: string;
}
