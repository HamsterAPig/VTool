<script setup lang="ts">
import { computed } from 'vue'

import BaseSelect from '@/components/BaseSelect.vue'
import type {
  WeekdayKey,
  WorktimeDayTemplate,
} from '@/features/worktime-tool/worktime'

const props = defineProps<{
  activeOverrideDate: string
  activeRuleLabel: string
  activeRuleSource: 'weekly' | 'override'
  activeWeekday: WeekdayKey
  defaultTargetMinutes: number
  overrideDateInput: string
  overrideDates: string[]
  ruleDraft: WorktimeDayTemplate
  ruleEditorError: string
  ruleEditorStatus: string
  timeOptions: string[]
  weekdayItems: Array<{ key: WeekdayKey; label: string }>
}>()

const emit = defineEmits<{
  addOverride: []
  addSegment: [type: 'paid' | 'unpaid']
  removeOverride: []
  removeSegment: [segmentId: string]
  saveRule: []
  selectOverride: [date: string]
  selectWeekday: [weekday: WeekdayKey]
  updateDefaultTargetMinutes: [value: number]
  updateOverrideDateInput: [value: string]
  updateRuleName: [value: string]
  updateRuleTargetMinutes: [value: number]
  updateSegment: [
    segmentId: string,
    field: 'label' | 'start' | 'end' | 'type',
    value: string,
  ]
}>()

const segmentTypeOptions = [
  {
    description: '纳入目标工时',
    label: '计薪',
    value: 'paid',
  },
  {
    description: '午休等不计薪时段',
    label: '不计薪',
    value: 'unpaid',
  },
] as const

const timeSelectOptions = computed(() =>
  props.timeOptions.map((time) => ({
    label: time,
    value: time,
  })),
)

function updateSegmentSelect(
  segmentId: string,
  field: 'label' | 'start' | 'end' | 'type',
  value: string | number,
) {
  emit('updateSegment', segmentId, field, String(value))
}
</script>

<template>
  <details class="surface-panel worktime-rules">
    <summary class="worktime-rules__summary">
      <div>
        <span class="worktime-rules__eyebrow">Rule Engine</span>
        <h2>规则面板</h2>
      </div>
      <span class="worktime-rules__current">{{ props.activeRuleLabel }}</span>
    </summary>

    <div class="worktime-rules__body">
      <div class="worktime-rules__top">
        <label class="worktime-rules__top-field">
          <span>默认目标分钟</span>
          <input
            :value="props.defaultTargetMinutes"
            class="glass-input"
            min="0"
            step="1"
            type="number"
            @change="
              emit(
                'updateDefaultTargetMinutes',
                Number(($event.target as HTMLInputElement).value),
              )
            "
          />
        </label>

        <div class="worktime-rules__feedback">
          <p>{{ props.ruleEditorStatus }}</p>
          <p v-if="props.ruleEditorError" class="worktime-rules__error">
            {{ props.ruleEditorError }}
          </p>
        </div>
      </div>

      <div class="worktime-rules__scopes">
        <div class="worktime-rules__scope-group">
          <span class="worktime-rules__scope-title">星期模板</span>
          <div class="worktime-rules__chips">
            <button
              v-for="item in props.weekdayItems"
              :key="item.key"
              class="worktime-rules__chip"
              :class="{
                'worktime-rules__chip--active':
                  props.activeRuleSource === 'weekly' &&
                  props.activeWeekday === item.key,
              }"
              type="button"
              @click="emit('selectWeekday', item.key)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="worktime-rules__scope-group">
          <span class="worktime-rules__scope-title">日期例外</span>
          <div class="worktime-rules__override-create">
            <input
              :value="props.overrideDateInput"
              class="glass-input"
              type="date"
              @input="
                emit(
                  'updateOverrideDateInput',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
            <button
              class="button button--ghost"
              type="button"
              @click="emit('addOverride')"
            >
              新建例外
            </button>
            <button
              v-if="props.activeOverrideDate"
              class="button button--ghost"
              type="button"
              @click="emit('removeOverride')"
            >
              删除当前例外
            </button>
          </div>
          <div class="worktime-rules__chips">
            <button
              v-for="date in props.overrideDates"
              :key="date"
              class="worktime-rules__chip"
              :class="{
                'worktime-rules__chip--active':
                  props.activeRuleSource === 'override' &&
                  props.activeOverrideDate === date,
              }"
              type="button"
              @click="emit('selectOverride', date)"
            >
              {{ date }}
            </button>
          </div>
        </div>
      </div>

      <div class="worktime-rules__editor">
        <div class="worktime-rules__editor-head">
          <label class="worktime-rules__editor-field">
            <span>规则名称</span>
            <input
              :value="props.ruleDraft.name"
              class="glass-input"
              type="text"
              @input="
                emit(
                  'updateRuleName',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </label>
          <label class="worktime-rules__editor-field">
            <span>目标分钟</span>
            <input
              :value="
                props.ruleDraft.targetMinutes ?? props.defaultTargetMinutes
              "
              class="glass-input"
              min="0"
              step="1"
              type="number"
              @input="
                emit(
                  'updateRuleTargetMinutes',
                  Number(($event.target as HTMLInputElement).value),
                )
              "
            />
          </label>
        </div>

        <div class="worktime-rules__segment-list">
          <div
            v-for="segment in props.ruleDraft.segments"
            :key="segment.id"
            class="worktime-rules__segment-row"
          >
            <input
              :value="segment.label"
              class="glass-input"
              placeholder="时间段名称"
              type="text"
              @input="
                emit(
                  'updateSegment',
                  segment.id,
                  'label',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />

            <BaseSelect
              class="glass-input"
              label="时间段类型"
              :model-value="segment.type"
              :options="segmentTypeOptions"
              @update:model-value="
                updateSegmentSelect(segment.id, 'type', $event)
              "
            />

            <BaseSelect
              class="glass-input"
              label="开始时间"
              :model-value="segment.start"
              :options="timeSelectOptions"
              @update:model-value="
                updateSegmentSelect(segment.id, 'start', $event)
              "
            />

            <BaseSelect
              class="glass-input"
              label="结束时间"
              :model-value="segment.end"
              :options="timeSelectOptions"
              @update:model-value="
                updateSegmentSelect(segment.id, 'end', $event)
              "
            />

            <button
              class="button button--ghost"
              type="button"
              @click="emit('removeSegment', segment.id)"
            >
              删除
            </button>
          </div>
        </div>

        <div class="worktime-rules__editor-actions">
          <button
            class="button button--ghost"
            type="button"
            @click="emit('addSegment', 'paid')"
          >
            新增计薪段
          </button>
          <button
            class="button button--ghost"
            type="button"
            @click="emit('addSegment', 'unpaid')"
          >
            新增不计薪段
          </button>
          <button
            class="button button--primary"
            type="button"
            @click="emit('saveRule')"
          >
            保存当前规则
          </button>
        </div>
      </div>
    </div>
  </details>
</template>
