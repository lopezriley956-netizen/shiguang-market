import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  list(
    @Query('categoryId') categoryId?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: any,
  ) {
    return this.products.list({
      categoryId: categoryId ? Number(categoryId) : undefined,
      keyword,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sort,
    });
  }

  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.products.mine(user.id);
  }

  @Public()
  @Get(':id')
  detail(@Param('id') id: string) {
    return this.products.detail(Number(id));
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.products.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.products.update(user.id, Number(id), dto);
  }

  @Post(':id/submit')
  submit(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.products.submit(user.id, Number(id));
  }

  @Delete(':id')
  offline(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.products.offline(user.id, Number(id));
  }
}
