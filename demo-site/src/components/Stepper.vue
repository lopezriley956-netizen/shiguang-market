<script setup lang="ts">
defineProps<{ steps: string[]; current: number }>();
</script>

<template>
  <div class="flex items-center">
    <template v-for="(step, index) in steps" :key="step">
      <div class="flex flex-1 items-center">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          :class="index + 1 < current ? 'bg-brand-100 text-brand-700' : index + 1 === current ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'"
        >
          {{ index + 1 < current ? '✓' : index + 1 }}
        </span>
        <span
          class="ml-2 hidden text-xs sm:block"
          :class="index + 1 === current ? 'font-medium text-brand-700' : 'text-slate-400'"
        >
          {{ step }}
        </span>
        <div v-if="index < steps.length - 1" class="mx-2 h-px flex-1 bg-slate-200" />
      </div>
    </template>
  </div>
</template>
