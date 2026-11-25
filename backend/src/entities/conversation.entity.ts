import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'buyer_id' })
  buyerId: number;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @Column({ name: 'last_message', default: '' })
  lastMessage: string;

  @Column({ name: 'last_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
