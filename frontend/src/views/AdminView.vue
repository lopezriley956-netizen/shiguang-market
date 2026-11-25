<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/api';
import type { Product } from '@/api/types';
import EmptyState from '@/components/EmptyState.vue';

const tab = ref<'products' | 'verifications'>('products');
const products = ref<Product[]>([]);
const verifications = ref<any[]>([]);
const message = ref('');

function notify(text: string) {
  message.value = text;
  window.setTimeout(() => (message.value = ''), 2500);
}

async function load() {
  const [p, v] = await Promise.all([
    api.audit.products('pending'),
    api.users.listVerifications('pending'),
  ]);
  products.value = p;
  verifications.value = v;
}

onMounted(() => load().catch((e) => notify(e?.message || '加载失败')));

async function reviewProduct(id: number, action: 'approve' | 'reject') {
  await api.audit.review(id, { action, reason: action === 'reject' ? '商品信息不符合规范' : '' });
  notify(action === 'approve' ? '商品已通过审核' : '商品已驳回');
  load();
}

async function reviewVerification(id: number, action: 'approve' | 'reject') {
  await api.users.reviewVerification(id, { action });
  notify(action === 'approve' ? '认证已通过，信用分 +30' : '认证已驳回');
  load();
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">审核后台</h1>
      <p class="mt-1 text-sm text-slate-400">商品发布与校园认证的统一审核入口</p>
    </div>

    <div class="flex gap-2">
      <button class="chip" :class="tab === 'products' ? 'chip-active' : ''" @click="tab = 'products'">
        待审商品 ({{ products.length }})
      </button>
      <button class="chip" :class="tab === 'verifications' ? 'chip-active' : ''" @click="tab = 'verifications'">
        校园认证 ({{ verifications.length }})
      </button>
    </div>

    <section v-if="tab === 'products'" class="space-y-3">
      <div v-for="item in products" :key="item.id" class="card flex gap-4 p-4">
        <img :src="item.images?.[0]?.url" class="h-24 w-24 rounded-xl object-cover" alt="" />
        <div class="flex-1">
          <h3 class="font-semibold">{{ item.title }}</h3>
          <p class="mt-1 text-sm text-brand-600">¥{{ item.price.toFixed(2) }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ item.seller?.nickname }} · {{ item.condition }} · {{ item.category?.name }}</p>
          <p class="mt-2 line-clamp-2 text-xs text-slate-500">{{ item.description }}</p>
        </div>
        <div class="flex flex-col justify-center gap-2">
          <button class="btn-primary !px-4 !py-2" @click="reviewProduct(item.id, 'approve')">通过</button>
          <button class="btn-ghost !px-4 !py-2" @click="reviewProduct(item.id, 'reject')">驳回</button>
        </div>
      </div>
      <EmptyState v-if="!products.length" title="暂无待审商品" />
    </section>

    <section v-else class="space-y-3">
      <div v-for="item in verifications" :key="item.id" class="card flex items-center gap-4 p-4">
        <div class="flex-1">
          <h3 class="font-semibold">{{ item.realName }}</h3>
          <p class="mt-1 text-xs text-slate-400">{{ item.school }} · 学号哈希 {{ item.studentNoHash.slice(0, 12) }}…</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary !px-4 !py-2" @click="reviewVerification(item.id, 'approve')">通过</button>
          <button class="btn-ghost !px-4 !py-2" @click="reviewVerification(item.id, 'reject')">驳回</button>
        </div>
      </div>
      <EmptyState v-if="!verifications.length" title="暂无待审认证" />
    </section>

    <div v-if="message" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm text-white">
      {{ message }}
    </div>
  </div>
</template>
