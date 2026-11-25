export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  signature?: string;
  school?: string;
  creditScore: number;
  balance: number;
  escrowBalance: number;
  role: 'user' | 'admin';
  verified?: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface ProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  sellerId: number;
  categoryId: number;
  title: string;
  description?: string;
  condition: string;
  dealType: string;
  location: string;
  price: number;
  originPrice?: number;
  bargain: boolean;
  status: string;
  viewCount: number;
  wantCount: number;
  images?: ProductImage[];
  seller?: User;
  category?: Category;
  createdAt?: string;
}

export interface Order {
  id: number;
  orderNo: string;
  productId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
}

export interface CreditLog {
  id: number;
  delta: number;
  reason: string;
  createdAt: string;
}

export interface CreditSummary {
  score: number;
  level: string;
  positiveRecords: number;
  logs: CreditLog[];
}

export interface WalletData {
  balance: number;
  escrowBalance: number;
  transactions: Array<{
    id: number;
    type: string;
    amount: number;
    balanceAfter: number;
    remark: string;
    createdAt: string;
  }>;
}

export interface Conversation {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  lastMessage: string;
  lastAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
