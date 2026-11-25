import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditLog } from '../../entities/credit-log.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(CreditLog) private readonly creditLogs: Repository<CreditLog>,
  ) {}

  async summary(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    const logs = await this.creditLogs.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    const positive = logs.filter((log) => log.delta > 0).length;
    return {
      score: user.creditScore,
      level: user.creditScore >= 850 ? '极好' : user.creditScore >= 700 ? '良好' : '普通',
      positiveRecords: positive,
      logs,
    };
  }

  logs(userId: number) {
    return this.creditLogs.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
