import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { SocialService } from './social.service';

@Controller()
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Get('favorites')
  favorites(@CurrentUser() user: AuthUser) {
    return this.social.listFavorites(user.id);
  }

  @Post('favorites/:productId')
  addFavorite(@CurrentUser() user: AuthUser, @Param('productId') id: string) {
    return this.social.addFavorite(user.id, Number(id));
  }

  @Delete('favorites/:productId')
  removeFavorite(@CurrentUser() user: AuthUser, @Param('productId') id: string) {
    return this.social.removeFavorite(user.id, Number(id));
  }

  @Get('footprints')
  footprints(@CurrentUser() user: AuthUser) {
    return this.social.listFootprints(user.id);
  }

  @Post('footprints/:productId')
  addFootprint(@CurrentUser() user: AuthUser, @Param('productId') id: string) {
    return this.social.addFootprint(user.id, Number(id));
  }
}
