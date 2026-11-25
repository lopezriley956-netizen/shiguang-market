# 拾光集市 · 校园二手交易平台

一个完整的校园二手交易平台全栈工程，包含前端、后端与数据库。基于原型设计扩展为可上线架构，实现商品浏览/搜索、5 步发布向导与审核、担保交易、钱包、校园认证、信用分、消息会话、收藏足迹与审核后台。

## 技术栈

| 层次 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Pinia + Vue Router + Tailwind CSS |
| 后端 | Node.js + NestJS + TypeScript + TypeORM |
| 数据库 | MySQL 8 |
| 认证 | JWT（access token）+ 全局守卫 + 角色守卫（user / admin） |

## 功能模块

- **认证**：注册、登录、当前用户
- **用户与校园认证**：资料更新、认证申请/审核、用户详情
- **分类**：分类列表与管理
- **商品**：列表（分类/关键词/排序/分页）、详情、创建、更新、提交审核、下架、我的发布
- **审核**：待审核列表、通过/驳回
- **订单担保**：创建订单、支付、确认收货、取消
- **钱包**：余额查询、充值、提现
- **消息**：会话列表、消息收发、已读标记
- **收藏足迹**：收藏增删查、浏览足迹
- **信用**：信用分概览与明细
- **图片上传**：本地文件上传（返回 URL）

资金相关操作使用数据库事务 + 行锁 + 幂等键，避免重复扣款。

## 目录结构

```
shiguang-market/
  db/schema.sql              # 数据库脚本（15 张表 + 索引 + 分类种子）
  backend/                   # NestJS 后端
    src/entities/            # TypeORM 实体
    src/modules/             # 11 个业务模块
    src/database/seed.ts     # 种子数据脚本
    .env.example             # 环境变量样例
  frontend/                  # Vue 3 前端
    src/api/                 # 请求封装与类型
    src/stores/              # Pinia 状态
    src/views/               # 页面
    src/components/          # 通用组件
    .env.example
```

## 本地运行

### 前置条件

- Node.js 18+
- MySQL 8（默认账号 `root` / `root`，可在 `.env` 中修改）

### 1. 导入数据库

```bash
mysql -uroot -proot < db/schema.sql
```

### 2. 启动后端

```bash
cd backend
cp .env.example .env        # 按需修改数据库账号/JWT 密钥
npm install
npm run seed                # 灌入演示数据（可选）
npm run start:dev
```

后端默认运行在 http://localhost:3000/api

### 3. 启动前端

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

打开 http://localhost:5173

### 演示账号

| 角色 | 手机号 | 密码 |
|---|---|---|
| 管理员 | 13800000000 | admin123 |
| 普通用户 | 13900000000 | 123456 |

## 说明

- 图片上传当前落盘到后端 `backend/uploads/`，未接对象存储。
- 充值/支付为本地模拟，用于跑通担保交易状态机。
- Redis、Elasticsearch、消息队列属于扩展项，当前工程未引入。
- 生产环境请务必修改 `JWT_SECRET`、数据库密码，并接入 HTTPS、对象存储与真实支付。

## License

MIT
