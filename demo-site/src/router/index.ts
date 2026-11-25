import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import HomeView from '@/views/HomeView.vue';
import GoodsDetailView from '@/views/GoodsDetailView.vue';
import PublishView from '@/views/PublishView.vue';
import ProfileView from '@/views/ProfileView.vue';
import LoginView from '@/views/LoginView.vue';
import AdminView from '@/views/AdminView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/goods/:id', name: 'goods', component: GoodsDetailView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/publish', name: 'publish', component: PublishView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, admin: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();
  if (userStore.token && !userStore.user) {
    try {
      await userStore.fetchMe();
    } catch {
      userStore.logout();
    }
  }
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.admin && !userStore.isAdmin) return { name: 'home' };
  return true;
});

export default router;
