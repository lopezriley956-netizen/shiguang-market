<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/api';

const props = defineProps<{ modelValue: string[] }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>();
const uploading = ref(false);
const error = ref('');

async function onSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (!files.length) return;
  error.value = '';
  uploading.value = true;
  try {
    const urls = [...props.modelValue];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        error.value = '仅支持图片格式';
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        error.value = '单张图片不能超过 5MB';
        continue;
      }
      if (urls.length >= 9) {
        error.value = '最多上传 9 张图片';
        break;
      }
      const result = await api.upload.image(file);
      urls.push(result.url);
    }
    emit('update:modelValue', urls);
  } catch (e: any) {
    error.value = e?.message || '上传失败，请稍后重试';
  } finally {
    uploading.value = false;
    input.value = '';
  }
}

function remove(index: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  );
}
</script>

<template>
  <div>
    <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
      <div
        v-for="(url, index) in modelValue"
        :key="url + index"
        class="relative aspect-square overflow-hidden rounded-xl border-2 border-brand-300"
      >
        <img :src="url" class="h-full w-full object-cover" alt="商品实拍图" />
        <button
          type="button"
          class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/60 text-xs text-white"
          @click="remove(index)"
        >
          ✕
        </button>
      </div>
      <label
        v-if="modelValue.length < 9"
        class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 text-brand-600 transition hover:border-brand-400"
      >
        <input type="file" accept="image/*" multiple class="hidden" :disabled="uploading" @change="onSelect" />
        <span class="text-2xl">＋</span>
        <span class="mt-1 text-xs">{{ uploading ? '上传中…' : '添加图片' }}</span>
      </label>
    </div>
    <p v-if="error" class="mt-2 text-xs text-rose-600">{{ error }}</p>
    <p class="mt-2 text-xs text-slate-400">最多 9 张，单张不超过 5MB，支持 jpg / png / webp。</p>
  </div>
</template>
