import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApplyVerificationDto } from './dto/apply-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.users.getMe(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Get('me/verification')
  myVerification(@CurrentUser() user: AuthUser) {
    return this.users.myVerification(user.id);
  }

  @Post('me/verification')
  applyVerification(@CurrentUser() user: AuthUser, @Body() dto: ApplyVerificationDto) {
    return this.users.applyVerification(user.id, dto);
  }

  @Roles('admin')
  @Get('verifications')
  listVerifications(@Query('status') status?: string) {
    return this.users.listVerifications(status);
  }

  @Roles('admin')
  @Post('verifications/:id/review')
  reviewVerification(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.users.reviewVerification(Number(id), user.id, dto);
  }

  @Public()
  @Get(':id')
  publicProfile(@Param('id') id: string) {
    return this.users.getPublicProfile(Number(id));
  }
}
