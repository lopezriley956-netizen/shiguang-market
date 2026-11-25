<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/api';
import type { Product } from '@/api/types';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const product = ref<Product | null>(null);
const activeImage = ref(0);
const favorited = ref(false);
const toast = ref('');
const error = ref('');
const busy = ref(false);

const productId = Number(route.params.id);
const cover = computed(() => product.value?.images?.[activeImage.value]?.url || 'https://placehold.co/800x600?text=%E6%8B%BE%E5%85%89%E9%9B%86%E5%B8%82');

function notify(message: string) {
  toast.value = message;
  window.setTimeout(() => (toast.value = ''), 2500);
}

async function load() {
  try {
    product.value = await api.products.detail(productId);
    if (userStore.isLoggedIn) {
      api.social.addFootprint(productId).catch(() => {});
      const favorites = await api.social.favorites();
      favorited.value = favorites.some((item) => item.id === productId);
    }
  } catch (e: any) {
    error.value = e?.message || '商品加载失败';
  }
}

onMounted(load);

async function toggleFavorite() {
  if (!userStore.isLoggedIn) return router.push('/login');
  if (favorited.value) {
    await api.social.removeFavorite(productId);
    favorited.value = false;
    notify('已取消收藏');
  } else {
    await api.social.addFavorite(productId);
    favorited.value = true;
    notify('已加入收藏');
  }
}

async function want() {
  if (!userStore.isLoggedIn) return router.push('/login');
  await api.messages.send(productId, {
    type: 'want',
    content: `我想要你的${product.value?.title || '这件宝贝'}`,
  });
  notify('已向卖家发送「想要」消息');
}

async function buy() {
  if (!userStore.isLoggedIn) return router.push('/login');
  busy.value = true;
  error.value = '';
  try {
    const order = await api.orders.create({ productId });
    await api.orders.pay(order.id, `web-${order.id}-${Date.now()}`);
    notify('担保金已冻结，请在个人中心确认收货');
    router.push('/profile?tab=orders');
  } catch (e: any) {
    error.value = e?.message || '下单失败，请检查钱包余额';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div v-if="product" class="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
    <div class="card overflow-hidden">
      <img :src="cover" :alt="product.title" class="aspect-[4/3] w-full object-cover" />
      <div v-if="product.images?.length" class="flex gap-2 p-3">
        <button
          v-for="(image, index) in product.images"
          :key="image.id"
          class="h-16 w-16 overflow-hidden rounded-lg border-2"
          :class="activeImage === index ? 'border-brand-500' : 'border-transparent'"
          @click="activeImage = index"
        >
          <img :src="image.url" class="h-full w-full object-cover" alt="缩略图" />
        </button>
      </div>
    </div>

    <div class="space-y-5">
      <div>
        <span class="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">{{ product.category?.name }}</span>
        <h1 class="mt-3 text-2xl font-bold text-slate-900">{{ product.title }}</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500">{{ product.description || '卖家暂未填写详细描述' }}</p>
      </div>

      <div class="flex items-baseline gap-3">
        <span class="text-4xl font-bold text-brand-600">¥{{ product.price.toFixed(2) }}</span>
        <span v-if="product.originPrice" class="text-sm text-slate-400 line-through">
          ¥{{ product.originPrice.toFixed(2) }}
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-4 text-center text-xs">
        <div><div class="font-semibold text-slate-800">{{ product.wantCount }}</div><div class="text-slate-400">人想要</div></div>
        <div><div class="font-semibold text-slate-800">{{ product.condition }}</div><div class="text-slate-400">成色</div></div>
        <div><div class="font-semibold text-slate-800">{{ product.dealType }}</div><div class="text-slate-400">交易方式</div></div>
      </div>

      <div class="card flex items-center gap-3 p-4">
        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
          {{ product.seller?.nickname?.slice(0, 1) || '卖' }}
        </span>
        <div class="flex-1">
          <p class="text-sm font-medium">{{ product.seller?.nickname }}</p>
          <p class="text-xs text-slate-400">{{ product.location }} · 信用 {{ product.seller?.creditScore }} 分</p>
        </div>
        <span class="text-xs text-slate-400">已认证卖家</span>
      </div>

      <p v-if="error" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>

      <div class="flex gap-3">
        <button class="btn-ghost flex-1" @click="toggleFavorite">{{ favorited ? '❤️ 已收藏' : '🤍 收藏' }}</button>
        <button class="btn-ghost flex-1" @click="want">💬 我想要</button>
        <button class="btn-primary flex-1" :disabled="busy" @click="buy">{{ busy ? '处理中…' : '立即购买' }}</button>
      </div>
    </div>
  </div>

  <div v-else class="card p-10 text-center text-sm text-slate-500">
    {{ error || '商品加载中…' }}
  </div>

  <div v-if="toast" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm text-white">
    {{ toast }}
  </div>
</template>
