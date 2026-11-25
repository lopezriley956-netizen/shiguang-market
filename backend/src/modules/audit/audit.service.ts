import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditRecord } from '../../entities/audit-record.entity';
import { Product } from '../../entities/product.entity';
import { ReviewProductDto } from './dto/review-product.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(AuditRecord) private readonly audits: Repository<AuditRecord>,
  ) {}

  async list(status = 'pending') {
    return this.products
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.seller', 'seller')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .where('p.status = :status', { status })
      .orderBy('p.createdAt', 'DESC')
      .getMany();
  }

  async review(id: number, reviewerId: number, dto: ReviewProductDto) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('商品不存在');

    product.status = dto.action === 'approve' ? 'approved' : 'rejected';
    await this.products.save(product);
    await this.audits.save(
      this.audits.create({
        productId: id,
        reviewerId,
        action: dto.action,
        reason: dto.reason || '',
      }),
    );
    return product;
  }
}
