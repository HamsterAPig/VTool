import { defineStore } from 'pinia'

import type { ToolDefinition } from '@/types/tool'

const toolCatalog: ToolDefinition[] = [
  {
    id: 'git-commit-helper',
    name: 'Git 提交辅助',
    headline: '提交信息从选择到复制保持在同一工作区内完成。',
    description:
      '根据 Gitmoji 与 Conventional Commits 语义，实时生成提交文案与 git commit 命令。',
    path: '/tools/git-commit-helper',
    status: 'available',
    category: 'workflow',
    featured: true,
    shortcutHint: 'D 聚焦描述 / / 搜 emoji / C 复制文案',
    tags: ['开发调试', 'Git 工作流'],
  },
  {
    id: 'worktime',
    name: '工时日历',
    headline: '月历、规则和录入弹窗支持整套键盘流。',
    description: '按月录入上下班时间，自动统计每日和当月工时结论。',
    path: '/tools/worktime',
    status: 'available',
    category: 'time',
    featured: true,
    shortcutHint: '方向键切换 / Enter 编辑 / [ ] 切月',
    tags: ['效率工具', '工时统计'],
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    headline: '双向转换与复制集中在一个紧凑面板中。',
    description: '在秒、毫秒时间戳与本地日期时间之间快速互转。',
    path: '/tools/timestamp',
    status: 'available',
    category: 'time',
    shortcutHint: '/ 聚焦输入 / 1 2 切模式 / N 当前时间',
    tags: ['开发调试', '日期时间'],
  },
  {
    id: 'time-frequency',
    name: '时间 / 频率换算',
    headline: '输入、主结果和同维度结果并排协作，避免来回跳读。',
    description: '在时间单位、频率单位以及两者倒数关系之间快速换算。',
    path: '/tools/time-frequency',
    status: 'available',
    category: 'time',
    shortcutHint: '/ 聚焦输入 / U 单位 / X 互换维度',
    tags: ['开发调试', '信号换算'],
  },
  {
    id: 'json',
    name: 'JSON 工具',
    headline: '预留给格式化、校验和结构差异查看。',
    description: '后续会补充格式化、压缩、校验等高频能力。',
    path: '/tools/json',
    status: 'coming-soon',
    category: 'data',
    shortcutHint: '预留中',
    tags: ['数据处理', '即将推出'],
  },
  {
    id: 'text',
    name: '文本清洗',
    headline: '面向批量替换、去重和结构整理的文本工作区。',
    description: '预留给文本批量替换、去重和格式整理场景。',
    path: '/tools/text-cleanup',
    status: 'coming-soon',
    category: 'data',
    shortcutHint: '预留中',
    tags: ['文本处理', '即将推出'],
  },
]

export const useToolCatalogStore = defineStore('toolCatalog', {
  state: () => ({
    tools: toolCatalog,
  }),
})
