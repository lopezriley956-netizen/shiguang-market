import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { ReviewProductDto } from './dto/review-product.dto';

@Roles('admin')
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get('products')
  list(@Query('status') status?: string) {
    return this.audit.list(status);
  }

  @Post('products/:id/review')
  review(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewProductDto,
  ) {
    return this.audit.review(Number(id), user.id, dto);
  }
}
