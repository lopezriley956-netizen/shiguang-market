import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('credit_logs')
export class CreditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  delta: number;

  @Column({ length: 100 })
  reason: string;

  @Column({ name: 'related_order_id', nullable: true })
  relatedOrderId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
