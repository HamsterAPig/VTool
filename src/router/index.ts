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
        eyebrow: 'Workspace Overview',
        summary: '重新组织全部工具入口、主题切换和最近使用路径的工作台首页。',
        title: '首页',
      },
    },
    {
      path: '/tools/git-commit-helper',
      name: 'git-commit-helper',
      component: GitCommitHelperPage,
      meta: {
        eyebrow: 'Commit Workspace',
        summary:
          '把 emoji、type、scope、描述和最终复制结果收束到一条提交任务流里。',
        title: 'Git 提交辅助',
      },
    },
    {
      path: '/tools/timestamp',
      name: 'timestamp-tool',
      component: TimestampToolPage,
      meta: {
        eyebrow: 'Timestamp Conversion',
        summary: '在秒、毫秒和本地日期时间之间快速往返，并贴着结果完成复制。',
        title: '时间戳转换',
      },
    },
    {
      path: '/tools/time-frequency',
      name: 'time-frequency-tool',
      component: TimeFrequencyToolPage,
      meta: {
        eyebrow: 'Reciprocal Conversion',
        summary: '围绕输入、倒数互转和同维度结果做成连续可操作的换算面板。',
        title: '时间 / 频率换算',
      },
    },
    {
      path: '/tools/worktime',
      name: 'worktime-tool',
      component: WorktimeToolPage,
      meta: {
        eyebrow: 'Worktime Ledger',
        summary:
          '把规则、月历、录入弹窗和浏览器数据操作整合成一套可键盘驱动的工时台。',
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
