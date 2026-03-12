import { computed, onBeforeUnmount, reactive, ref } from 'vue'

import {
  applyEmojiSelection,
  applyTypeSelection,
  buildCommitSuggestion,
  commitTypeDefinitions,
  getCompatibleCommitTypes,
  getCopyTargetValue,
  getDefaultCommitDraftState,
  getPrioritizedGitEmojis,
  type CommitCopyTarget,
  type CommitDraftState,
  type CommitMessageStyle,
} from '@/features/git-commit-helper/gitCommitHelper'

type CopyFeedbackMap = Record<CommitCopyTarget, string>

const COPY_SUCCESS_LABELS: Record<CommitCopyTarget, string> = {
  message: '已复制建议文案',
  command: '已复制提交命令',
  code: '已复制 emoji code',
  emoji: '已复制 emoji 表情',
}

const COPY_EMPTY_LABELS: Record<CommitCopyTarget, string> = {
  message: '先填写 description，再复制建议文案',
  command: '先填写 description，再复制提交命令',
  code: '当前没有可复制的 emoji code',
  emoji: '当前没有可复制的 emoji 表情',
}

function createEmptyCopyFeedback(): CopyFeedbackMap {
  return {
    message: '',
    command: '',
    code: '',
    emoji: '',
  }
}

export function useGitCommitHelper() {
  const draft = reactive<CommitDraftState>(getDefaultCommitDraftState())
  const selectionDriver = ref<'emoji' | 'type'>('type')
  const copyFeedback = reactive<CopyFeedbackMap>(createEmptyCopyFeedback())
  const isCopying = reactive<Record<CommitCopyTarget, boolean>>({
    message: false,
    command: false,
    code: false,
    emoji: false,
  })
  const timers = new Map<CommitCopyTarget, number>()
  const helperNotice = ref('推荐默认使用 :emoji: code 风格，符合仓库提交规范。')

  const selectedEmojiCode = computed(() => draft.emojiCode)
  const selectedType = computed(() => draft.type)
  const availableTypes = computed(() =>
    selectionDriver.value === 'emoji'
      ? getCompatibleCommitTypes(draft.emojiCode)
      : commitTypeDefinitions,
  )
  const availableEmojis = computed(() => getPrioritizedGitEmojis(draft.type))
  const suggestion = computed(() => buildCommitSuggestion(draft))

  function applyDraft(nextDraft: CommitDraftState) {
    draft.style = nextDraft.style
    draft.emojiCode = nextDraft.emojiCode
    draft.type = nextDraft.type
    draft.scope = nextDraft.scope
    draft.description = nextDraft.description
  }

  function setCopyFeedback(target: CommitCopyTarget, value: string) {
    copyFeedback[target] = value

    const currentTimer = timers.get(target)

    if (currentTimer) {
      window.clearTimeout(currentTimer)
    }

    if (!value) {
      timers.delete(target)
      return
    }

    const timer = window.setTimeout(() => {
      copyFeedback[target] = ''
      timers.delete(target)
    }, 1800)

    timers.set(target, timer)
  }

  function setStyle(style: CommitMessageStyle) {
    draft.style = style
    helperNotice.value =
      style === 'code'
        ? '推荐默认使用 :emoji: code 风格，符合仓库提交规范。'
        : '当前使用 emoji 表情风格，适合在聊天或可视化场景中快速预览。'
  }

  function setEmoji(emojiCode: string) {
    selectionDriver.value = 'emoji'
    applyDraft(applyEmojiSelection(draft, emojiCode))
  }

  function setType(type: string) {
    selectionDriver.value = 'type'
    applyDraft(applyTypeSelection(draft, type))
  }

  function setScope(scope: string) {
    draft.scope = scope
  }

  function setDescription(description: string) {
    draft.description = description
  }

  async function copyTarget(target: CommitCopyTarget) {
    const value = getCopyTargetValue(suggestion.value, target)

    if (!value) {
      setCopyFeedback(target, COPY_EMPTY_LABELS[target])
      return
    }

    isCopying[target] = true

    try {
      await navigator.clipboard.writeText(value)
      setCopyFeedback(target, COPY_SUCCESS_LABELS[target])
    } catch {
      setCopyFeedback(target, '当前环境不支持自动复制，请手动复制。')
    } finally {
      isCopying[target] = false
    }
  }

  onBeforeUnmount(() => {
    for (const timer of timers.values()) {
      window.clearTimeout(timer)
    }

    timers.clear()
  })

  return {
    availableEmojis,
    availableTypes,
    copyFeedback,
    copyTarget,
    draft,
    helperNotice,
    isCopying,
    selectedEmojiCode,
    selectedType,
    setDescription,
    setEmoji,
    setScope,
    setStyle,
    setType,
    suggestion,
  }
}
