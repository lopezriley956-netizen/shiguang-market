import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @Type(() => Number)
  @IsInt()
  productId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  addressId?: number;
}
