import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../entities/favorite.entity';
import { Footprint } from '../../entities/footprint.entity';
import { Product } from '../../entities/product.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Favorite) private readonly favorites: Repository<Favorite>,
    @InjectRepository(Footprint) private readonly footprints: Repository<Footprint>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  private async ensureProduct(productId: number) {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('商品不存在');
    return product;
  }

  private listProducts(ids: number[]) {
    if (!ids.length) return Promise.resolve([]);
    return this.products
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.seller', 'seller')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .whereInIds(ids)
      .getMany();
  }

  async listFavorites(userId: number) {
    const rows = await this.favorites.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return this.listProducts(rows.map((row) => row.productId));
  }

  async addFavorite(userId: number, productId: number) {
    await this.ensureProduct(productId);
    const exists = await this.favorites.findOne({ where: { userId, productId } });
    if (!exists) await this.favorites.save(this.favorites.create({ userId, productId }));
    return { favorited: true };
  }

  async removeFavorite(userId: number, productId: number) {
    await this.favorites.delete({ userId, productId });
    return { favorited: false };
  }

  async listFootprints(userId: number) {
    const rows = await this.footprints.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return this.listProducts(rows.map((row) => row.productId));
  }

  async addFootprint(userId: number, productId: number) {
    await this.ensureProduct(productId);
    const existing = await this.footprints.findOne({ where: { userId, productId } });
    if (existing) {
      existing.createdAt = new Date();
      await this.footprints.save(existing);
    } else {
      await this.footprints.save(this.footprints.create({ userId, productId }));
    }
    return { recorded: true };
  }
}
