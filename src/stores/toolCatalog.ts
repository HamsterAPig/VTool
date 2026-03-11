import { defineStore } from 'pinia'

import type { ToolDefinition } from '@/types/tool'

const toolCatalog: ToolDefinition[] = [
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: '在秒、毫秒时间戳与本地日期时间之间快速互转。',
    path: '/tools/timestamp',
    status: 'available',
    tags: ['开发调试', '日期时间'],
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
