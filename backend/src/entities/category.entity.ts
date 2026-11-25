import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 20, default: '' })
  icon: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status: 'active' | 'disabled';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
