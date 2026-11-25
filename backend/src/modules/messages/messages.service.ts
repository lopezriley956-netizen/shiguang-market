import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { Product } from '../../entities/product.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation) private readonly conversations: Repository<Conversation>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  listConversations(userId: number) {
    return this.conversations.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      order: { lastAt: 'DESC' },
    });
  }

  async getMessages(conversationId: number, userId: number) {
    const conversation = await this.conversations.findOne({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('会话不存在');
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new BadRequestException('无权查看该会话');
    }
    return this.messages.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async send(userId: number, productId: number, dto: SendMessageDto) {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('商品不存在');
    if (product.sellerId === userId) throw new BadRequestException('不能给自己发消息');

    let conversation = await this.conversations.findOne({
      where: { productId, buyerId: userId, sellerId: product.sellerId },
    });
    if (!conversation) {
      conversation = await this.conversations.save(
        this.conversations.create({
          productId,
          buyerId: userId,
          sellerId: product.sellerId,
        }),
      );
    }

    const message = await this.messages.save(
      this.messages.create({
        conversationId: conversation.id,
        senderId: userId,
        type: dto.type || 'text',
        content: dto.content,
      }),
    );

    conversation.lastMessage = dto.content;
    conversation.lastAt = new Date();
    await this.conversations.save(conversation);

    if (dto.type === 'want') {
      await this.products.increment({ id: productId }, 'wantCount', 1);
    }
    return message;
  }

  async markRead(messageId: number, userId: number) {
    const message = await this.messages.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('消息不存在');
    const conversation = await this.conversations.findOne({ where: { id: message.conversationId } });
    if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
      throw new BadRequestException('无权操作该消息');
    }
    message.isRead = true;
    await this.messages.save(message);
    return message;
  }
}
