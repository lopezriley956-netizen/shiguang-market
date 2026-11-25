import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  signature?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  school?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
