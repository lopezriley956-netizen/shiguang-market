import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('footprints')
export class Footprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
