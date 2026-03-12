import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalizedLoaded,
} from 'vue-router'

import HomePage from '@/features/home/HomePage.vue'
import GitCommitHelperPage from '@/features/git-commit-helper/GitCommitHelperPage.vue'
import TimeFrequencyToolPage from '@/features/time-frequency-tool/TimeFrequencyToolPage.vue'
import TimestampToolPage from '@/features/timestamp-tool/TimestampToolPage.vue'
import WorktimeToolPage from '@/features/worktime-tool/WorktimeToolPage.vue'

const APP_TITLE = 'VTool'

export function formatDocumentTitle(pageTitle?: string): string {
  return pageTitle ? `${APP_TITLE}|${pageTitle}` : APP_TITLE
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: {
        title: '首页',
      },
    },
    {
      path: '/tools/git-commit-helper',
      name: 'git-commit-helper',
      component: GitCommitHelperPage,
      meta: {
        title: 'Git 提交辅助',
      },
    },
    {
      path: '/tools/timestamp',
      name: 'timestamp-tool',
      component: TimestampToolPage,
      meta: {
        title: '时间戳转换',
      },
    },
    {
      path: '/tools/time-frequency',
      name: 'time-frequency-tool',
      component: TimeFrequencyToolPage,
      meta: {
        title: '时间 / 频率换算',
      },
    },
    {
      path: '/tools/worktime',
      name: 'worktime-tool',
      component: WorktimeToolPage,
      meta: {
        title: '工时日历',
      },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export function updateDocumentTitle(
  route: RouteLocationNormalizedLoaded = router.currentRoute.value,
) {
  document.title = formatDocumentTitle(route.meta.title as string | undefined)
}

router.afterEach((to) => {
  updateDocumentTitle(to)
})
