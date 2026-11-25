import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(2, 100)
  title: string;

  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  dealType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  originPrice?: number;

  @IsOptional()
  @IsBoolean()
  bargain?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(9, { message: '最多上传 9 张图片' })
  images?: string[];

  @IsOptional()
  @IsIn(['draft', 'pending'])
  status?: 'draft' | 'pending';
}
