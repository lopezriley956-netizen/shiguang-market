<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import Stepper from '@/components/Stepper.vue';
import PhotoUpload from '@/components/PhotoUpload.vue';
import { useDraftStore } from '@/stores/draft';
import { useProductsStore } from '@/stores/products';
import { useUserStore } from '@/stores/user';

const steps = ['选分类', '传图片', '填信息', '定价格', '确认发布'];
const draft = useDraftStore();
const productStore = useProductsStore();
const userStore = useUserStore();
const router = useRouter();
const error = ref('');
const busy = ref(false);
const success = ref(false);
const form = reactive(draft.form);

onMounted(() => productStore.fetchCategories());

watch(
  () => ({ ...form }),
  () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => draft.save(), 800);
  },
  { deep: true },
);
let timer: number | undefined;

function next() {
  error.value = '';
  if (form.step === 1 && !form.categoryId) return (error.value = '请先选择一个分类');
  if (form.step === 2 && !form.images.length) return (error.value = '请至少上传一张实拍图');
  if (form.step === 3 && !form.title.trim()) return (error.value = '请填写商品标题');
  if (form.step === 4 && (!form.price || Number(form.price) <= 0)) return (error.value = '请填写有效售价');
  if (form.step === 5) return submit();
  form.step += 1;
}

function prev() {
  if (form.step > 1) form.step -= 1;
}

async function submit() {
  if (!form.agreed) return (error.value = '请先同意《发布规范》');
  busy.value = true;
  error.value = '';
  try {
    await api.products.create({
      title: form.title.trim(),
      categoryId: form.categoryId,
      description: form.description,
      condition: form.condition,
      dealType: form.dealType,
      location: form.location,
      price: Number(form.price),
      originPrice: form.originPrice ? Number(form.originPrice) : undefined,
      bargain: form.bargain,
      images: form.images,
      status: 'pending',
    });
    draft.reset();
    success.value = true;
  } catch (e: any) {
    error.value = e?.message || '发布失败，请稍后重试';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div class="card p-6">
      <h1 class="text-2xl font-bold text-slate-900">发布闲置</h1>
      <p class="mt-1 text-sm text-slate-400">五步完成发布，提交后进入平台审核</p>
      <div class="mt-6"><Stepper :steps="steps" :current="form.step" /></div>
    </div>

    <div v-if="success" class="card p-10 text-center">
      <div class="text-5xl">🎉</div>
      <h2 class="mt-4 text-xl font-bold">发布成功，等待审核</h2>
      <p class="mt-2 text-sm text-slate-500">审核通过后商品会在首页展示，通常约 10 分钟。</p>
      <RouterLink to="/profile?tab=published" class="btn-primary mt-6 inline-block">查看我发布的</RouterLink>
    </div>

    <div v-else-if="(userStore.user?.creditScore || 600) < 600" class="card border-rose-200 bg-rose-50 p-8 text-center">
      <h2 class="text-lg font-bold text-rose-700">信用分不足，暂时不能发布</h2>
      <p class="mt-2 text-sm text-rose-600">完成交易或校园认证可提升信用分。</p>
    </div>

    <div v-else class="card p-6">
      <div v-show="form.step === 1">
        <h2 class="font-bold">第一步 · 选择分类</h2>
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            v-for="category in productStore.categories"
            :key="category.id"
            class="rounded-xl border p-4 text-left transition"
            :class="form.categoryId === category.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'"
            @click="form.categoryId = category.id"
          >
            <span class="text-2xl">{{ category.icon }}</span>
            <p class="mt-2 text-sm font-medium">{{ category.name }}</p>
          </button>
        </div>
      </div>

      <div v-show="form.step === 2">
        <h2 class="font-bold">第二步 · 上传实拍图</h2>
        <div class="mt-4"><PhotoUpload v-model="form.images" /></div>
      </div>

      <div v-show="form.step === 3" class="space-y-4">
        <h2 class="font-bold">第三步 · 填写商品信息</h2>
        <div>
          <label class="mb-1 block text-sm">商品标题</label>
          <input v-model="form.title" class="input" maxlength="100" placeholder="例如：九成新降噪耳机，支持面交" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm">成色</label>
            <select v-model="form.condition" class="input">
              <option>全新</option><option>几乎全新</option><option>轻微使用</option><option>明显使用</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm">交易方式</label>
            <select v-model="form.dealType" class="input">
              <option>面交优先</option><option>快递优先</option><option>均可</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm">品牌 / 型号（选填）</label>
            <input v-model="form.brand" class="input" placeholder="例如 Sony WH-1000XM4" />
          </div>
          <div>
            <label class="mb-1 block text-sm">交易地点</label>
            <input v-model="form.location" class="input" placeholder="例如 拾光大学东区" />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm">详细描述</label>
          <textarea v-model="form.description" rows="5" class="input" placeholder="使用情况、配件、可小刀范围等" />
        </div>
      </div>

      <div v-show="form.step === 4" class="space-y-4">
        <h2 class="font-bold">第四步 · 设定价格</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm">售价（元）</label>
            <input v-model="form.price" type="number" min="0.01" step="0.01" class="input" />
          </div>
          <div>
            <label class="mb-1 block text-sm">原价（选填）</label>
            <input v-model="form.originPrice" type="number" min="0" step="0.01" class="input" />
          </div>
        </div>
        <label class="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4">
          <span class="text-sm">可接受议价</span>
          <input v-model="form.bargain" type="checkbox" class="h-5 w-5 accent-brand-600" />
        </label>
      </div>

      <div v-show="form.step === 5" class="space-y-4">
        <h2 class="font-bold">第五步 · 确认发布</h2>
        <div class="rounded-2xl border border-slate-200 p-5">
          <div class="flex gap-4">
            <img v-if="form.images[0]" :src="form.images[0]" class="h-28 w-28 rounded-xl object-cover" alt="封面" />
            <div class="flex-1">
              <p class="font-semibold">{{ form.title || '未命名宝贝' }}</p>
              <p class="mt-1 text-sm text-brand-600">¥{{ form.price || '—' }}</p>
              <p class="mt-2 text-xs text-slate-400">
                {{ productStore.categories.find((c) => c.id === form.categoryId)?.name }} · {{ form.condition }} · {{ form.dealType }}
              </p>
            </div>
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input v-model="form.agreed" type="checkbox" class="h-4 w-4 accent-brand-600" />
          我已阅读并同意《发布规范》
        </label>
      </div>

      <p v-if="error" class="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>

      <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <button class="btn-ghost" @click="draft.save()">保存草稿</button>
        <div class="flex gap-3">
          <button v-if="form.step > 1" class="btn-ghost" @click="prev">上一步</button>
          <button class="btn-primary" :disabled="busy" @click="next">
            {{ busy ? '发布中…' : form.step === 5 ? '确认发布 ✓' : '下一步 →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
