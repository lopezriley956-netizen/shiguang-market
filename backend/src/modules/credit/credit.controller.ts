import { Controller, Get } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreditService } from './credit.service';

@Controller('credit')
export class CreditController {
  constructor(private readonly credit: CreditService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.credit.summary(user.id);
  }

  @Get('logs')
  logs(@CurrentUser() user: AuthUser) {
    return this.credit.logs(user.id);
  }
}
