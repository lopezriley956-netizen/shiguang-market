<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description?: string;
  }>(),
  { icon: '📦', description: '' },
);
</script>

<template>
  <div class="card border-dashed py-14 text-center">
    <div class="text-4xl">{{ icon }}</div>
    <p class="mt-3 text-sm font-medium text-slate-600">{{ title }}</p>
    <p v-if="description" class="mt-1 text-xs text-slate-400">{{ description }}</p>
    <div class="mt-4"><slot /></div>
  </div>
</template>
