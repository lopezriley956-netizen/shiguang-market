import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsIn(['want', 'bargain', 'system', 'text'])
  type?: 'want' | 'bargain' | 'system' | 'text';

  @IsString()
  @Length(1, 500)
  content: string;
}
