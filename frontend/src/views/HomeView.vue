<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useProductsStore } from '@/stores/products';
import ProductCard from '@/components/ProductCard.vue';
import EmptyState from '@/components/EmptyState.vue';

const store = useProductsStore();
const sort = ref<'new' | 'priceAsc' | 'priceDesc'>('new');
const error = ref('');

async function load() {
  error.value = '';
  try {
    await store.fetchProducts({ sort: sort.value });
  } catch (e: any) {
    error.value = e?.message || '加载商品失败，请确认后端已启动';
  }
}

onMounted(async () => {
  try {
    await store.fetchCategories();
  } catch {
    error.value = '分类加载失败，请确认数据库已初始化';
  }
  load();
});

let timer: number | undefined;
watch([() => store.keyword, () => store.categoryId], () => {
  clearTimeout(timer);
  timer = window.setTimeout(load, 300);
});
watch(sort, load);
</script>

<template>
  <div class="space-y-8">
    <section class="overflow-hidden rounded-3xl bg-brand-600 px-8 py-12 text-white">
      <p class="text-sm text-brand-100">校园二手 · 同校面交 · 平台担保</p>
      <h1 class="mt-3 text-3xl font-bold sm:text-4xl">让闲置继续发光</h1>
      <p class="mt-3 max-w-xl text-sm leading-6 text-brand-100">
        把用不上的好物交给下一位同学。发布简单、审核快速、担保交易更安心。
      </p>
      <RouterLink to="/publish" class="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700">
        发布我的闲置 →
      </RouterLink>
    </section>

    <section class="card p-5">
      <input v-model="store.keyword" class="input" placeholder="搜索你想要的宝贝，例如：耳机、教材、跑鞋" />
      <div class="mt-4 flex flex-wrap gap-2">
        <button class="chip" :class="!store.categoryId ? 'chip-active' : ''" @click="store.categoryId = undefined">
          全部
        </button>
        <button
          v-for="category in store.categories"
          :key="category.id"
          class="chip"
          :class="store.categoryId === category.id ? 'chip-active' : ''"
          @click="store.categoryId = category.id"
        >
          {{ category.icon }} {{ category.name }}
        </button>
      </div>
    </section>

    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">
          在售好物 <span class="text-sm font-normal text-slate-400">共 {{ store.total }} 件</span>
        </h2>
        <select v-model="sort" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
          <option value="new">最新发布</option>
          <option value="priceAsc">价格从低到高</option>
          <option value="priceDesc">价格从高到低</option>
        </select>
      </div>

      <p v-if="error" class="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>

      <div v-if="store.loading" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="skeleton h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div v-else-if="store.items.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <ProductCard v-for="product in store.items" :key="product.id" :product="product" />
      </div>
      <EmptyState v-else icon="🔍" title="没有找到合适的宝贝" description="换个关键词或分类试试看">
        <RouterLink to="/publish" class="btn-primary">发布第一件闲置</RouterLink>
      </EmptyState>
    </section>
  </div>
</template>
