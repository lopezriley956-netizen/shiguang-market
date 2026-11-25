import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'password_hash', length: 100, select: false })
  passwordHash: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: '' })
  signature: string;

  @Column({ default: '' })
  school: string;

  @Column({ name: 'credit_score', default: 600 })
  creditScore: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  balance: number;

  @Column({
    name: 'escrow_balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  escrowBalance: number;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status: 'active' | 'disabled';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
