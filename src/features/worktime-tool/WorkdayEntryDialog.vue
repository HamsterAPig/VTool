<script setup lang="ts">
import { computed, ref } from 'vue'

import ShortcutScope from '@/components/ShortcutScope.vue'
import type { ShortcutBinding } from '@/components/shortcutScope'
import type {
  ResolvedWorktimeRule,
  WorktimeDaySummary,
} from '@/features/worktime-tool/worktime'

const props = defineProps<{
  isOpen: boolean
  dateLabel: string
  startTime: string
  endTime: string
  summary: WorktimeDaySummary
  appliedRule: ResolvedWorktimeRule
  errorMessage: string
  canCopyPrevious: boolean
}>()

const emit = defineEmits<{
  requestClose: []
  copyPrevious: []
  delete: []
  save: []
  saveNext: []
  savePrevious: []
  'update:endTime': [value: string]
  'update:startTime': [value: string]
}>()

const panelRef = ref<HTMLElement | null>(null)
const startInputRef = ref<HTMLInputElement | null>(null)
const endInputRef = ref<HTMLInputElement | null>(null)

const timeInputs = computed(() =>
  [startInputRef.value, endInputRef.value].filter(
    (input): input is HTMLInputElement => Boolean(input),
  ),
)

const dialogBindings = computed<ShortcutBinding[]>(() => [
  {
    allowInInput: true,
    handler: () => emit('requestClose'),
    keys: 'esc',
  },
  {
    allowInInput: true,
    handler: () => emit('save'),
    keys: ['ctrl+s', 'command+s'],
  },
  {
    allowInInput: true,
    handler: () => emit('savePrevious'),
    keys: 'left',
  },
  {
    allowInInput: true,
    handler: () => emit('saveNext'),
    keys: 'right',
  },
  {
    allowInInput: true,
    handler: (event) => focusTimeInput(1, event.target),
    keys: 'tab',
  },
  {
    allowInInput: true,
    handler: (event) => focusTimeInput(-1, event.target),
    keys: 'shift+tab',
  },
])

function focusTimeInput(direction: 1 | -1, sourceTarget?: EventTarget | null) {
  const inputs = timeInputs.value

  if (inputs.length === 0) {
    return
  }

  const currentTarget =
    sourceTarget instanceof HTMLElement ? sourceTarget : document.activeElement
  const activeIndex = inputs.findIndex((input) => input === currentTarget)

  if (activeIndex < 0) {
    ;(direction === 1 ? inputs[0] : inputs[inputs.length - 1])?.focus()
    return
  }

  const nextIndex = (activeIndex + direction + inputs.length) % inputs.length

  inputs[nextIndex]?.focus()
}

function getInitialFocus() {
  return startInputRef.value
}

function getFallbackFocus() {
  return panelRef.value
}

function onOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('requestClose')
  }
}
</script>

<template>
  <Teleport to="body">
    <ShortcutScope
      v-if="props.isOpen"
      as="div"
      :active="props.isOpen"
      :bindings="dialogBindings"
      :fallback-focus="getFallbackFocus"
      :initial-focus="getInitialFocus"
      :trap-focus="props.isOpen"
      class="workday-dialog"
      role="dialog"
      aria-modal="true"
      @click="onOverlayClick"
    >
      <div ref="panelRef" class="workday-dialog__panel" tabindex="-1">
        <div class="workday-dialog__header">
          <div>
            <span class="workday-dialog__eyebrow">Day Entry</span>
            <h2>{{ props.dateLabel }}</h2>
            <p class="workday-dialog__rule">
              {{ props.appliedRule.template.name }}
              <span>
                {{
                  props.appliedRule.source === 'override'
                    ? '日期例外规则'
                    : '星期模板'
                }}
              </span>
            </p>
          </div>
          <button
            aria-label="关闭弹窗"
            class="workday-dialog__close"
            tabindex="-1"
            type="button"
            @click="emit('requestClose')"
          >
            ×
          </button>
        </div>

        <div class="workday-dialog__fields">
          <label class="field-group">
            <span class="field-label">上班时间</span>
            <input
              ref="startInputRef"
              :value="props.startTime"
              class="glass-input workday-dialog__time-input"
              type="time"
              @input="
                emit(
                  'update:startTime',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </label>

          <label class="field-group">
            <span class="field-label">下班时间</span>
            <input
              ref="endInputRef"
              :value="props.endTime"
              class="glass-input workday-dialog__time-input"
              type="time"
              @input="
                emit(
                  'update:endTime',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </label>
        </div>

        <div class="workday-dialog__summary">
          <div class="workday-dialog__summary-item">
            <span>有效工时</span>
            <strong>{{ props.summary.totalLabel }}</strong>
          </div>
          <div class="workday-dialog__summary-item">
            <span>目标分钟</span>
            <strong>{{ props.summary.targetLabel }}</strong>
          </div>
          <div class="workday-dialog__summary-item">
            <span>差值</span>
            <strong>{{ props.summary.balanceLabel }}</strong>
          </div>
        </div>

        <p v-if="props.errorMessage" class="workday-dialog__error">
          {{ props.errorMessage }}
        </p>

        <div class="workday-dialog__actions">
          <button
            v-if="props.canCopyPrevious"
            class="button button--ghost"
            tabindex="-1"
            type="button"
            @click="emit('copyPrevious')"
          >
            复制前一天
          </button>
          <button
            class="button button--ghost"
            tabindex="-1"
            type="button"
            @click="emit('delete')"
          >
            删除记录
          </button>
          <button
            class="button button--ghost"
            tabindex="-1"
            type="button"
            @click="emit('savePrevious')"
          >
            保存并到上一天
          </button>
          <button
            class="button button--ghost"
            tabindex="-1"
            type="button"
            @click="emit('saveNext')"
          >
            保存并到下一天
          </button>
          <button
            class="button button--primary"
            tabindex="-1"
            type="button"
            @click="emit('save')"
          >
            保存
          </button>
        </div>

        <p class="workday-dialog__hint">
          Esc 关闭并自动保存，Ctrl/Cmd + S 保存，← / → 保存并切换日期，Tab
          仅在时间输入框间切换。
        </p>
      </div>
    </ShortcutScope>
  </Teleport>
</template>
