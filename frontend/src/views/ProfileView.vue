<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api';
import type { CreditSummary, Order, Product, WalletData } from '@/api/types';
import ProductCard from '@/components/ProductCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const userStore = useUserStore();
const tab = ref((route.query.tab as string) || 'published');
const tabs = [
  ['published', '我发布的'],
  ['orders', '我买到的'],
  ['favorites', '我的收藏'],
  ['footprints', '浏览足迹'],
  ['wallet', '我的钱包'],
  ['credit', '信用中心'],
  ['verification', '校园认证'],
];

const published = ref<Product[]>([]);
const orders = ref<Order[]>([]);
const favorites = ref<Product[]>([]);
const footprints = ref<Product[]>([]);
const wallet = ref<WalletData | null>(null);
const credit = ref<CreditSummary | null>(null);
const verification = ref<any>(null);
const amount = ref('100');
const verifyForm = ref({ school: '拾光大学', realName: '', studentNo: '' });
const message = ref('');

function notify(text: string) {
  message.value = text;
  window.setTimeout(() => (message.value = ''), 2500);
}

async function load() {
  const [p, o, f, fp, w, c, v] = await Promise.all([
    api.products.mine(),
    api.orders.mine(),
    api.social.favorites(),
    api.social.footprints(),
    api.wallet.get(),
    api.credit.me(),
    api.users.myVerification().catch(() => null),
  ]);
  published.value = p;
  orders.value = o;
  favorites.value = f;
  footprints.value = fp;
  wallet.value = w;
  credit.value = c;
  verification.value = v;
}

onMounted(() => {
  if (userStore.token && !userStore.user) userStore.fetchMe().catch(() => {});
  load().catch((e) => notify(e?.message || '数据加载失败'));
});

async function offline(id: number) {
  await api.products.offline(id);
  notify('商品已下架');
  load();
}
async function pay(id: number) {
  await api.orders.pay(id, `web-${id}-${Date.now()}`);
  notify('担保金已冻结');
  load();
}
async function confirm(id: number) {
  await api.orders.confirm(id);
  notify('交易完成，信用分已更新');
  load();
}
async function cancel(id: number) {
  await api.orders.cancel(id);
  notify('订单已取消');
  load();
}
async function recharge() {
  await api.wallet.recharge(Number(amount.value));
  notify('充值成功');
  load();
}
async function withdraw() {
  await api.wallet.withdraw(Number(amount.value));
  notify('提现成功');
  load();
}
async function applyVerification() {
  await api.users.applyVerification(verifyForm.value);
  notify('认证申请已提交');
  load();
}
</script>

<template>
  <div class="space-y-6">
    <section class="card flex flex-wrap items-center gap-6 p-6">
      <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700">
        {{ userStore.user?.nickname?.slice(0, 1) || '我' }}
      </span>
      <div class="flex-1">
        <h1 class="text-xl font-bold">{{ userStore.user?.nickname }}</h1>
        <p class="mt-1 text-sm text-slate-400">{{ userStore.user?.signature || '让闲置继续发光' }}</p>
      </div>
      <div class="flex gap-6 text-center">
        <div><p class="text-xl font-bold text-slate-900">{{ published.length }}</p><p class="text-xs text-slate-400">发布</p></div>
        <div><p class="text-xl font-bold text-slate-900">{{ favorites.length }}</p><p class="text-xs text-slate-400">收藏</p></div>
        <div><p class="text-xl font-bold text-brand-600">{{ credit?.score || userStore.user?.creditScore }}</p><p class="text-xs text-slate-400">信用分</p></div>
      </div>
    </section>

    <div class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="[key, label] in tabs"
        :key="key"
        class="chip shrink-0"
        :class="tab === key ? 'chip-active' : ''"
        @click="tab = key"
      >
        {{ label }}
      </button>
    </div>

    <section v-if="tab === 'published'" class="space-y-3">
      <div v-for="item in published" :key="item.id" class="card flex gap-4 p-4">
        <img :src="item.images?.[0]?.url" class="h-24 w-24 rounded-xl object-cover" alt="" />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">{{ item.title }}</h3>
            <span class="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">{{ item.status }}</span>
          </div>
          <p class="mt-1 text-sm font-bold text-brand-600">¥{{ item.price.toFixed(2) }}</p>
          <button v-if="item.status !== 'offline' && item.status !== 'sold'" class="mt-2 rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600" @click="offline(item.id)">
            下架
          </button>
        </div>
      </div>
      <EmptyState v-if="!published.length" title="还没有发布过宝贝" description="去首页发布第一件闲置吧" />
    </section>

    <section v-else-if="tab === 'orders'" class="space-y-3">
      <div v-for="order in orders" :key="order.id" class="card flex items-center gap-4 p-4">
        <div class="flex-1">
          <p class="text-sm font-medium">订单 {{ order.orderNo }}</p>
          <p class="mt-1 text-xs text-slate-400">¥{{ order.amount.toFixed(2) }} · {{ order.status }}</p>
        </div>
        <div class="flex gap-2">
          <button v-if="order.status === 'created'" class="btn-ghost !px-3 !py-1.5" @click="pay(order.id)">支付</button>
          <button v-if="order.status === 'escrow' || order.status === 'shipped'" class="btn-primary !px-3 !py-1.5" @click="confirm(order.id)">确认收货</button>
          <button v-if="order.status === 'created' || order.status === 'escrow'" class="btn-ghost !px-3 !py-1.5" @click="cancel(order.id)">取消</button>
        </div>
      </div>
      <EmptyState v-if="!orders.length" title="还没有买到宝贝" />
    </section>

    <section v-else-if="tab === 'favorites' || tab === 'footprints'">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ProductCard v-for="item in tab === 'favorites' ? favorites : footprints" :key="item.id" :product="item" />
      </div>
      <EmptyState v-if="!(tab === 'favorites' ? favorites : footprints).length" title="这里还空空的" />
    </section>

    <section v-else-if="tab === 'wallet' && wallet" class="space-y-4">
      <div class="card bg-slate-800 p-6 text-white">
        <p class="text-xs text-white/60">可用余额</p>
        <p class="mt-1 text-4xl font-bold">¥{{ wallet.balance.toFixed(2) }}</p>
        <p class="mt-2 text-xs text-white/60">担保冻结 ¥{{ wallet.escrowBalance.toFixed(2) }}</p>
      </div>
      <div class="card flex items-center gap-3 p-5">
        <input v-model="amount" type="number" min="1" class="input" />
        <button class="btn-primary" @click="recharge">充值</button>
        <button class="btn-ghost" @click="withdraw">提现</button>
      </div>
      <div class="card divide-y divide-slate-100 p-5">
        <p v-for="item in wallet.transactions" :key="item.id" class="flex justify-between py-2 text-sm">
          <span>{{ item.remark }}</span>
          <span class="font-medium">¥{{ item.amount.toFixed(2) }}</span>
        </p>
        <p v-if="!wallet.transactions.length" class="py-4 text-center text-xs text-slate-400">暂无资金流水</p>
      </div>
    </section>

    <section v-else-if="tab === 'credit' && credit" class="card p-6">
      <div class="flex items-end gap-3">
        <span class="text-5xl font-bold text-brand-600">{{ credit.score }}</span>
        <span class="pb-2 text-sm text-slate-400">{{ credit.level }}</span>
      </div>
      <div class="mt-6 divide-y divide-slate-100">
        <div v-for="log in credit.logs" :key="log.id" class="flex justify-between py-3 text-sm">
          <span>{{ log.reason }}<span class="ml-2 text-xs text-slate-400">{{ log.createdAt }}</span></span>
          <span :class="log.delta > 0 ? 'text-emerald-600' : 'text-rose-600'">{{ log.delta > 0 ? '+' : '' }}{{ log.delta }}</span>
        </div>
      </div>
    </section>

    <section v-else-if="tab === 'verification'" class="card p-6">
      <div v-if="verification?.status === 'approved'" class="text-center">
        <div class="text-4xl">🎓</div>
        <h2 class="mt-3 text-lg font-bold">校园认证已通过</h2>
        <p class="mt-2 text-sm text-slate-500">{{ verification.school }} · 已获得银牌卖家标识</p>
      </div>
      <div v-else class="mx-auto max-w-md space-y-4">
        <h2 class="text-lg font-bold">完成校园认证</h2>
        <input v-model="verifyForm.school" class="input" placeholder="学校" />
        <input v-model="verifyForm.realName" class="input" placeholder="真实姓名" />
        <input v-model="verifyForm.studentNo" class="input" placeholder="学号（仅存哈希）" />
        <button class="btn-primary w-full" @click="applyVerification">{{ verification?.status === 'rejected' ? '重新提交' : '立即认证' }}</button>
        <p class="text-xs text-slate-400">当前状态：{{ verification?.status || '未提交' }}</p>
      </div>
    </section>

    <div v-if="message" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm text-white">
      {{ message }}
    </div>
  </div>
</template>
