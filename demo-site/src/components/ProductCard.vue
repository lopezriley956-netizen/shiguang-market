<script setup lang="ts">
import type { Product } from '@/api/types';

defineProps<{ product: Product }>();

const cover = (product: Product) =>
  product.images?.[0]?.url ||
  'https://placehold.co/600x450?text=%E6%8B%BE%E5%85%89%E9%9B%86%E5%B8%82';
</script>

<template>
  <RouterLink
    :to="`/goods/${product.id}`"
    class="card group overflow-hidden transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
  >
    <div class="aspect-[4/3] overflow-hidden bg-slate-100">
      <img :src="cover(product)" :alt="product.title" class="h-full w-full object-cover transition group-hover:scale-105" />
    </div>
    <div class="p-3">
      <p class="line-clamp-1 text-sm font-semibold text-slate-800">{{ product.title }}</p>
      <p class="mt-1 line-clamp-1 text-xs text-slate-400">
        {{ product.condition }} · {{ product.location || product.category?.name }}
      </p>
      <div class="mt-2 flex items-baseline justify-between">
        <span class="text-lg font-bold text-brand-600">¥{{ product.price.toFixed(2) }}</span>
        <span class="text-[11px] text-slate-400">{{ product.wantCount }} 人想要</span>
      </div>
    </div>
  </RouterLink>
</template>
