import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
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

interface ApiClient extends Omit<AxiosInstance, 'get' | 'post' | 'patch' | 'delete' | 'request'> {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  request<T = any>(config: AxiosRequestConfig): Promise<T>;
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sg_token');
      if (location.pathname !== '/login') location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  },
);

const http = instance as unknown as ApiClient;

export const api = {
  auth: {
    register: (data: { phone: string; password: string; nickname: string }) =>
      http.post<any>('/auth/register', data),
    login: (data: { phone: string; password: string }) =>
      http.post<any>('/auth/login', data),
    me: () => http.get<User>('/auth/me'),
  },
  users: {
    me: () => http.get<User>('/users/me'),
    updateMe: (data: Partial<User>) => http.patch<User>('/users/me', data),
    myVerification: () => http.get<any>('/users/me/verification'),
    applyVerification: (data: { school: string; realName: string; studentNo: string }) =>
      http.post<any>('/users/me/verification', data),
    listVerifications: (status?: string) =>
      http.get<any[]>('/users/verifications', { params: { status } }),
    reviewVerification: (id: number, data: { action: 'approve' | 'reject'; reason?: string }) =>
      http.post<any>(`/users/verifications/${id}/review`, data),
    publicProfile: (id: number) => http.get<any>(`/users/${id}`),
  },
  categories: {
    list: () => http.get<Category[]>('/categories'),
    create: (data: { name: string; icon?: string; sortOrder?: number }) =>
      http.post<Category>('/categories', data),
  },
  products: {
    list: (params: any) => http.get<PageResult<Product>>('/products', { params }),
    detail: (id: number) => http.get<Product>(`/products/${id}`),
    mine: () => http.get<Product[]>('/products/mine'),
    create: (data: any) => http.post<Product>('/products', data),
    update: (id: number, data: any) => http.patch<Product>(`/products/${id}`, data),
    submit: (id: number) => http.post<Product>(`/products/${id}/submit`),
    offline: (id: number) => http.delete<Product>(`/products/${id}`),
  },
  audit: {
    products: (status = 'pending') => http.get<Product[]>('/audit/products', { params: { status } }),
    review: (id: number, data: { action: 'approve' | 'reject'; reason?: string }) =>
      http.post<Product>(`/audit/products/${id}/review`, data),
  },
  orders: {
    create: (data: { productId: number; addressId?: number }) => http.post<Order>('/orders', data),
    mine: () => http.get<Order[]>('/orders/mine'),
    sold: () => http.get<Order[]>('/orders/sold'),
    detail: (id: number) => http.get<Order>(`/orders/${id}`),
    pay: (id: number, idempotencyKey?: string) =>
      http.post<Order>(`/orders/${id}/pay`, { idempotencyKey }),
    confirm: (id: number) => http.post<Order>(`/orders/${id}/confirm`),
    cancel: (id: number) => http.post<Order>(`/orders/${id}/cancel`),
  },
  wallet: {
    get: () => http.get<WalletData>('/wallet'),
    recharge: (amount: number) => http.post<any>('/wallet/recharge', { amount }),
    withdraw: (amount: number) => http.post<any>('/wallet/withdraw', { amount }),
  },
  messages: {
    conversations: () => http.get<Conversation[]>('/conversations'),
    history: (id: number) => http.get<Message[]>(`/conversations/${id}/messages`),
    send: (productId: number, data: { type?: string; content: string }) =>
      http.post<Message>(`/conversations/${productId}/messages`, data),
    read: (id: number) => http.patch<Message>(`/messages/${id}/read`),
  },
  social: {
    favorites: () => http.get<Product[]>('/favorites'),
    addFavorite: (productId: number) => http.post<any>(`/favorites/${productId}`),
    removeFavorite: (productId: number) => http.delete<any>(`/favorites/${productId}`),
    footprints: () => http.get<Product[]>('/footprints'),
    addFootprint: (productId: number) => http.post<any>(`/footprints/${productId}`),
  },
  credit: {
    me: () => http.get<CreditSummary>('/credit/me'),
    logs: () => http.get<CreditLog[]>('/credit/logs'),
  },
  upload: {
    image: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return http.post<{ url: string }>('/uploads/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
};

export default http;
