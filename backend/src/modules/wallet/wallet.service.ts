import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { AmountDto } from './dto/amount.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(WalletTransaction) private readonly transactions: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async get(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    return {
      balance: user.balance,
      escrowBalance: user.escrowBalance,
      transactions: await this.transactions.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 50,
      }),
    };
  }

  async recharge(userId: number, dto: AmountDto) {
    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const user = await userRepo
        .createQueryBuilder('u')
        .setLock('pessimistic_write')
        .where('u.id = :id', { id: userId })
        .getOne();
      user.balance = Number((user.balance + dto.amount).toFixed(2));
      await userRepo.save(user);
      await this.write(manager, userId, 'recharge', dto.amount, user.balance, '模拟充值');
      return { balance: user.balance, escrowBalance: user.escrowBalance };
    });
  }

  async withdraw(userId: number, dto: AmountDto) {
    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const user = await userRepo
        .createQueryBuilder('u')
        .setLock('pessimistic_write')
        .where('u.id = :id', { id: userId })
        .getOne();
      if (user.balance < dto.amount) throw new BadRequestException('余额不足');
      user.balance = Number((user.balance - dto.amount).toFixed(2));
      await userRepo.save(user);
      await this.write(manager, userId, 'withdraw', dto.amount, user.balance, '模拟提现');
      return { balance: user.balance, escrowBalance: user.escrowBalance };
    });
  }

  private write(
    manager: any,
    userId: number,
    type: WalletTransaction['type'],
    amount: number,
    balanceAfter: number,
    remark: string,
  ) {
    const repo = manager.getRepository(WalletTransaction);
    return repo.save(repo.create({ userId, type, amount, balanceAfter, remark }));
  }
}
