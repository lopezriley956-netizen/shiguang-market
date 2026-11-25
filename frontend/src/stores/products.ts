import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/api';
import type { Category, PageResult, Product } from '@/api/types';

export const useProductsStore = defineStore('products', () => {
  const categories = ref<Category[]>([]);
  const items = ref<Product[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const keyword = ref('');
  const categoryId = ref<number | undefined>(undefined);

  async function fetchCategories() {
    if (!categories.value.length) categories.value = await api.categories.list();
    return categories.value;
  }

  async function fetchProducts(params: Record<string, any> = {}) {
    loading.value = true;
    try {
      const result = await api.products.list({
        keyword: keyword.value || undefined,
        categoryId: categoryId.value,
        status: 'approved',
        pageSize: 24,
        ...params,
      });
      items.value = result.items;
      total.value = result.total;
      return result as PageResult<Product>;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    keyword.value = '';
    categoryId.value = undefined;
  }

  return {
    categories,
    items,
    total,
    loading,
    keyword,
    categoryId,
    fetchCategories,
    fetchProducts,
    resetFilters,
  };
});
