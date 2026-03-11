import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/features/home/HomePage.vue'
import TimestampToolPage from '@/features/timestamp-tool/TimestampToolPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/tools/timestamp',
      name: 'timestamp-tool',
      component: TimestampToolPage,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
