import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Public()
  @Get()
  list() {
    return this.categories.list();
  }

  @Roles('admin')
  @Post()
  create(@Body() body: { name: string; icon?: string; sortOrder?: number }) {
    return this.categories.create(body);
  }
}
