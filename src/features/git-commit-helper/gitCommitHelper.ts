export type CommitMessageStyle = 'code' | 'emoji'

export type CommitCopyTarget = 'message' | 'command' | 'code' | 'emoji'

export interface GitEmojiDefinition {
  name: string
  emoji: string
  code: string
  description: string
  recommendedTypes: string[]
}

export interface CommitTypeDefinition {
  type: string
  label: string
  description: string
  recommendedEmojiCodes: string[]
}

export interface CommitDraftState {
  style: CommitMessageStyle
  emojiCode: string
  type: string
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

export const gitEmojiDefinitions: GitEmojiDefinition[] = [
  {
    name: 'sparkles',
    emoji: '✨',
    code: ':sparkles:',
    description: '新增功能或可感知的新能力',
    recommendedTypes: ['feat'],
  },
  {
    name: 'bug',
    emoji: '🐛',
    code: ':bug:',
    description: '修复缺陷或异常行为',
    recommendedTypes: ['fix'],
  },
  {
    name: 'ambulance',
    emoji: '🚑️',
    code: ':ambulance:',
    description: '紧急修复线上问题',
    recommendedTypes: ['fix'],
  },
  {
    name: 'memo',
    emoji: '📝',
    code: ':memo:',
    description: '更新文档、注释或说明文本',
    recommendedTypes: ['docs'],
  },
  {
    name: 'art',
    emoji: '🎨',
    code: ':art:',
    description: '优化代码风格、命名或界面细节',
    recommendedTypes: ['style'],
  },
  {
    name: 'recycle',
    emoji: '♻️',
    code: ':recycle:',
    description: '重构实现但不改变外部行为',
    recommendedTypes: ['refactor'],
  },
  {
    name: 'zap',
    emoji: '⚡️',
    code: ':zap:',
    description: '性能优化或资源效率提升',
    recommendedTypes: ['perf'],
  },
  {
    name: 'white-check-mark',
    emoji: '✅',
    code: ':white_check_mark:',
    description: '新增、修正或补强测试',
    recommendedTypes: ['test'],
  },
  {
    name: 'package',
    emoji: '📦️',
    code: ':package:',
    description: '依赖、打包产物或构建配置调整',
    recommendedTypes: ['build', 'chore'],
  },
  {
    name: 'construction-worker',
    emoji: '👷',
    code: ':construction_worker:',
    description: '持续集成、流水线或构建系统调整',
    recommendedTypes: ['ci', 'build'],
  },
  {
    name: 'construction',
    emoji: '🚧',
    code: ':construction:',
    description: '脚手架整理、占位实现或维护性杂项',
    recommendedTypes: ['chore'],
  },
  {
    name: 'rewind',
    emoji: '⏪️',
    code: ':rewind:',
    description: '回滚历史提交或撤销变更',
    recommendedTypes: ['revert'],
  },
]

export const commitTypeDefinitions: CommitTypeDefinition[] = [
  {
    type: 'feat',
    label: '新增功能',
    description: '面向用户的新功能、新入口或新能力。',
    recommendedEmojiCodes: [':sparkles:'],
  },
  {
    type: 'fix',
    label: '缺陷修复',
    description: '修复 bug、异常行为或线上问题。',
    recommendedEmojiCodes: [':bug:', ':ambulance:'],
  },
  {
    type: 'docs',
    label: '文档更新',
    description: '补充说明文档、注释、README 或帮助文本。',
    recommendedEmojiCodes: [':memo:'],
  },
  {
    type: 'style',
    label: '样式与格式',
    description: '整理格式、视觉微调或不影响逻辑的风格优化。',
    recommendedEmojiCodes: [':art:'],
  },
  {
    type: 'refactor',
    label: '代码重构',
    description: '重组实现结构，但不改变既有外部行为。',
    recommendedEmojiCodes: [':recycle:'],
  },
  {
    type: 'perf',
    label: '性能优化',
    description: '减少耗时、内存或提升关键路径效率。',
    recommendedEmojiCodes: [':zap:'],
  },
  {
    type: 'test',
    label: '测试补充',
    description: '新增、修正或重构测试用例与验证逻辑。',
    recommendedEmojiCodes: [':white_check_mark:'],
  },
  {
    type: 'build',
    label: '构建系统',
    description: '调整打包配置、依赖版本或构建相关脚本。',
    recommendedEmojiCodes: [':package:', ':construction_worker:'],
  },
  {
    type: 'ci',
    label: '持续集成',
    description: '调整 CI/CD 流程、自动化检查或发布流水线。',
    recommendedEmojiCodes: [':construction_worker:'],
  },
  {
    type: 'chore',
    label: '杂项维护',
    description: '脚手架、配置、非业务逻辑的日常维护工作。',
    recommendedEmojiCodes: [':construction:', ':package:'],
  },
  {
    type: 'revert',
    label: '回滚提交',
    description: '撤销历史改动，恢复到更稳定的状态。',
    recommendedEmojiCodes: [':rewind:'],
  },
]

const DEFAULT_EMOJI_CODE = ':sparkles:'
const DEFAULT_TYPE = 'feat'
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

function escapeCommitMessage(message: string): string {
  return message.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
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

export function getPrioritizedGitEmojis(type: string): GitEmojiDefinition[] {
  const compatible = getCompatibleGitEmojis(type)
  const remainder = gitEmojiDefinitions.filter(
    (item) =>
      !compatible.some((compatibleItem) => compatibleItem.code === item.code),
  )

  return [...compatible, ...remainder]
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
