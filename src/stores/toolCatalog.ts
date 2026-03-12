import { defineStore } from 'pinia'

import type { ToolDefinition } from '@/types/tool'

const toolCatalog: ToolDefinition[] = [
  {
    id: 'git-commit-helper',
    name: 'Git 提交辅助',
    description:
      '根据 Gitmoji 与 Conventional Commits 语义，实时生成提交文案与 git commit 命令。',
    path: '/tools/git-commit-helper',
    status: 'available',
    tags: ['开发调试', 'Git 工作流'],
  },
  {
    id: 'worktime',
    name: '工时日历',
    description: '按月录入上下班时间，自动统计每日和当月工时结论。',
    path: '/tools/worktime',
    status: 'available',
    tags: ['效率工具', '工时统计'],
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: '在秒、毫秒时间戳与本地日期时间之间快速互转。',
    path: '/tools/timestamp',
    status: 'available',
    tags: ['开发调试', '日期时间'],
  },
  {
    id: 'time-frequency',
    name: '时间 / 频率换算',
    description: '在时间单位、频率单位以及两者倒数关系之间快速换算。',
    path: '/tools/time-frequency',
    status: 'available',
    tags: ['开发调试', '信号换算'],
  },
  {
    id: 'json',
    name: 'JSON 工具',
    description: '后续会补充格式化、压缩、校验等高频能力。',
    path: '/tools/json',
    status: 'coming-soon',
    tags: ['数据处理', '即将推出'],
  },
  {
    id: 'text',
    name: '文本清洗',
    description: '预留给文本批量替换、去重和格式整理场景。',
    path: '/tools/text-cleanup',
    status: 'coming-soon',
    tags: ['文本处理', '即将推出'],
  },
]

export const useToolCatalogStore = defineStore('toolCatalog', {
  state: () => ({
    tools: toolCatalog,
  }),
})
