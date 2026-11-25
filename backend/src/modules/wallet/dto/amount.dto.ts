import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class AmountDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}
