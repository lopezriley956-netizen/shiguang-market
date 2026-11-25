import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly categories: Repository<Category>) {}

  list() {
    return this.categories.find({
      where: { status: 'active' },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  create(data: Partial<Category>) {
    return this.categories.save(this.categories.create(data));
  }
}
