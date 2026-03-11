<script setup lang="ts">
import type { WorktimeDaySummary } from '@/features/worktime-tool/worktime'

const props = defineProps<{
  isOpen: boolean
  dateLabel: string
  startTime: string
  endTime: string
  summary: WorktimeDaySummary
  errorMessage: string
  canCopyPrevious: boolean
}>()

const emit = defineEmits<{
  close: []
  copyPrevious: []
  delete: []
  save: []
  saveNext: []
  savePrevious: []
  'update:endTime': [value: string]
  'update:startTime': [value: string]
}>()

function onOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.isOpen"
      class="workday-dialog"
      role="dialog"
      aria-modal="true"
      @click="onOverlayClick"
    >
      <div class="workday-dialog__panel">
        <div class="workday-dialog__header">
          <div>
            <span class="workday-dialog__eyebrow">Day Entry</span>
            <h2>{{ props.dateLabel }}</h2>
          </div>
          <button
            aria-label="关闭弹窗"
            class="workday-dialog__close"
            type="button"
            @click="emit('close')"
          >
            ×
          </button>
        </div>

        <div class="workday-dialog__fields">
          <label class="field-group">
            <span class="field-label">上班时间</span>
            <input
              :value="props.startTime"
              class="glass-input"
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
              :value="props.endTime"
              class="glass-input"
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
            <span>当日工时</span>
            <strong>{{ props.summary.totalLabel }}</strong>
          </div>
          <div class="workday-dialog__summary-item">
            <span>相对 8 小时</span>
            <strong>{{ props.summary.balanceLabel }}</strong>
          </div>
          <div class="workday-dialog__summary-item">
            <span>规则反馈</span>
            <strong>{{ props.summary.message }}</strong>
          </div>
        </div>

        <p v-if="props.errorMessage" class="workday-dialog__error">
          {{ props.errorMessage }}
        </p>

        <div class="workday-dialog__actions">
          <button
            v-if="props.canCopyPrevious"
            class="button button--ghost"
            type="button"
            @click="emit('copyPrevious')"
          >
            复制前一天
          </button>
          <button
            class="button button--ghost"
            type="button"
            @click="emit('delete')"
          >
            删除记录
          </button>
          <button
            class="button button--ghost"
            type="button"
            @click="emit('savePrevious')"
          >
            保存并到上一天
          </button>
          <button
            class="button button--ghost"
            type="button"
            @click="emit('saveNext')"
          >
            保存并到下一天
          </button>
          <button
            class="button button--primary"
            type="button"
            @click="emit('save')"
          >
            保存
          </button>
        </div>

        <p class="workday-dialog__hint">
          快捷键：Esc 关闭，Ctrl/Cmd + S 保存，Alt + ← / → 保存并切换日期。
        </p>
      </div>
    </div>
  </Teleport>
</template>
