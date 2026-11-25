import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

const KEY = 'sg_publish_draft';

export interface DraftForm {
  step: number;
  categoryId?: number;
  condition: string;
  dealType: string;
  bargain: boolean;
  title: string;
  description: string;
  brand: string;
  location: string;
  price: string;
  originPrice: string;
  images: string[];
  agreed: boolean;
}

function initial(): DraftForm {
  return {
    step: 1,
    condition: '几乎全新',
    dealType: '面交优先',
    bargain: true,
    title: '',
    description: '',
    brand: '',
    location: '',
    price: '',
    originPrice: '',
    images: [],
    agreed: false,
  };
}

export const useDraftStore = defineStore('draft', () => {
  const form = reactive<DraftForm>(initial());
  const savedAt = ref<string | null>(null);

  function restore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      Object.assign(form, initial(), parsed);
      savedAt.value = parsed.savedAt || null;
    } catch {
      reset();
    }
  }

  function save() {
    savedAt.value = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    localStorage.setItem(KEY, JSON.stringify({ ...form, savedAt: savedAt.value }));
  }

  function reset() {
    Object.assign(form, initial());
    savedAt.value = null;
    localStorage.removeItem(KEY);
  }

  restore();

  return { form, savedAt, save, reset, restore };
});
