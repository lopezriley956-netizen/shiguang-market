import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_no', length: 32 })
  orderNo: string;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'buyer_id' })
  buyerId: number;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({
    type: 'enum',
    enum: [
      'created',
      'paid',
      'escrow',
      'shipped',
      'completed',
      'cancelled',
      'refunding',
      'refunded',
    ],
    default: 'created',
  })
  status:
    | 'created'
    | 'paid'
    | 'escrow'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'refunding'
    | 'refunded';

  @Column({ name: 'address_id', nullable: true })
  addressId: number;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
