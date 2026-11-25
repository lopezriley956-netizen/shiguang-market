import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditLog } from '../../entities/credit-log.entity';
import { Escrow } from '../../entities/escrow.entity';
import { Order } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Product,
      Escrow,
      User,
      CreditLog,
      WalletTransaction,
    ]),
  ],
  controllers: [TradeController],
  providers: [TradeService],
  exports: [TradeService],
})
export class TradeModule {}
