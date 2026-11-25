import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditLog } from '../../entities/credit-log.entity';
import { User } from '../../entities/user.entity';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';

@Module({
  imports: [TypeOrmModule.forFeature([CreditLog, User])],
  controllers: [CreditController],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
