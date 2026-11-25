import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: [
      'recharge',
      'withdraw',
      'purchase',
      'sale',
      'escrow_freeze',
      'escrow_release',
      'refund',
    ],
  })
  type:
    | 'recharge'
    | 'withdraw'
    | 'purchase'
    | 'sale'
    | 'escrow_freeze'
    | 'escrow_release'
    | 'refund';

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  balanceAfter: number;

  @Column({ default: '' })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
