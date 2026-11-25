import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { User } from '../../entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';

export interface ListProductsQuery {
  categoryId?: number;
  keyword?: string;
  status?: Product['status'];
  page?: number;
  pageSize?: number;
  sort?: 'new' | 'priceAsc' | 'priceDesc';
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductImage) private readonly images: Repository<ProductImage>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  private withRelations(qb: SelectQueryBuilder<Product>) {
    return qb
      .leftJoinAndSelect('p.seller', 'seller')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images');
  }

  async list(query: ListProductsQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 12));
    const qb = this.withRelations(
      this.products.createQueryBuilder('p'),
    ).where('p.status = :status', { status: query.status || 'approved' });

    if (query.categoryId) {
      qb.andWhere('p.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.keyword) {
      qb.andWhere('(p.title LIKE :kw OR p.description LIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }

    if (query.sort === 'priceAsc') qb.orderBy('p.price', 'ASC');
    else if (query.sort === 'priceDesc') qb.orderBy('p.price', 'DESC');
    else qb.orderBy('p.createdAt', 'DESC');

    qb.skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async detail(id: number) {
    await this.products.increment({ id }, 'viewCount', 1);
    const product = await this.withRelations(
      this.products.createQueryBuilder('p'),
    )
      .where('p.id = :id', { id })
      .getOne();
    if (!product) throw new NotFoundException('商品不存在');
    return product;
  }

  async mine(userId: number) {
    return this.withRelations(this.products.createQueryBuilder('p'))
      .where('p.sellerId = :userId', { userId })
      .orderBy('p.createdAt', 'DESC')
      .getMany();
  }

  async create(userId: number, dto: CreateProductDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || user.creditScore < 600) {
      throw new ForbiddenException('信用分低于 600，暂不能发布商品');
    }

    const { images = [], ...rest } = dto;
    return this.dataSource.transaction(async (manager) => {
      const product = manager.getRepository(Product).create({
        ...rest,
        sellerId: userId,
        status: dto.status || 'pending',
        images: images.map((url, sortOrder) =>
          manager.getRepository(ProductImage).create({ url, sortOrder }),
        ),
      });
      return manager.getRepository(Product).save(product);
    });
  }

  async update(userId: number, id: number, dto: CreateProductDto) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('商品不存在');
    if (product.sellerId !== userId) throw new ForbiddenException('只能修改自己的商品');

    const { images, ...rest } = dto;
    Object.assign(product, rest);

    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Product).save(product);
      if (images) {
        await manager.getRepository(ProductImage).delete({ productId: id });
        await manager.getRepository(ProductImage).save(
          images.map((url, sortOrder) =>
            manager.getRepository(ProductImage).create({ productId: id, url, sortOrder }),
          ),
        );
      }
      return this.detail(id);
    });
  }

  async submit(userId: number, id: number) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('商品不存在');
    if (product.sellerId !== userId) throw new ForbiddenException('只能提交自己的商品');
    product.status = 'pending';
    await this.products.save(product);
    return product;
  }

  async offline(userId: number, id: number) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('商品不存在');
    if (product.sellerId !== userId) throw new ForbiddenException('只能下架自己的商品');
    product.status = 'offline';
    await this.products.save(product);
    return product;
  }
}
