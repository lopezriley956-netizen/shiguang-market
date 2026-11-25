import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreditLog } from '../entities/credit-log.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Verification } from '../entities/verification.entity';

config({ path: '.env' });

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'shiguang_market',
  entities: [join(__dirname, '..', '**/*.entity{.ts,.js}')],
  synchronize: true,
  timezone: '+08:00',
});

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const categoriesRepo = dataSource.getRepository(Category);
  const products = dataSource.getRepository(Product);
  const verifications = dataSource.getRepository(Verification);
  const creditLogs = dataSource.getRepository(CreditLog);

  const adminPhone = '13800000000';
  let admin = await users.findOne({ where: { phone: adminPhone } });
  if (!admin) {
    admin = await users.save(
      users.create({
        phone: adminPhone,
        nickname: '平台管理员',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin',
        creditScore: 900,
        balance: 1000,
        school: '拾光大学',
      }),
    );
  }

  const demoPhone = '13900000000';
  let demo = await users.findOne({ where: { phone: demoPhone } });
  if (!demo) {
    demo = await users.save(
      users.create({
        phone: demoPhone,
        nickname: '拾光同学',
        passwordHash: await bcrypt.hash('123456', 10),
        creditScore: 782,
        balance: 5000,
        school: '拾光大学',
        signature: '让闲置继续发光',
      }),
    );
    await creditLogs.save(
      creditLogs.create({ userId: demo.id, delta: 782, reason: '初始信用分' }),
    );
  }

  const existingVerification = await verifications.findOne({ where: { userId: demo.id } });
  if (!existingVerification) {
    await verifications.save(
      verifications.create({
        userId: demo.id,
        school: '拾光大学',
        realName: '拾光同学',
        studentNoHash: 'demo-student-hash',
        status: 'approved',
        reviewerId: admin.id,
        reviewedAt: new Date(),
      }),
    );
  }

  const categoryNames = [
    ['数码电子', '📱', 10],
    ['教材书籍', '📚', 20],
    ['服饰鞋包', '👟', 30],
    ['生活用品', '🛋️', 40],
    ['运动户外', '🏀', 50],
    ['其他闲置', '🎁', 60],
  ] as const;

  const categoryMap: Record<string, Category> = {};
  for (const [name, icon, sortOrder] of categoryNames) {
    let category = await categoriesRepo.findOne({ where: { name } });
    if (!category) {
      category = await categoriesRepo.save(
        categoriesRepo.create({ name, icon, sortOrder }),
      );
    }
    categoryMap[name] = category;
  }

  const count = await products.count();
  if (count === 0) {
    await products.save([
      products.create({
        sellerId: demo.id,
        categoryId: categoryMap['数码电子'].id,
        title: '索尼 WH-1000XM4 降噪耳机',
        description: '自用的降噪耳机，成色几乎全新，配件齐全，支持同校面交验货。',
        condition: '几乎全新',
        dealType: '面交优先',
        location: '拾光大学 东区',
        price: 1299,
        originPrice: 2899,
        status: 'approved',
        wantCount: 12,
      }),
      products.create({
        sellerId: demo.id,
        categoryId: categoryMap['教材书籍'].id,
        title: '计算机专业课教材套装',
        description: '数据结构、操作系统、计算机网络教材，笔记清晰。',
        condition: '轻微使用',
        dealType: '均可',
        location: '拾光大学 图书馆',
        price: 88,
        status: 'approved',
        wantCount: 5,
      }),
      products.create({
        sellerId: demo.id,
        categoryId: categoryMap['运动户外'].id,
        title: 'Nike 跑鞋 42 码',
        description: '只穿过三次，鞋底干净，适合跑步和日常。',
        condition: '几乎全新',
        dealType: '面交优先',
        location: '拾光大学 操场',
        price: 399,
        status: 'pending',
      }),
    ]);
  }

  console.log('种子数据完成：');
  console.log('  管理员 13800000000 / admin123');
  console.log('  演示用户 13900000000 / 123456');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('种子数据失败:', error);
  process.exit(1);
});
