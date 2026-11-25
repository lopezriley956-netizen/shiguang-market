<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const mode = ref<'login' | 'register'>('login');
const form = ref({ phone: '', password: '', nickname: '' });
const error = ref('');
const busy = ref(false);
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

async function submit() {
  error.value = '';
  busy.value = true;
  try {
    if (mode.value === 'login') await userStore.login(form.value.phone, form.value.password);
    else await userStore.register(form.value.phone, form.value.password, form.value.nickname);
    router.push((route.query.redirect as string) || '/');
  } catch (e: any) {
    error.value = e?.message || '登录失败，请检查手机号和密码';
  } finally {
    busy.value = false;
  }
}

function quick(phone: string, password: string) {
  mode.value = 'login';
  form.value.phone = phone;
  form.value.password = password;
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <div class="card p-8">
      <h1 class="text-2xl font-bold text-slate-900">{{ mode === 'login' ? '欢迎回来' : '加入拾光集市' }}</h1>
      <p class="mt-1 text-sm text-slate-400">校园二手，让好物遇见下一位主人</p>

      <div class="mt-6 space-y-4">
        <input v-model="form.phone" class="input" placeholder="手机号" />
        <input v-model="form.password" type="password" class="input" placeholder="密码（至少 6 位）" />
        <input v-if="mode === 'register'" v-model="form.nickname" class="input" placeholder="昵称" />
      </div>

      <p v-if="error" class="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>

      <button class="btn-primary mt-6 w-full" :disabled="busy" @click="submit">
        {{ busy ? '请稍候…' : mode === 'login' ? '登录' : '注册并登录' }}
      </button>

      <button class="mt-4 w-full text-center text-xs text-brand-600" @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === 'login' ? '还没有账号？立即注册' : '已有账号？返回登录' }}
      </button>

      <div class="mt-6 border-t border-slate-100 pt-5 text-xs text-slate-400">
        <p>演示账号（需先运行 npm run seed）：</p>
        <div class="mt-2 flex gap-3">
          <button class="rounded-lg bg-slate-100 px-3 py-1.5 hover:bg-slate-200" @click="quick('13900000000', '123456')">填入用户</button>
          <button class="rounded-lg bg-slate-100 px-3 py-1.5 hover:bg-slate-200" @click="quick('13800000000', 'admin123')">填入管理员</button>
        </div>
      </div>
    </div>
  </div>
</template>
