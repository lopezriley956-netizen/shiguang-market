import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreditLog } from '../../entities/credit-log.entity';
import { Escrow } from '../../entities/escrow.entity';
import { Order } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Escrow) private readonly escrows: Repository<Escrow>,
    private readonly dataSource: DataSource,
  ) {}

  async create(buyerId: number, dto: CreateOrderDto) {
    const product = await this.products.findOne({ where: { id: dto.productId } });
    if (!product || product.status !== 'approved') {
      throw new BadRequestException('商品不可购买');
    }
    if (product.sellerId === buyerId) {
      throw new BadRequestException('不能购买自己发布的商品');
    }

    const order = this.orders.create({
      orderNo: `SG${Date.now()}${Math.floor(Math.random() * 1000)}`,
      productId: product.id,
      buyerId,
      sellerId: product.sellerId,
      amount: product.price,
      addressId: dto.addressId || null,
      status: 'created',
    });
    return this.orders.save(order);
  }

  async pay(orderId: number, buyerId: number, idempotencyKey?: string) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const order = await orderRepo
        .createQueryBuilder('o')
        .setLock('pessimistic_write')
        .where('o.id = :id', { id: orderId })
        .getOne();
      if (!order) throw new NotFoundException('订单不存在');
      if (order.buyerId !== buyerId) throw new BadRequestException('不是你的订单');

      const existing = await manager.getRepository(Escrow).findOne({ where: { orderId } });
      if (existing) return order;

      if (!['created', 'paid'].includes(order.status)) {
        throw new BadRequestException('订单状态不允许支付');
      }

      const userRepo = manager.getRepository(User);
      const buyer = await userRepo
        .createQueryBuilder('u')
        .setLock('pessimistic_write')
        .where('u.id = :id', { id: buyerId })
        .getOne();
      if (buyer.balance < order.amount) {
        throw new BadRequestException('余额不足，请先充值');
      }

      buyer.balance = Number((buyer.balance - order.amount).toFixed(2));
      buyer.escrowBalance = Number((buyer.escrowBalance + order.amount).toFixed(2));
      await userRepo.save(buyer);

      await manager.getRepository(Escrow).save(
        manager.getRepository(Escrow).create({
          orderId,
          amount: order.amount,
          status: 'frozen',
          idempotencyKey: idempotencyKey || `pay-${orderId}`,
        }),
      );
      await this.writeWallet(
        manager,
        buyerId,
        'escrow_freeze',
        order.amount,
        buyer.balance,
        `订单 ${order.orderNo} 担保金冻结`,
      );

      order.status = 'escrow';
      order.paidAt = new Date();
      await orderRepo.save(order);
      return order;
    });
  }

  async confirm(orderId: number, buyerId: number) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const order = await orderRepo
        .createQueryBuilder('o')
        .setLock('pessimistic_write')
        .where('o.id = :id', { id: orderId })
        .getOne();
      if (!order) throw new NotFoundException('订单不存在');
      if (order.buyerId !== buyerId) throw new BadRequestException('不是你的订单');
      if (!['escrow', 'shipped'].includes(order.status)) {
        throw new BadRequestException('订单状态不允许确认');
      }

      const escrowRepo = manager.getRepository(Escrow);
      const escrow = await escrowRepo.findOne({ where: { orderId, status: 'frozen' } });
      if (!escrow) throw new BadRequestException('担保金记录不存在');

      const userRepo = manager.getRepository(User);
      const seller = await userRepo
        .createQueryBuilder('u')
        .setLock('pessimistic_write')
        .where('u.id = :id', { id: order.sellerId })
        .getOne();
      seller.balance = Number((seller.balance + order.amount).toFixed(2));
      seller.escrowBalance = Number((seller.escrowBalance - order.amount).toFixed(2));
      await userRepo.save(seller);
      await this.writeWallet(
        manager,
        seller.id,
        'sale',
        order.amount,
        seller.balance,
        `订单 ${order.orderNo} 担保金释放`,
      );

      escrow.status = 'released';
      await escrowRepo.save(escrow);

      order.status = 'completed';
      order.completedAt = new Date();
      await orderRepo.save(order);

      await manager.getRepository(Product).update(
        { id: order.productId },
        { status: 'sold' },
      );

      const creditRepo = manager.getRepository(CreditLog);
      await creditRepo.save([
        creditRepo.create({ userId: order.buyerId, delta: 5, reason: '交易完成', relatedOrderId: order.id }),
        creditRepo.create({ userId: order.sellerId, delta: 5, reason: '交易完成', relatedOrderId: order.id }),
      ]);
      await userRepo.increment({ id: order.buyerId }, 'creditScore', 5);
      await userRepo.increment({ id: order.sellerId }, 'creditScore', 5);

      return order;
    });
  }

  async cancel(orderId: number, buyerId: number) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const order = await orderRepo
        .createQueryBuilder('o')
        .setLock('pessimistic_write')
        .where('o.id = :id', { id: orderId })
        .getOne();
      if (!order) throw new NotFoundException('订单不存在');
      if (order.buyerId !== buyerId) throw new BadRequestException('不是你的订单');
      if (!['created', 'escrow'].includes(order.status)) {
        throw new BadRequestException('当前状态不可取消');
      }

      if (order.status === 'escrow') {
        const escrow = await manager.getRepository(Escrow).findOne({ where: { orderId } });
        const userRepo = manager.getRepository(User);
        const buyer = await userRepo
          .createQueryBuilder('u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: buyerId })
          .getOne();
        buyer.balance = Number((buyer.balance + order.amount).toFixed(2));
        buyer.escrowBalance = Number((buyer.escrowBalance - order.amount).toFixed(2));
        await userRepo.save(buyer);
        await this.writeWallet(
          manager,
          buyerId,
          'refund',
          order.amount,
          buyer.balance,
          `订单 ${order.orderNo} 退款`,
        );
        if (escrow) {
          escrow.status = 'refunded';
          await manager.getRepository(Escrow).save(escrow);
        }
      }

      order.status = 'cancelled';
      await orderRepo.save(order);
      await manager.getRepository(Product).update(
        { id: order.productId },
        { status: 'approved' },
      );
      return order;
    });
  }

  async bought(userId: number) {
    return this.orders.find({
      where: { buyerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async sold(userId: number) {
    return this.orders.find({
      where: { sellerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async detail(id: number, userId: number) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new BadRequestException('无权查看该订单');
    }
    return order;
  }

  private writeWallet(
    manager: any,
    userId: number,
    type: WalletTransaction['type'],
    amount: number,
    balanceAfter: number,
    remark: string,
  ) {
    const repo = manager.getRepository(WalletTransaction);
    return repo.save(repo.create({ userId, type, amount, balanceAfter, remark }));
  }
}
