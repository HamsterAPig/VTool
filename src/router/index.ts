import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/features/home/HomePage.vue'
import TimeFrequencyToolPage from '@/features/time-frequency-tool/TimeFrequencyToolPage.vue'
import TimestampToolPage from '@/features/timestamp-tool/TimestampToolPage.vue'
import WorktimeToolPage from '@/features/worktime-tool/WorktimeToolPage.vue'

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
    {
      path: '/tools/time-frequency',
      name: 'time-frequency-tool',
      component: TimeFrequencyToolPage,
    },
    {
      path: '/tools/worktime',
      name: 'worktime-tool',
      component: WorktimeToolPage,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
