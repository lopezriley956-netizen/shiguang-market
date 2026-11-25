import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_records')
export class AuditRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'reviewer_id' })
  reviewerId: number;

  @Column({ type: 'enum', enum: ['approve', 'reject'] })
  action: 'approve' | 'reject';

  @Column({ default: '' })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
