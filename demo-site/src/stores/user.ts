import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api } from '@/api';
import type { User } from '@/api/types';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('sg_token'));
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setSession(data: { accessToken: string; user: User }) {
    token.value = data.accessToken;
    user.value = data.user;
    localStorage.setItem('sg_token', data.accessToken);
  }

  async function login(phone: string, password: string) {
    const data = await api.auth.login({ phone, password });
    setSession(data as any);
    return data;
  }

  async function register(phone: string, password: string, nickname: string) {
    const data = await api.auth.register({ phone, password, nickname });
    setSession(data as any);
    return data;
  }

  async function fetchMe() {
    if (!token.value) return null;
    user.value = await api.users.me();
    return user.value;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('sg_token');
  }

  return { token, user, isLoggedIn, isAdmin, login, register, fetchMe, logout };
});
