import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { CreditLog } from '../../entities/credit-log.entity';
import { User } from '../../entities/user.entity';
import { Verification } from '../../entities/verification.entity';
import { ApplyVerificationDto } from './dto/apply-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
    @InjectRepository(CreditLog) private readonly creditLogs: Repository<CreditLog>,
    private readonly dataSource: DataSource,
  ) {}

  async getMe(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    const verification = await this.verifications.findOne({ where: { userId } });
    return { ...user, verified: verification?.status === 'approved' };
  }

  async getPublicProfile(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      school: user.school,
      creditScore: user.creditScore,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.users.update({ id: userId }, dto);
    return this.getMe(userId);
  }

  async applyVerification(userId: number, dto: ApplyVerificationDto) {
    const studentNoHash = crypto.createHash('sha256').update(dto.studentNo).digest('hex');
    let record = await this.verifications.findOne({ where: { userId } });
    if (!record) {
      record = this.verifications.create({ userId });
    }
    record.school = dto.school;
    record.realName = dto.realName;
    record.studentNoHash = studentNoHash;
    record.status = 'pending';
    record.reviewedAt = null;
    record.reviewerId = null;
    await this.verifications.save(record);
    return record;
  }

  async myVerification(userId: number) {
    return this.verifications.findOne({ where: { userId } });
  }

  async listVerifications(status?: string) {
    const qb = this.verifications.createQueryBuilder('v');
    if (status) qb.andWhere('v.status = :status', { status });
    return qb.orderBy('v.createdAt', 'DESC').getMany();
  }

  async reviewVerification(
    id: number,
    reviewerId: number,
    dto: ReviewVerificationDto,
  ) {
    const record = await this.verifications.findOne({ where: { id } });
    if (!record) throw new NotFoundException('认证记录不存在');

    return this.dataSource.transaction(async (manager) => {
      record.status = dto.action === 'approve' ? 'approved' : 'rejected';
      record.reviewerId = reviewerId;
      record.reviewedAt = new Date();
      await manager.getRepository(Verification).save(record);

      if (dto.action === 'approve') {
        const user = await manager.getRepository(User).findOne({ where: { id: record.userId } });
        if (user) {
          user.creditScore += 30;
          await manager.getRepository(User).save(user);
          await manager.getRepository(CreditLog).save(
            manager.getRepository(CreditLog).create({
              userId: user.id,
              delta: 30,
              reason: '校园认证通过',
            }),
          );
        }
      }
      return record;
    });
  }
}
