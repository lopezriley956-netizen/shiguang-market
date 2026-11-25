<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

onMounted(() => {
  if (userStore.token && !userStore.user) userStore.fetchMe().catch(() => userStore.logout());
});
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <RouterLink to="/" class="flex items-center gap-2 text-lg font-bold text-brand-700">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">拾</span>
          <span>拾光集市</span>
        </RouterLink>

        <nav class="flex flex-1 items-center gap-1 text-sm">
          <RouterLink to="/" class="rounded-full px-3 py-2 text-slate-600 hover:bg-slate-100">逛一逛</RouterLink>
          <RouterLink to="/publish" class="rounded-full px-3 py-2 text-slate-600 hover:bg-slate-100">发布闲置</RouterLink>
          <RouterLink v-if="userStore.isAdmin" to="/admin" class="rounded-full px-3 py-2 text-slate-600 hover:bg-slate-100">
            审核后台
          </RouterLink>
        </nav>

        <div v-if="userStore.isLoggedIn" class="flex items-center gap-3">
          <RouterLink to="/profile" class="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              {{ userStore.user?.nickname?.slice(0, 1) || '我' }}
            </span>
            {{ userStore.user?.nickname }}
            <span class="text-brand-600">· {{ userStore.user?.creditScore }}分</span>
          </RouterLink>
          <button class="text-xs text-slate-400 hover:text-rose-600" @click="userStore.logout()">退出</button>
        </div>
        <RouterLink v-else to="/login" class="btn-primary !px-4 !py-2">登录 / 注册</RouterLink>
      </div>
    </header>

    <main class="mx-auto min-h-[calc(100vh-9rem)] max-w-6xl px-4 py-8">
      <RouterView />
    </main>

    <footer class="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
      拾光集市 · 让闲置继续发光
    </footer>
  </div>
</template>
