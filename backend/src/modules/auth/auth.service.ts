import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.users.findOne({ where: { phone: dto.phone } });
    if (exists) throw new ConflictException('该手机号已注册');

    const user = this.users.create({
      phone: dto.phone,
      nickname: dto.nickname,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    await this.users.save(user);
    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.phone = :phone', { phone: dto.phone })
      .getOne();

    if (!user || user.status === 'disabled') {
      throw new UnauthorizedException('手机号或密码错误');
    }
    const matched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matched) throw new UnauthorizedException('手机号或密码错误');

    return this.buildResponse(user);
  }

  async findById(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('用户不存在');
    return this.sanitize(user);
  }

  private buildResponse(user: User) {
    return {
      user: this.sanitize(user),
      accessToken: this.jwt.sign({
        sub: user.id,
        phone: user.phone,
        role: user.role,
      }),
    };
  }

  private sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
