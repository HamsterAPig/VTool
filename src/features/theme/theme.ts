export type ThemeId = 'aurora-mist' | 'jade-atelier' | 'rose-lab'

export interface ThemeOption {
  id: ThemeId
  label: string
  description: string
  browserThemeColor: string
}

export const DEFAULT_THEME_ID: ThemeId = 'aurora-mist'

export const themeOptions: ThemeOption[] = [
  {
    id: 'aurora-mist',
    label: '极光雾白',
    description: '冷白雾感和蓝青高光，适合数据工具和日常高频使用。',
    browserThemeColor: '#eef5ff',
  },
  {
    id: 'jade-atelier',
    label: '玉影雅室',
    description: '玉石白与青绿层次更克制，阅读感更沉稳。',
    browserThemeColor: '#f3f8f2',
  },
  {
    id: 'rose-lab',
    label: '玫瑰实验室',
    description: '奶白基底配柔和玫瑰金高光，更精致也更轻盈。',
    browserThemeColor: '#fff4f1',
  },
]

const themeIdSet = new Set<ThemeId>(themeOptions.map((theme) => theme.id))

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && themeIdSet.has(value as ThemeId)
}

export function getThemeOption(themeId: ThemeId): ThemeOption {
  return themeOptions.find((theme) => theme.id === themeId) ?? themeOptions[0]!
}
