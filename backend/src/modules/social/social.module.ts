import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../../entities/favorite.entity';
import { Footprint } from '../../entities/footprint.entity';
import { Product } from '../../entities/product.entity';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Footprint, Product])],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
