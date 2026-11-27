import type {
  Category,
  Conversation,
  CreditLog,
  CreditSummary,
  Message,
  Order,
  PageResult,
  Product,
  User,
  WalletData,
} from './types';

// ============================================================
// 演示模式：所有数据内嵌在前端，无需后端与数据库。
// 图片用 SVG data URI 生成，离线也能显示。
// ============================================================

const svgCover = (label: string, emoji: string, hue: number): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue},70%,82%)"/>
      <stop offset="100%" stop-color="hsl(${hue + 25},65%,68%)"/>
    </linearGradient></defs>
    <rect width="600" height="450" fill="url(#g)"/>
    <text x="300" y="230" font-size="130" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    <text x="300" y="360" font-size="30" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const now = new Date();
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

const demoUser: User = {
  id: 2,
  phone: '13900000000',
  nickname: '拾光同学',
  signature: '让闲置继续发光',
  school: '拾光大学',
  creditScore: 782,
  balance: 5000,
  escrowBalance: 399,
  role: 'user',
  verified: true,
  createdAt: iso(120),
};

const adminUser: User = {
  id: 1,
  phone: '13800000000',
  nickname: '平台管理员',
  school: '拾光大学',
  creditScore: 900,
  balance: 1000,
  escrowBalance: 0,
  role: 'admin',
  verified: true,
  createdAt: iso(180),
};

const sellers: User[] = [
  demoUser,
  { ...demoUser, id: 3, nickname: '橘子汽水', creditScore: 812, verified: true },
  { ...demoUser, id: 4, nickname: '早八战士', creditScore: 745, verified: true },
  { ...demoUser, id: 5, nickname: '图书馆常驻', creditScore: 690, verified: false },
  { ...demoUser, id: 6, nickname: '考研上岸啦', creditScore: 856, verified: true },
  { ...demoUser, id: 7, nickname: '毕业季清仓', creditScore: 730, verified: true },
];

const categories: Category[] = [
  { id: 1, name: '数码电子', icon: '📱', sortOrder: 10 },
  { id: 2, name: '教材书籍', icon: '📚', sortOrder: 20 },
  { id: 3, name: '服饰鞋包', icon: '👟', sortOrder: 30 },
  { id: 4, name: '生活用品', icon: '🛋️', sortOrder: 40 },
  { id: 5, name: '运动户外', icon: '🏀', sortOrder: 50 },
  { id: 6, name: '其他闲置', icon: '🎁', sortOrder: 60 },
];

type Seed = [number, string, string, number, string, string, number, number, number, string];
// id, 标题, 描述, 分类id, 成色, 交易方式, 价格, 原价, 卖家索引, emoji
const seedProducts: Seed[] = [
  [1, '索尼 WH-1000XM4 降噪耳机', '自用降噪耳机，成色几乎全新，配件齐全，支持同校面交验货。', 1, '几乎全新', '面交优先', 1299, 2899, 0, '🎧'],
  [2, '计算机专业课教材套装', '数据结构、操作系统、计算机网络教材，笔记清晰，考研党优选。', 2, '轻微使用', '均可', 88, 260, 3, '📚'],
  [3, 'Nike 跑鞋 42 码', '只穿过三次，鞋底干净，适合跑步和日常穿搭。', 5, '几乎全新', '面交优先', 399, 899, 1, '👟'],
  [4, 'iPad Air 4 64G WiFi', '屏幕无划痕，电池健康 92%，含原装保护壳与充电器。', 1, '几乎全新', '均可', 2200, 4399, 4, '📱'],
  [5, '星巴克保温杯', '朋友送的重复了，干净无异味，几乎全新。', 4, '全新', '面交优先', 60, 199, 2, '🥤'],
  [6, '机械键盘 87 键 茶轴', '手感清脆，背光正常，适合游戏和打字，附赠键帽。', 1, '轻微使用', '均可', 240, 599, 0, '⌨️'],
  [7, '瑜伽垫 + 哑铃套装', '健身跳槽闲置，垫子厚实防滑，哑铃 2kg 两只。', 5, '轻微使用', '面交优先', 120, 380, 1, '🧘'],
  [8, '考研英语真题全套', '2010-2024 年真题，含解析，笔记已整理成册。', 2, '轻微使用', '均可', 65, 220, 4, '📝'],
  [9, '北欧风台灯', '宿舍搬家出，暖光三档可调，底座稳固。', 4, '几乎全新', '面交优先', 45, 159, 3, '💡'],
  [10, '双肩电脑包 15.6 寸', '防泼水，隔层多，背带舒适，黑色百搭。', 3, '几乎全新', '均可', 80, 299, 2, '🎒'],
  [11, '吉他 民谣 41 寸', '入门款，音准稳定，含琴包和拨片，新手友好。', 6, '轻微使用', '面交优先', 320, 899, 5, '🎸'],
  [12, '小米手环 7', '功能正常，续航好，附原装充电线。', 1, '几乎全新', '均可', 130, 249, 5, '⌚'],
];

const makeProduct = (s: Seed): Product => {
  const [id, title, description, categoryId, condition, dealType, price, originPrice, sellerIdx, emoji] = s;
  return {
    id,
    sellerId: (sellers[sellerIdx] ?? sellers[0]).id,
    categoryId,
    title,
    description,
    condition,
    dealType,
    location: `拾光大学 ${['东区', '西区', '图书馆', '操场'][id % 4]}`,
    price,
    originPrice,
    bargain: id % 2 === 0,
    status: 'approved',
    viewCount: 40 + id * 17,
    wantCount: (id * 3) % 13,
    images: [
      { id: id * 10 + 1, url: svgCover(title.slice(0, 8), emoji, (id * 47) % 360), sortOrder: 0 },
      { id: id * 10 + 2, url: svgCover('实拍细节', emoji, (id * 47 + 40) % 360), sortOrder: 1 },
    ],
    seller: sellers[sellerIdx] ?? sellers[0],
    category: categories.find((c) => c.id === categoryId),
    createdAt: iso(id),
  };
};

let products: Product[] = seedProducts.map(makeProduct);
let pendingProducts: Product[] = [
  {
    ...makeProduct([101, '富士拍立得相机', '朋友送的，几乎没用过，含相纸一盒。', 1, '几乎全新', '面交优先', 450, 799, 2, '📷']),
    status: 'pending',
  },
  {
    ...makeProduct([102, '考研数学全套资料', '张宇李永乐全套，笔记详细，可小刀。', 2, '轻微使用', '均可', 120, 400, 4, '📐']),
    status: 'pending',
  },
];

let currentUser: User = { ...demoUser };
let favorites: number[] = [1, 4, 8];
const footprints: number[] = [1, 4, 6, 11];
let walletState = {
  balance: 5000,
  escrowBalance: 399,
  transactions: [
    { id: 1, type: 'recharge', amount: 5000, balanceAfter: 5000, remark: '账户充值', createdAt: iso(60) },
    { id: 2, type: 'escrow', amount: -399, balanceAfter: 4601, remark: '担保冻结 · Nike 跑鞋', createdAt: iso(5) },
    { id: 3, type: 'income', amount: 88, balanceAfter: 4689, remark: '出售教材收入', createdAt: iso(3) },
  ],
};

const creditLogs: CreditLog[] = [
  { id: 1, delta: 782, reason: '初始信用分', createdAt: iso(120) },
  { id: 2, delta: 20, reason: '校园认证通过', createdAt: iso(100) },
  { id: 3, delta: 5, reason: '完成交易 · 教材套装', createdAt: iso(3) },
];

let orders: Order[] = [
  {
    id: 1001, orderNo: 'SG202611200001', productId: 3, buyerId: demoUser.id,
    sellerId: sellers[1].id, amount: 399, status: 'escrow', createdAt: iso(5), paidAt: iso(5),
  },
  {
    id: 1002, orderNo: 'SG202611220002', productId: 2, buyerId: demoUser.id,
    sellerId: sellers[3].id, amount: 88, status: 'completed', createdAt: iso(3), paidAt: iso(3), completedAt: iso(2),
  },
];

const conversations: Conversation[] = [
  { id: 1, productId: 1, buyerId: demoUser.id, sellerId: demoUser.id, lastMessage: '这个耳机还在吗？', lastAt: iso(1) },
  { id: 2, productId: 4, buyerId: demoUser.id, sellerId: sellers[4].id, lastMessage: '可以便宜一点吗？', lastAt: iso(2) },
];

const messages: Message[] = [
  { id: 1, conversationId: 1, senderId: demoUser.id, type: 'want', content: '这个耳机还在吗？', isRead: true, createdAt: iso(1) },
  { id: 2, conversationId: 2, senderId: demoUser.id, type: 'bargain', content: '可以便宜一点吗？', isRead: false, createdAt: iso(2) },
];

let verification: any = {
  id: 1, userId: demoUser.id, school: '拾光大学', realName: '拾光同学',
  studentNoHash: 'demo-student-hash-2026', status: 'approved', reviewerId: adminUser.id, reviewedAt: iso(100),
};

let pendingVerifications: any[] = [
  { id: 2, userId: 7, school: '拾光大学', realName: '同学甲', studentNoHash: 'a1b2c3d4e5f6g7h8', status: 'pending' },
];

const delay = <T>(data: T): Promise<T> => Promise.resolve(JSON.parse(JSON.stringify(data)));
const pageResult = (items: Product[]): PageResult<Product> => ({ items, total: items.length, page: 1, pageSize: 24 });

// ============================================================
// 真实云服务：分类 / 商品 / 审核走云端 PostgreSQL。
// 云端不可用时给出可见提示并回退到内置示例数据，绝不静默假装成功。
// ============================================================
import { cloud } from './cloud';

// 同一客户端的无类型视图：本项目未生成 schema 泛型，写操作需要绕过 never 推断。
const db: any = cloud.database;

let cloudWarned = false;
const cloudWarn = (err: unknown): void => {
  const message =
    err instanceof Error ? err.message : (err as { message?: string })?.message || String(err);
  console.warn('[拾光集市] 云服务请求失败，已使用内置示例数据：', message);
  if (cloudWarned) return;
  cloudWarned = true;
  try {
    const bar = document.createElement('div');
    bar.setAttribute(
      'style',
      'position:fixed;z-index:99998;left:12px;right:12px;bottom:12px;padding:12px 16px;' +
        'border-radius:10px;background:#fffbe6;color:#874d00;border:1px solid #ffe58f;' +
        'font:13px/1.6 sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.1)',
    );
    bar.textContent = `云端数据暂不可用，当前显示内置示例数据（${message}）。刷新页面可重试。`;
    document.body.appendChild(bar);
  } catch {
    /* 无 DOM 的环境忽略 */
  }
};

let cloudCategories: Category[] = [];
const loadCategories = async (): Promise<Category[]> => {
  const { data, error } = await db
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  cloudCategories = ((data || []) as any[]).map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    icon: String(r.icon || ''),
    sortOrder: Number(r.sort_order || 0),
  }));
  return cloudCategories;
};

const sellerFromRow = (r: any): User => ({
  id: Number(r.seller_id ?? 2),
  phone: '',
  nickname: String(r.seller_name || '拾光同学'),
  creditScore: Number(r.seller_credit ?? 700),
  balance: 0,
  escrowBalance: 0,
  role: 'user',
  verified: true,
});

const rowToProduct = (r: any): Product => {
  const imgs: Array<{ e?: string; h?: number }> = Array.isArray(r.images) ? r.images : [];
  const emoji = imgs[0]?.e || '📦';
  const hue = Number(imgs[0]?.h ?? 200);
  const catId = Number(r.category_id ?? 0);
  const title = String(r.title || '闲置好物');
  return {
    id: Number(r.id),
    sellerId: Number(r.seller_id ?? 2),
    categoryId: catId,
    title,
    description: String(r.description || ''),
    condition: String(r.item_condition || '几乎全新'),
    dealType: String(r.deal_type || '均可'),
    location: String(r.location || '拾光大学'),
    price: Number(r.price),
    originPrice: r.origin_price == null ? undefined : Number(r.origin_price),
    bargain: Boolean(r.bargain),
    status: String(r.status || 'approved'),
    viewCount: Number(r.views ?? 0),
    wantCount: Number(r.favorites ?? 0),
    images: [
      { id: Number(r.id) * 10 + 1, url: svgCover(title.slice(0, 8), emoji, hue), sortOrder: 0 },
      { id: Number(r.id) * 10 + 2, url: svgCover('实拍细节', emoji, (hue + 40) % 360), sortOrder: 1 },
    ],
    seller: sellerFromRow(r),
    category: (cloudCategories.length ? cloudCategories : categories).find((c) => c.id === catId),
    createdAt: r.created_at,
  };
};

const localList = (params: any = {}): PageResult<Product> => {
  let items = products.filter((p) => p.status === (params.status || 'approved'));
  if (params.categoryId) items = items.filter((p) => p.categoryId === params.categoryId);
  if (params.keyword) {
    const kw = String(params.keyword).toLowerCase();
    items = items.filter((p) => p.title.toLowerCase().includes(kw) || p.description?.toLowerCase().includes(kw));
  }
  if (params.sort === 'priceAsc') items = [...items].sort((a, b) => a.price - b.price);
  else if (params.sort === 'priceDesc') items = [...items].sort((a, b) => b.price - a.price);
  else items = [...items].sort((a, b) => b.id - a.id);
  return pageResult(items);
};

const safeKeyword = (value: unknown): string =>
  String(value ?? '').replace(/[(),%'\\]/g, '').trim();

export const api = {
  auth: {
    register: (data: { phone: string; password: string; nickname: string }) => {
      currentUser = { ...demoUser, phone: data.phone, nickname: data.nickname || '新同学' };
      return delay({ accessToken: 'demo-token', user: currentUser });
    },
    login: (data: { phone: string; password: string }) => {
      currentUser = data.phone === adminUser.phone ? { ...adminUser } : { ...demoUser };
      return delay({ accessToken: 'demo-token', user: currentUser });
    },
    me: () => delay(currentUser),
  },
  users: {
    me: () => delay(currentUser),
    updateMe: (data: Partial<User>) => {
      currentUser = { ...currentUser, ...data };
      return delay(currentUser);
    },
    myVerification: () => delay(verification),
    applyVerification: (data: any) => {
      verification = { ...verification, ...data, status: 'pending' };
      return delay(verification);
    },
    listVerifications: (status?: string) => delay(status === 'pending' ? pendingVerifications : [verification]),
    reviewVerification: (id: number, data: { action: string; reason?: string }) => {
      const idx = pendingVerifications.findIndex((v) => v.id === id);
      if (idx >= 0) pendingVerifications.splice(idx, 1);
      return delay({ id, status: data.action === 'approve' ? 'approved' : 'rejected' });
    },
    publicProfile: (id: number) => delay(sellers.find((u) => u.id === id) || demoUser),
  },
  categories: {
    list: async () => {
      try {
        return await loadCategories();
      } catch (err) {
        cloudWarn(err);
        return delay(categories);
      }
    },
    create: (data: any) => {
      const c = { id: categories.length + 1, sortOrder: 99, ...data } as Category;
      categories.push(c);
      return delay(c);
    },
  },
  products: {
    list: async (params: any = {}) => {
      try {
        if (!cloudCategories.length) await loadCategories();
        let q = db
          .from('products')
          .select('*', { count: 'exact' })
          .eq('status', params.status || 'approved');
        if (params.categoryId) q = q.eq('category_id', Number(params.categoryId));
        const kw = safeKeyword(params.keyword);
        if (kw) q = q.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`);
        if (params.sort === 'priceAsc') q = q.order('price', { ascending: true });
        else if (params.sort === 'priceDesc') q = q.order('price', { ascending: false });
        else q = q.order('id', { ascending: false });
        const { data, error } = await q;
        if (error) throw error;
        return pageResult(((data || []) as any[]).map(rowToProduct));
      } catch (err) {
        cloudWarn(err);
        return delay(localList(params));
      }
    },
    detail: async (id: number) => {
      try {
        if (!cloudCategories.length) await loadCategories();
        const { data, error } = await db
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (data) return rowToProduct(data);
      } catch (err) {
        cloudWarn(err);
      }
      const p = products.find((x) => x.id === id) || pendingProducts.find((x) => x.id === id);
      if (!p) return Promise.reject({ message: '商品不存在' });
      return delay(p);
    },
    mine: async () => {
      try {
        const { data, error } = await db
          .from('products')
          .select('*')
          .eq('seller_id', currentUser.id)
          .order('id', { ascending: false });
        if (error) throw error;
        return ((data || []) as any[]).map(rowToProduct);
      } catch (err) {
        cloudWarn(err);
        return delay(products.filter((p) => p.sellerId === demoUser.id));
      }
    },
    create: async (data: any) => {
      const row = {
        title: String(data.title || '').trim(),
        description: String(data.description || ''),
        category_id: Number(data.categoryId) || null,
        price: Number(data.price),
        origin_price: data.originPrice ? Number(data.originPrice) : null,
        item_condition: String(data.condition || '几乎全新'),
        deal_type: String(data.dealType || '均可'),
        location: String(data.location || '拾光大学'),
        seller_name: currentUser.nickname,
        seller_credit: currentUser.creditScore,
        seller_id: currentUser.id,
        images: [{ e: '📦', h: 210 }],
        status: 'pending',
        views: 0,
        favorites: 0,
        bargain: data.bargain !== false,
      };
      const { data: created, error } = await db.from('products').insert(row).select();
      if (error) throw new Error(error.message || '发布失败，请稍后重试');
      const rows = (created || []) as any[];
      if (!rows.length) throw new Error('发布未生效：没有写入权限，请刷新后重试');
      const p = rowToProduct(rows[0]);
      pendingProducts.unshift(p);
      return p;
    },
    update: async (id: number, data: any) => {
      const patch: Record<string, unknown> = {};
      if (data.title != null) patch.title = String(data.title);
      if (data.price != null) patch.price = Number(data.price);
      if (data.description != null) patch.description = String(data.description);
      const { data: updated, error } = await db
        .from('products')
        .update(patch)
        .eq('id', id)
        .select();
      if (error) throw error;
      const rows = (updated || []) as any[];
      return delay(rows.length ? rowToProduct(rows[0]) : products.find((x) => x.id === id));
    },
    submit: (id: number) => delay({ id, status: 'pending' }),
    offline: async (id: number) => {
      const { data: updated, error } = await db
        .from('products')
        .update({ status: 'offline' })
        .eq('id', id)
        .select();
      if (error) throw error;
      const rows = (updated || []) as any[];
      if (!rows.length) throw new Error('下架失败：没有权限或商品不存在');
      return delay({ id, status: 'offline' });
    },
  },
  audit: {
    products: async (status = 'pending') => {
      try {
        const { data, error } = await db
          .from('products')
          .select('*')
          .eq('status', status)
          .order('id', { ascending: false });
        if (error) throw error;
        return ((data || []) as any[]).map(rowToProduct);
      } catch (err) {
        cloudWarn(err);
        return delay(status === 'pending' ? pendingProducts : products.filter((p) => p.status === status));
      }
    },
    review: async (id: number, data: { action: string; reason?: string }) => {
      const next = data.action === 'approve' ? 'approved' : 'rejected';
      const { data: updated, error } = await db
        .from('products')
        .update({ status: next })
        .eq('id', id)
        .select();
      if (error) throw new Error(error.message || '审核失败，请稍后重试');
      const rows = (updated || []) as any[];
      if (!rows.length) throw new Error('审核未生效：没有权限或商品不存在');
      const idx = pendingProducts.findIndex((x) => x.id === id);
      if (idx >= 0) pendingProducts.splice(idx, 1);
      return delay({ id, status: next });
    },
  },
  orders: {
    create: (data: { productId: number }) => {
      const p = products.find((x) => x.id === data.productId) || pendingProducts.find((x) => x.id === data.productId);
      const order: Order = {
        id: Math.max(...orders.map((o) => o.id)) + 1,
        orderNo: `SG${Date.now()}`,
        productId: data.productId,
        buyerId: demoUser.id,
        sellerId: p?.sellerId || demoUser.id,
        amount: p?.price || 0,
        status: 'created',
        createdAt: new Date().toISOString(),
      };
      orders.unshift(order);
      return delay(order);
    },
    mine: () => delay(orders.filter((o) => o.buyerId === demoUser.id)),
    sold: () => delay(orders.filter((o) => o.sellerId === demoUser.id)),
    detail: (id: number) => delay(orders.find((o) => o.id === id)),
    pay: (id: number, _idempotencyKey?: string) => {
      const o = orders.find((x) => x.id === id);
      if (o) o.status = 'escrow';
      return delay(o);
    },
    confirm: (id: number) => {
      const o = orders.find((x) => x.id === id);
      if (o) o.status = 'completed';
      return delay(o);
    },
    cancel: (id: number) => {
      const o = orders.find((x) => x.id === id);
      if (o) o.status = 'cancelled';
      return delay(o);
    },
  },
  wallet: {
    get: (): Promise<WalletData> => delay(walletState as WalletData),
    recharge: (amount: number) => {
      walletState.balance += amount;
      walletState.transactions.unshift({ id: Date.now(), type: 'recharge', amount, balanceAfter: walletState.balance, remark: '账户充值', createdAt: new Date().toISOString() });
      return delay(walletState);
    },
    withdraw: (amount: number) => {
      walletState.balance -= amount;
      walletState.transactions.unshift({ id: Date.now(), type: 'withdraw', amount, balanceAfter: walletState.balance, remark: '余额提现', createdAt: new Date().toISOString() });
      return delay(walletState);
    },
  },
  messages: {
    conversations: () => delay(conversations),
    history: (id: number) => delay(messages.filter((m) => m.conversationId === id)),
    send: (productId: number, data: { type?: string; content: string }) => {
      let conv = conversations.find((c) => c.productId === productId);
      if (!conv) {
        conv = { id: conversations.length + 1, productId, buyerId: demoUser.id, sellerId: demoUser.id, lastMessage: data.content, lastAt: new Date().toISOString() };
        conversations.unshift(conv);
      }
      const msg: Message = {
        id: messages.length + 1, conversationId: conv.id, senderId: demoUser.id,
        type: data.type || 'text', content: data.content, isRead: true, createdAt: new Date().toISOString(),
      };
      messages.push(msg);
      conv.lastMessage = data.content;
      return delay(msg);
    },
    read: (id: number) => {
      const m = messages.find((x) => x.id === id);
      if (m) m.isRead = true;
      return delay(m);
    },
  },
  social: {
    favorites: () => delay(products.filter((p) => favorites.includes(p.id))),
    addFavorite: (productId: number) => {
      if (!favorites.includes(productId)) favorites.push(productId);
      return delay({ ok: true });
    },
    removeFavorite: (productId: number) => {
      favorites = favorites.filter((id) => id !== productId);
      return delay({ ok: true });
    },
    footprints: () => delay(products.filter((p) => footprints.includes(p.id))),
    addFootprint: (productId: number) => {
      if (!footprints.includes(productId)) footprints.unshift(productId);
      return delay({ ok: true });
    },
  },
  credit: {
    me: (): Promise<CreditSummary> => delay({
      score: currentUser.creditScore,
      level: currentUser.creditScore >= 750 ? '优秀' : '良好',
      positiveRecords: creditLogs.filter((l) => l.delta > 0).length,
      logs: creditLogs,
    }),
    logs: () => delay(creditLogs),
  },
  upload: {
    image: (_file: File) => delay({ url: svgCover('已上传图片', '🖼️', Math.floor(Math.random() * 360)) }),
  },
};

export default api;
