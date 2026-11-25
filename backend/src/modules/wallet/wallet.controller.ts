import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { AmountDto } from './dto/amount.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.wallet.get(user.id);
  }

  @Post('recharge')
  recharge(@CurrentUser() user: AuthUser, @Body() dto: AmountDto) {
    return this.wallet.recharge(user.id, dto);
  }

  @Post('withdraw')
  withdraw(@CurrentUser() user: AuthUser, @Body() dto: AmountDto) {
    return this.wallet.withdraw(user.id, dto);
  }
}
