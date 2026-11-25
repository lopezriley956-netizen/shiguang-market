import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../common/transformers/decimal.transformer';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';
import { User } from './user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, default: '几乎全新' })
  condition: string;

  @Column({ name: 'deal_type', length: 20, default: '面交优先' })
  dealType: string;

  @Column({ default: '' })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  price: number;

  @Column({
    name: 'origin_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  originPrice: number;

  @Column({ default: true })
  bargain: boolean;

  @Column({
    type: 'enum',
    enum: ['draft', 'pending', 'approved', 'rejected', 'offline', 'sold'],
    default: 'draft',
  })
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'offline' | 'sold';

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'want_count', default: 0 })
  wantCount: number;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
