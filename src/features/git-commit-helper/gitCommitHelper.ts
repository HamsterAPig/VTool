export type CommitMessageStyle = 'code' | 'emoji'

export type CommitCopyTarget = 'message' | 'command' | 'code' | 'emoji'

type CommitTypeKey =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'style'
  | 'refactor'
  | 'perf'
  | 'test'
  | 'build'
  | 'ci'
  | 'chore'
  | 'revert'

export interface GitEmojiDefinition {
  name: string
  emoji: string
  code: string
  description: string
  recommendedTypes: CommitTypeKey[]
}

export interface CommitTypeDefinition {
  type: CommitTypeKey
  label: string
  description: string
  recommendedEmojiCodes: string[]
}

export interface CommitDraftState {
  style: CommitMessageStyle
  emojiCode: string
  type: CommitTypeKey
  scope: string
  description: string
}

export interface CommitSuggestionResult {
  message: string
  command: string
  emoji: string
  code: string
  isReady: boolean
  validationHints: string[]
}

export interface GitEmojiSection {
  id: 'recommended' | 'compatible' | 'extended'
  title: string
  description: string
  items: GitEmojiDefinition[]
}

export const gitEmojiDefinitions: GitEmojiDefinition[] = [
  {
    name: 'art',
    emoji: '🎨',
    code: ':art:',
    description: '优化代码结构、格式或可读性。',
    recommendedTypes: ['style', 'refactor'],
  },
  {
    name: 'zap',
    emoji: '⚡️',
    code: ':zap:',
    description: '提升性能表现。',
    recommendedTypes: ['perf'],
  },
  {
    name: 'fire',
    emoji: '🔥',
    code: ':fire:',
    description: '移除代码、文件或不再需要的实现。',
    recommendedTypes: ['refactor', 'chore'],
  },
  {
    name: 'bug',
    emoji: '🐛',
    code: ':bug:',
    description: '修复缺陷。',
    recommendedTypes: ['fix'],
  },
  {
    name: 'ambulance',
    emoji: '🚑️',
    code: ':ambulance:',
    description: '紧急修复关键问题。',
    recommendedTypes: ['fix'],
  },
  {
    name: 'sparkles',
    emoji: '✨',
    code: ':sparkles:',
    description: '新增功能或可感知的新能力。',
    recommendedTypes: ['feat'],
  },
  {
    name: 'memo',
    emoji: '📝',
    code: ':memo:',
    description: '新增或更新文档。',
    recommendedTypes: ['docs'],
  },
  {
    name: 'rocket',
    emoji: '🚀',
    code: ':rocket:',
    description: '部署、发布或交付上线相关改动。',
    recommendedTypes: ['build', 'ci', 'chore'],
  },
  {
    name: 'lipstick',
    emoji: '💄',
    code: ':lipstick:',
    description: '更新界面样式或视觉文件。',
    recommendedTypes: ['style'],
  },
  {
    name: 'tada',
    emoji: '🎉',
    code: ':tada:',
    description: '初始化项目或完成重要里程碑。',
    recommendedTypes: ['chore', 'feat'],
  },
  {
    name: 'white-check-mark',
    emoji: '✅',
    code: ':white_check_mark:',
    description: '新增、更新或通过测试。',
    recommendedTypes: ['test'],
  },
  {
    name: 'lock',
    emoji: '🔒️',
    code: ':lock:',
    description: '修复安全或隐私问题。',
    recommendedTypes: ['fix'],
  },
  {
    name: 'closed-lock-with-key',
    emoji: '🔐',
    code: ':closed_lock_with_key:',
    description: '新增或更新密钥、证书和机密配置。',
    recommendedTypes: ['build', 'ci', 'chore'],
  },
  {
    name: 'bookmark',
    emoji: '🔖',
    code: ':bookmark:',
    description: '发布版本或维护版本标签。',
    recommendedTypes: ['build', 'ci', 'chore'],
  },
  {
    name: 'rotating-light',
    emoji: '🚨',
    code: ':rotating_light:',
    description: '修复编译器、静态检查或 lint 告警。',
    recommendedTypes: ['style', 'fix'],
  },
  {
    name: 'construction',
    emoji: '🚧',
    code: ':construction:',
    description: '功能开发中或暂未完成的工作。',
    recommendedTypes: ['chore', 'refactor'],
  },
  {
    name: 'green-heart',
    emoji: '💚',
    code: ':green_heart:',
    description: '修复 CI 构建或流水线异常。',
    recommendedTypes: ['ci', 'fix'],
  },
  {
    name: 'arrow-down',
    emoji: '⬇️',
    code: ':arrow_down:',
    description: '降级依赖版本。',
    recommendedTypes: ['build', 'chore'],
  },
  {
    name: 'arrow-up',
    emoji: '⬆️',
    code: ':arrow_up:',
    description: '升级依赖版本。',
    recommendedTypes: ['build', 'chore'],
  },
  {
    name: 'pushpin',
    emoji: '📌',
    code: ':pushpin:',
    description: '固定依赖到特定版本。',
    recommendedTypes: ['build', 'chore'],
  },
  {
    name: 'construction-worker',
    emoji: '👷',
    code: ':construction_worker:',
    description: '新增或调整 CI 构建系统。',
    recommendedTypes: ['ci', 'build'],
  },
  {
    name: 'chart-with-upwards-trend',
    emoji: '📈',
    code: ':chart_with_upwards_trend:',
    description: '新增或更新埋点、分析和追踪能力。',
    recommendedTypes: ['feat', 'perf'],
  },
  {
    name: 'recycle',
    emoji: '♻️',
    code: ':recycle:',
    description: '重构实现。',
    recommendedTypes: ['refactor'],
  },
  {
    name: 'heavy-plus-sign',
    emoji: '➕',
    code: ':heavy_plus_sign:',
    description: '新增依赖。',
    recommendedTypes: ['build', 'chore'],
  },
  {
    name: 'heavy-minus-sign',
    emoji: '➖',
    code: ':heavy_minus_sign:',
    description: '移除依赖。',
    recommendedTypes: ['build', 'chore'],
  },
  {
    name: 'wrench',
    emoji: '🔧',
    code: ':wrench:',
    description: '新增或更新配置文件。',
    recommendedTypes: ['chore', 'build', 'ci'],
  },
  {
    name: 'hammer',
    emoji: '🔨',
    code: ':hammer:',
    description: '新增或更新开发脚本。',
    recommendedTypes: ['chore', 'build'],
  },
  {
    name: 'globe-with-meridians',
    emoji: '🌐',
    code: ':globe_with_meridians:',
    description: '国际化与本地化支持。',
    recommendedTypes: ['feat', 'docs'],
  },
  {
    name: 'pencil2',
    emoji: '✏️',
    code: ':pencil2:',
    description: '修正文案或拼写错误。',
    recommendedTypes: ['docs'],
  },
  {
    name: 'poop',
    emoji: '💩',
    code: ':poop:',
    description: '临时糟糕实现，后续需要改进。',
    recommendedTypes: ['refactor', 'chore'],
  },
  {
    name: 'rewind',
    emoji: '⏪️',
    code: ':rewind:',
    description: '回滚历史改动。',
    recommendedTypes: ['revert'],
  },
  {
    name: 'twisted-rightwards-arrows',
    emoji: '🔀',
    code: ':twisted_rightwards_arrows:',
    description: '合并分支或整理合流提交。',
    recommendedTypes: ['chore'],
  },
  {
    name: 'package',
    emoji: '📦️',
    code: ':package:',
    description: '新增或更新构建产物、包文件或打包结果。',
    recommendedTypes: ['build', 'chore'],
  },
  {
    name: 'alien',
    emoji: '👽️',
    code: ':alien:',
    description: '因外部 API 变更而调整代码。',
    recommendedTypes: ['fix', 'feat'],
  },
  {
    name: 'truck',
    emoji: '🚚',
    code: ':truck:',
    description: '移动或重命名文件、路径与资源。',
    recommendedTypes: ['refactor', 'chore'],
  },
  {
    name: 'page-facing-up',
    emoji: '📄',
    code: ':page_facing_up:',
    description: '新增或更新许可证、协议或声明文件。',
    recommendedTypes: ['docs'],
  },
  {
    name: 'boom',
    emoji: '💥',
    code: ':boom:',
    description: '引入破坏性变更。',
    recommendedTypes: ['feat', 'refactor'],
  },
  {
    name: 'bento',
    emoji: '🍱',
    code: ':bento:',
    description: '新增或更新图片、图标、媒体等资源素材。',
    recommendedTypes: ['feat', 'style'],
  },
  {
    name: 'wheelchair',
    emoji: '♿️',
    code: ':wheelchair:',
    description: '提升可访问性。',
    recommendedTypes: ['feat', 'fix', 'style'],
  },
  {
    name: 'bulb',
    emoji: '💡',
    code: ':bulb:',
    description: '新增或更新源码注释。',
    recommendedTypes: ['docs', 'refactor'],
  },
  {
    name: 'beers',
    emoji: '🍻',
    code: ':beers:',
    description: '轻松性质的杂项提交。',
    recommendedTypes: ['chore'],
  },
  {
    name: 'speech-balloon',
    emoji: '💬',
    code: ':speech_balloon:',
    description: '新增或更新界面文案、字面量与提示文本。',
    recommendedTypes: ['feat', 'docs'],
  },
  {
    name: 'card-file-box',
    emoji: '🗃️',
    code: ':card_file_box:',
    description: '数据库、表结构或数据存储相关改动。',
    recommendedTypes: ['feat', 'refactor'],
  },
  {
    name: 'loud-sound',
    emoji: '🔊',
    code: ':loud_sound:',
    description: '新增或更新日志。',
    recommendedTypes: ['chore'],
  },
  {
    name: 'mute',
    emoji: '🔇',
    code: ':mute:',
    description: '移除或收敛日志。',
    recommendedTypes: ['chore'],
  },
  {
    name: 'busts-in-silhouette',
    emoji: '👥',
    code: ':busts_in_silhouette:',
    description: '新增或更新贡献者信息。',
    recommendedTypes: ['docs', 'chore'],
  },
  {
    name: 'children-crossing',
    emoji: '🚸',
    code: ':children_crossing:',
    description: '优化用户体验和易用性。',
    recommendedTypes: ['feat', 'style'],
  },
  {
    name: 'building-construction',
    emoji: '🏗️',
    code: ':building_construction:',
    description: '调整架构设计或模块边界。',
    recommendedTypes: ['refactor', 'build'],
  },
  {
    name: 'iphone',
    emoji: '📱',
    code: ':iphone:',
    description: '处理响应式布局或移动端适配。',
    recommendedTypes: ['style', 'feat'],
  },
  {
    name: 'clown-face',
    emoji: '🤡',
    code: ':clown_face:',
    description: '新增或更新 mock、stub 与测试替身。',
    recommendedTypes: ['test'],
  },
  {
    name: 'egg',
    emoji: '🥚',
    code: ':egg:',
    description: '新增或更新彩蛋。',
    recommendedTypes: ['feat'],
  },
  {
    name: 'see-no-evil',
    emoji: '🙈',
    code: ':see_no_evil:',
    description: '新增或更新 `.gitignore` 等忽略规则。',
    recommendedTypes: ['chore'],
  },
  {
    name: 'camera-flash',
    emoji: '📸',
    code: ':camera_flash:',
    description: '新增或更新快照测试。',
    recommendedTypes: ['test'],
  },
  {
    name: 'alembic',
    emoji: '⚗️',
    code: ':alembic:',
    description: '进行实验性实现或验证。',
    recommendedTypes: ['test', 'chore'],
  },
  {
    name: 'mag',
    emoji: '🔍️',
    code: ':mag:',
    description: '优化 SEO 或被发现性。',
    recommendedTypes: ['feat', 'perf'],
  },
  {
    name: 'label',
    emoji: '🏷️',
    code: ':label:',
    description: '新增或更新类型定义。',
    recommendedTypes: ['refactor'],
  },
  {
    name: 'seedling',
    emoji: '🌱',
    code: ':seedling:',
    description: '新增或更新 seed 数据。',
    recommendedTypes: ['chore'],
  },
  {
    name: 'triangular-flag-on-post',
    emoji: '🚩',
    code: ':triangular_flag_on_post:',
    description: '新增、调整或移除功能开关。',
    recommendedTypes: ['feat', 'chore'],
  },
  {
    name: 'goal-net',
    emoji: '🥅',
    code: ':goal_net:',
    description: '补充错误兜底、异常捕获或边界处理。',
    recommendedTypes: ['fix', 'test'],
  },
  {
    name: 'dizzy',
    emoji: '💫',
    code: ':dizzy:',
    description: '新增或更新动画、过渡和动效。',
    recommendedTypes: ['style'],
  },
  {
    name: 'wastebasket',
    emoji: '🗑️',
    code: ':wastebasket:',
    description: '标记即将清理的旧代码。',
    recommendedTypes: ['refactor', 'chore'],
  },
  {
    name: 'passport-control',
    emoji: '🛂',
    code: ':passport_control:',
    description: '处理认证、授权、角色与权限逻辑。',
    recommendedTypes: ['feat', 'fix'],
  },
  {
    name: 'adhesive-bandage',
    emoji: '🩹',
    code: ':adhesive_bandage:',
    description: '非关键问题的快速修补。',
    recommendedTypes: ['fix'],
  },
  {
    name: 'monocle-face',
    emoji: '🧐',
    code: ':monocle_face:',
    description: '排查、巡检、数据探索或问题定位。',
    recommendedTypes: ['chore', 'test'],
  },
  {
    name: 'coffin',
    emoji: '⚰️',
    code: ':coffin:',
    description: '移除死代码。',
    recommendedTypes: ['refactor', 'chore'],
  },
  {
    name: 'test-tube',
    emoji: '🧪',
    code: ':test_tube:',
    description: '新增失败用例或红灯测试。',
    recommendedTypes: ['test'],
  },
  {
    name: 'necktie',
    emoji: '👔',
    code: ':necktie:',
    description: '新增或调整业务逻辑。',
    recommendedTypes: ['feat', 'refactor'],
  },
  {
    name: 'stethoscope',
    emoji: '🩺',
    code: ':stethoscope:',
    description: '新增或更新健康检查。',
    recommendedTypes: ['feat', 'chore'],
  },
  {
    name: 'bricks',
    emoji: '🧱',
    code: ':bricks:',
    description: '基础设施、平台层或底座相关改动。',
    recommendedTypes: ['build', 'ci'],
  },
  {
    name: 'technologist',
    emoji: '🧑‍💻',
    code: ':technologist:',
    description: '改善开发体验与工程效率。',
    recommendedTypes: ['chore', 'refactor'],
  },
  {
    name: 'money-with-wings',
    emoji: '💸',
    code: ':money_with_wings:',
    description: '资金、计费、赞助或成本相关基础设施。',
    recommendedTypes: ['chore', 'build'],
  },
  {
    name: 'thread',
    emoji: '🧵',
    code: ':thread:',
    description: '并发、多线程或异步调度相关代码。',
    recommendedTypes: ['perf', 'refactor'],
  },
  {
    name: 'safety-vest',
    emoji: '🦺',
    code: ':safety_vest:',
    description: '新增或加强校验逻辑。',
    recommendedTypes: ['fix', 'test'],
  },
  {
    name: 'airplane',
    emoji: '✈️',
    code: ':airplane:',
    description: '提升离线能力或弱网可用性。',
    recommendedTypes: ['feat', 'perf'],
  },
  {
    name: 't-rex',
    emoji: '🦖',
    code: ':t-rex:',
    description: '补充向后兼容支持。',
    recommendedTypes: ['fix', 'refactor'],
  },
]

export const commitTypeDefinitions: CommitTypeDefinition[] = [
  {
    type: 'feat',
    label: '新增功能',
    description: '面向用户的新功能、新入口或新能力。',
    recommendedEmojiCodes: [
      ':sparkles:',
      ':chart_with_upwards_trend:',
      ':globe_with_meridians:',
      ':speech_balloon:',
      ':bento:',
      ':children_crossing:',
      ':passport_control:',
      ':stethoscope:',
      ':egg:',
      ':airplane:',
    ],
  },
  {
    type: 'fix',
    label: '缺陷修复',
    description: '修复 bug、异常行为或线上问题。',
    recommendedEmojiCodes: [
      ':bug:',
      ':ambulance:',
      ':adhesive_bandage:',
      ':goal_net:',
      ':lock:',
      ':green_heart:',
      ':alien:',
      ':safety_vest:',
      ':passport_control:',
      ':t-rex:',
    ],
  },
  {
    type: 'docs',
    label: '文档更新',
    description: '补充说明文档、注释、README 或帮助文本。',
    recommendedEmojiCodes: [
      ':memo:',
      ':pencil2:',
      ':page_facing_up:',
      ':bulb:',
      ':busts_in_silhouette:',
      ':globe_with_meridians:',
    ],
  },
  {
    type: 'style',
    label: '样式与格式',
    description: '整理格式、视觉微调或不影响逻辑的风格优化。',
    recommendedEmojiCodes: [
      ':art:',
      ':lipstick:',
      ':iphone:',
      ':dizzy:',
      ':rotating_light:',
      ':wheelchair:',
      ':children_crossing:',
      ':bento:',
    ],
  },
  {
    type: 'refactor',
    label: '代码重构',
    description: '重组实现结构，但不改变既有外部行为。',
    recommendedEmojiCodes: [
      ':recycle:',
      ':building_construction:',
      ':truck:',
      ':label:',
      ':thread:',
      ':necktie:',
      ':wastebasket:',
      ':coffin:',
      ':fire:',
      ':t-rex:',
    ],
  },
  {
    type: 'perf',
    label: '性能优化',
    description: '减少耗时、内存或提升关键路径效率。',
    recommendedEmojiCodes: [
      ':zap:',
      ':thread:',
      ':chart_with_upwards_trend:',
      ':mag:',
      ':airplane:',
    ],
  },
  {
    type: 'test',
    label: '测试补充',
    description: '新增、修正或重构测试用例与验证逻辑。',
    recommendedEmojiCodes: [
      ':white_check_mark:',
      ':test_tube:',
      ':clown_face:',
      ':camera_flash:',
      ':goal_net:',
      ':safety_vest:',
      ':alembic:',
    ],
  },
  {
    type: 'build',
    label: '构建系统',
    description: '调整打包配置、依赖版本或构建相关脚本。',
    recommendedEmojiCodes: [
      ':package:',
      ':construction_worker:',
      ':arrow_up:',
      ':arrow_down:',
      ':pushpin:',
      ':heavy_plus_sign:',
      ':heavy_minus_sign:',
      ':wrench:',
      ':hammer:',
      ':bricks:',
      ':rocket:',
    ],
  },
  {
    type: 'ci',
    label: '持续集成',
    description: '调整 CI/CD 流程、自动化检查或发布流水线。',
    recommendedEmojiCodes: [
      ':construction_worker:',
      ':green_heart:',
      ':rocket:',
      ':bookmark:',
      ':wrench:',
      ':package:',
      ':bricks:',
      ':closed_lock_with_key:',
    ],
  },
  {
    type: 'chore',
    label: '杂项维护',
    description: '脚手架、配置、非业务逻辑的日常维护工作。',
    recommendedEmojiCodes: [
      ':construction:',
      ':wrench:',
      ':hammer:',
      ':tada:',
      ':package:',
      ':bookmark:',
      ':see_no_evil:',
      ':seedling:',
      ':twisted_rightwards_arrows:',
      ':technologist:',
    ],
  },
  {
    type: 'revert',
    label: '回滚提交',
    description: '撤销历史改动，恢复到更稳定的状态。',
    recommendedEmojiCodes: [':rewind:'],
  },
]

const DEFAULT_EMOJI_CODE = ':sparkles:'
const DEFAULT_TYPE: CommitTypeKey = 'feat'
const SCOPE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function getGitEmojiDefinition(
  emojiCode: string,
): GitEmojiDefinition | undefined {
  return gitEmojiDefinitions.find((item) => item.code === emojiCode)
}

function getCommitTypeDefinition(
  type: string,
): CommitTypeDefinition | undefined {
  return commitTypeDefinitions.find((item) => item.type === type)
}

function getRecommendedEmojiCodes(type: string): string[] {
  return getCommitTypeDefinition(type)?.recommendedEmojiCodes ?? []
}

function escapeCommitMessage(message: string): string {
  return message.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

function buildEmojiSearchSource(item: GitEmojiDefinition): string[] {
  return [
    item.name,
    item.code,
    item.description,
    item.emoji,
    item.recommendedTypes.join(' '),
  ]
}

export function getDefaultCommitDraftState(): CommitDraftState {
  return {
    style: 'code',
    emojiCode: DEFAULT_EMOJI_CODE,
    type: DEFAULT_TYPE,
    scope: '',
    description: '',
  }
}

export function getCompatibleCommitTypes(
  emojiCode: string,
): CommitTypeDefinition[] {
  const emoji =
    getGitEmojiDefinition(emojiCode) ??
    getGitEmojiDefinition(DEFAULT_EMOJI_CODE)

  if (!emoji) {
    return []
  }

  return emoji.recommendedTypes
    .map((type) => getCommitTypeDefinition(type))
    .filter((item): item is CommitTypeDefinition => Boolean(item))
}

export function getCompatibleGitEmojis(type: string): GitEmojiDefinition[] {
  const typeDefinition =
    getCommitTypeDefinition(type) ?? getCommitTypeDefinition(DEFAULT_TYPE)

  if (!typeDefinition) {
    return []
  }

  const compatible = gitEmojiDefinitions.filter((item) =>
    item.recommendedTypes.includes(typeDefinition.type),
  )
  const prioritized = typeDefinition.recommendedEmojiCodes
    .map((code) => compatible.find((item) => item.code === code))
    .filter((item): item is GitEmojiDefinition => Boolean(item))

  const remainder = compatible.filter(
    (item) =>
      !prioritized.some(
        (prioritizedItem) => prioritizedItem.code === item.code,
      ),
  )

  return [...prioritized, ...remainder]
}

export function matchesGitEmojiSearch(
  emoji: GitEmojiDefinition,
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchQuery(query)

  if (!normalizedQuery) {
    return true
  }

  return buildEmojiSearchSource(emoji).some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  )
}

export function buildGitEmojiSections(
  type: string,
  query = '',
): GitEmojiSection[] {
  const typeDefinition =
    getCommitTypeDefinition(type) ?? getCommitTypeDefinition(DEFAULT_TYPE)

  if (!typeDefinition) {
    return []
  }

  const recommendedEmojiCodes = getRecommendedEmojiCodes(typeDefinition.type)
  const filteredItems = gitEmojiDefinitions.filter((item) =>
    matchesGitEmojiSearch(item, query),
  )
  const recommendedItems: GitEmojiDefinition[] = []
  const compatibleItems: GitEmojiDefinition[] = []
  const extendedItems: GitEmojiDefinition[] = []

  for (const item of filteredItems) {
    if (recommendedEmojiCodes.includes(item.code)) {
      recommendedItems.push(item)
      continue
    }

    if (item.recommendedTypes.includes(typeDefinition.type)) {
      compatibleItems.push(item)
      continue
    }

    extendedItems.push(item)
  }

  const sections: GitEmojiSection[] = [
    {
      id: 'recommended',
      title: '推荐优先',
      description: `当前 type 最常用的 ${typeDefinition.label} emoji。`,
      items: recommendedItems,
    },
    {
      id: 'compatible',
      title: '兼容可选',
      description: '语义仍然兼容当前 type，但不是默认首推项。',
      items: compatibleItems,
    },
    {
      id: 'extended',
      title: '更多 Git emoji',
      description: '全量目录中的其他语义项，选中后会自动修正为有效 type。',
      items: extendedItems,
    },
  ]

  return sections.filter((section) => section.items.length > 0)
}

export function applyEmojiSelection(
  draft: CommitDraftState,
  emojiCode: string,
): CommitDraftState {
  const fallback = getDefaultCommitDraftState()
  const nextEmoji =
    getGitEmojiDefinition(emojiCode) ??
    getGitEmojiDefinition(fallback.emojiCode)

  if (!nextEmoji) {
    return fallback
  }

  const availableTypes = getCompatibleCommitTypes(nextEmoji.code)
  const nextType = availableTypes.some((item) => item.type === draft.type)
    ? draft.type
    : (availableTypes[0]?.type ?? fallback.type)

  return {
    ...draft,
    emojiCode: nextEmoji.code,
    type: nextType,
  }
}

export function applyTypeSelection(
  draft: CommitDraftState,
  type: string,
): CommitDraftState {
  const fallback = getDefaultCommitDraftState()
  const nextType =
    getCommitTypeDefinition(type) ?? getCommitTypeDefinition(fallback.type)

  if (!nextType) {
    return fallback
  }

  const availableEmojis = getCompatibleGitEmojis(nextType.type)
  const nextEmojiCode = availableEmojis[0]?.code ?? fallback.emojiCode

  return {
    ...draft,
    emojiCode: nextEmojiCode,
    type: nextType.type,
  }
}

function resolveCommitContext(draft: CommitDraftState) {
  const normalized = applyEmojiSelection(draft, draft.emojiCode)
  const emoji =
    getGitEmojiDefinition(normalized.emojiCode) ??
    getGitEmojiDefinition(DEFAULT_EMOJI_CODE)
  const typeDefinition =
    getCommitTypeDefinition(normalized.type) ??
    getCommitTypeDefinition(DEFAULT_TYPE)
  const scope = normalized.scope.trim()
  const description = normalized.description.trim()

  return {
    description,
    emoji,
    normalized,
    scope,
    typeDefinition,
  }
}

function buildValidationHints(scope: string, description: string): string[] {
  const validationHints: string[] = []

  if (!description) {
    validationHints.push('先输入中文描述，再生成完整提交文案和提交命令。')
  }

  if (scope && !SCOPE_PATTERN.test(scope)) {
    validationHints.push(
      'scope 建议使用短英文词或 kebab-case，例如 home-page。',
    )
  }

  return validationHints
}

function buildEmptySuggestion(
  emoji: GitEmojiDefinition | undefined,
  validationHints: string[],
): CommitSuggestionResult {
  return {
    message: '',
    command: '',
    emoji: emoji?.emoji ?? '',
    code: emoji?.code ?? '',
    isReady: false,
    validationHints,
  }
}

function buildCommitMessage(
  style: CommitMessageStyle,
  emoji: GitEmojiDefinition,
  typeDefinition: CommitTypeDefinition,
  scope: string,
  description: string,
) {
  const prefix = style === 'emoji' ? emoji.emoji : emoji.code
  const scopeSuffix = scope ? `(${scope})` : ''

  return `${prefix} ${typeDefinition.type}${scopeSuffix}: ${description}`
}

export function buildCommitSuggestion(
  draft: CommitDraftState,
): CommitSuggestionResult {
  const { description, emoji, normalized, scope, typeDefinition } =
    resolveCommitContext(draft)
  const validationHints = buildValidationHints(scope, description)

  if (!emoji || !typeDefinition || !description) {
    return buildEmptySuggestion(emoji, validationHints)
  }

  const message = buildCommitMessage(
    normalized.style,
    emoji,
    typeDefinition,
    scope,
    description,
  )

  return {
    message,
    command: `git commit -m "${escapeCommitMessage(message)}"`,
    emoji: emoji.emoji,
    code: emoji.code,
    isReady: true,
    validationHints,
  }
}

export function getCopyTargetValue(
  suggestion: CommitSuggestionResult,
  target: CommitCopyTarget,
): string {
  switch (target) {
    case 'message':
      return suggestion.message
    case 'command':
      return suggestion.command
    case 'code':
      return suggestion.code
    case 'emoji':
      return suggestion.emoji
    default:
      return ''
  }
}
