import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller()
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get('conversations')
  conversations(@CurrentUser() user: AuthUser) {
    return this.messages.listConversations(user.id);
  }

  @Get('conversations/:id/messages')
  history(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.messages.getMessages(Number(id), user.id);
  }

  @Post('conversations/:productId/messages')
  send(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.send(user.id, Number(productId), dto);
  }

  @Patch('messages/:id/read')
  read(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.messages.markRead(Number(id), user.id);
  }
}
