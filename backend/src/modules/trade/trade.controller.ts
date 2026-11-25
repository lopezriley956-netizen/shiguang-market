import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { TradeService } from './trade.service';

@Controller('orders')
export class TradeController {
  constructor(private readonly trade: TradeService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.trade.create(user.id, dto);
  }

  @Get('mine')
  bought(@CurrentUser() user: AuthUser) {
    return this.trade.bought(user.id);
  }

  @Get('sold')
  sold(@CurrentUser() user: AuthUser) {
    return this.trade.sold(user.id);
  }

  @Get(':id')
  detail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.trade.detail(Number(id), user.id);
  }

  @Post(':id/pay')
  pay(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body?: { idempotencyKey?: string },
  ) {
    return this.trade.pay(Number(id), user.id, body?.idempotencyKey);
  }

  @Post(':id/confirm')
  confirm(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.trade.confirm(Number(id), user.id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.trade.cancel(Number(id), user.id);
  }
}
