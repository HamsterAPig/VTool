export type ThemeId = 'aurora-mist' | 'jade-atelier' | 'rose-lab'

export interface ThemeOption {
  id: ThemeId
  label: string
  description: string
  browserThemeColor: string
  family: string
  signature: string
}

export const DEFAULT_THEME_ID: ThemeId = 'aurora-mist'

export const themeOptions: ThemeOption[] = [
  {
    id: 'aurora-mist',
    label: '极光雾白',
    description: '冷白雾感和蓝青高光，适合数据工具和日常高频使用。',
    browserThemeColor: '#eef5ff',
    family: 'Signal Deck',
    signature: '横向指挥台、冷白界面和蓝青高光，适合连续操作。',
  },
  {
    id: 'jade-atelier',
    label: '玉影雅室',
    description: '玉石白与青绿层次更克制，阅读感更沉稳。',
    browserThemeColor: '#f3f8f2',
    family: 'Editorial Atelier',
    signature: '纵向编排、静态留白和手册式阅读节奏，适合规则与说明。',
  },
  {
    id: 'rose-lab',
    label: '玫瑰实验室',
    description: '奶白基底配柔和玫瑰金高光，更精致也更轻盈。',
    browserThemeColor: '#fff4f1',
    family: 'Prototype Lab',
    signature: '漂浮卡片、暖色标记和实验台式布局，突出预览与结果。',
  },
]

const themeIdSet = new Set<ThemeId>(themeOptions.map((theme) => theme.id))

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && themeIdSet.has(value as ThemeId)
}

export function getThemeOption(themeId: ThemeId): ThemeOption {
  return themeOptions.find((theme) => theme.id === themeId) ?? themeOptions[0]!
}
