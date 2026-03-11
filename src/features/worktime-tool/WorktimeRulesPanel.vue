<script setup lang="ts">
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
</script>

<template>
  <details class="surface-panel worktime-rules" open>
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

            <select
              :value="segment.type"
              class="glass-input"
              @change="
                emit(
                  'updateSegment',
                  segment.id,
                  'type',
                  ($event.target as HTMLSelectElement).value,
                )
              "
            >
              <option value="paid">计薪</option>
              <option value="unpaid">不计薪</option>
            </select>

            <select
              :value="segment.start"
              class="glass-input"
              @change="
                emit(
                  'updateSegment',
                  segment.id,
                  'start',
                  ($event.target as HTMLSelectElement).value,
                )
              "
            >
              <option
                v-for="time in props.timeOptions"
                :key="time"
                :value="time"
              >
                {{ time }}
              </option>
            </select>

            <select
              :value="segment.end"
              class="glass-input"
              @change="
                emit(
                  'updateSegment',
                  segment.id,
                  'end',
                  ($event.target as HTMLSelectElement).value,
                )
              "
            >
              <option
                v-for="time in props.timeOptions"
                :key="time"
                :value="time"
              >
                {{ time }}
              </option>
            </select>

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
