<script setup lang="ts">
import { computed } from 'vue'

import BaseSelect from '@/components/BaseSelect.vue'
import BrowserDataPanel from '@/components/BrowserDataPanel.vue'
import ShortcutLegend from '@/components/ShortcutLegend.vue'
import ShortcutScope from '@/components/ShortcutScope.vue'
import type { ShortcutBinding } from '@/components/shortcutScope'
import WorkdayEntryDialog from '@/features/worktime-tool/WorkdayEntryDialog.vue'
import WorktimeRulesPanel from '@/features/worktime-tool/WorktimeRulesPanel.vue'
import { useWorktimeCalendar } from '@/features/worktime-tool/useWorktimeCalendar'

const {
  activeOverrideDate,
  activeRuleLabel,
  activeRuleSource,
  activeWeekday,
  addDraftSegment,
  addOverrideRule,
  calendarDays,
  canCopyPrevious,
  copyPreviousDay,
  defaultTargetMinutes,
  deleteEditorRecord,
  draftEndTime,
  draftStartTime,
  editorError,
  editorResolvedRule,
  editorSummary,
  exportRecords,
  importFromClipboard,
  importFromFile,
  isDialogOpen,
  jumpToToday,
  monthSummary,
  moveSelection,
  moveMonth,
  openEditor,
  overrideDateInput,
  overrideDates,
  removeActiveOverrideRule,
  requestCloseEditor,
  removeDraftSegment,
  ruleDraft,
  ruleEditorError,
  ruleEditorStatus,
  saveAndMove,
  saveEditor,
  saveRuleDraft,
  selectOverrideRule,
  selectedDateLabel,
  selectWeeklyRule,
  storageStatus,
  timeOptions,
  updateDefaultTargetMinutes,
  updateDraftSegment,
  updateOverrideDateInput,
  updateRuleDraftName,
  updateRuleDraftTargetMinutes,
  visibleMonthIndex,
  visibleMonthLabel,
  visibleYear,
  weekLabels,
  weekdayItems,
  yearOptions,
} = useWorktimeCalendar()

const monthOptions = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
]

const shortcutItems = [
  {
    description: '切换日期',
    keys: '← → ↑ ↓',
  },
  {
    description: '打开当前日期编辑',
    keys: 'Enter',
  },
  {
    description: '切换月份',
    keys: '[ / ]',
  },
  {
    description: '跳回今天',
    keys: 'T',
  },
]

const yearSelectOptions = computed(() =>
  yearOptions.value.map((year) => ({
    label: `${year}年`,
    value: year,
  })),
)

const monthSelectOptions = computed(() =>
  monthOptions.map((month, index) => ({
    label: month,
    value: index,
  })),
)

const calendarShortcutBindings = computed<ShortcutBinding[]>(() => [
  {
    handler: () => moveSelection(-1),
    keys: 'left',
  },
  {
    handler: () => moveSelection(1),
    keys: 'right',
  },
  {
    handler: () => moveSelection(-7),
    keys: 'up',
  },
  {
    handler: () => moveSelection(7),
    keys: 'down',
  },
  {
    handler: () => openEditor(),
    keys: 'enter',
  },
  {
    handler: () => jumpToToday(),
    keys: 't',
  },
  {
    handler: () => moveMonth(-1),
    keys: '[',
  },
  {
    handler: () => moveMonth(1),
    keys: ']',
  },
])

function updateVisibleYear(value: string | number) {
  visibleYear.value = Number(value)
}

function updateVisibleMonth(value: string | number) {
  visibleMonthIndex.value = Number(value)
}
</script>

<template>
  <ShortcutScope
    as="div"
    :active="!isDialogOpen"
    :bindings="calendarShortcutBindings"
    class="tool-page worktime-page panel-stack"
  >
    <section class="surface-card-strong tool-hero worktime-hero">
      <div class="tool-hero__copy">
        <span class="section-kicker">Worktime Ledger</span>
        <h1>工时日历</h1>
        <p>
          月历、规则、浏览器数据和弹窗录入被整理到同一工作台里。键盘可以直接驱动日期切换、编辑和月份跳转。
        </p>
      </div>
    </section>

    <section class="worktime-overview">
      <article class="surface-card worktime-summary-card">
        <span class="worktime-summary-card__eyebrow">Month Ledger</span>
        <span class="worktime-summary-card__label">当前月份</span>
        <strong>{{ visibleMonthLabel }}</strong>
        <p>按月查看记录和规则汇总。</p>
      </article>
      <article class="surface-card worktime-summary-card">
        <span class="worktime-summary-card__eyebrow">Recorded Days</span>
        <span class="worktime-summary-card__label">记录天数</span>
        <strong>{{ monthSummary.recordedDays }}</strong>
        <p>只统计已经写入上下班时间的日期。</p>
      </article>
      <article class="surface-card worktime-summary-card">
        <span class="worktime-summary-card__eyebrow">Worked Time</span>
        <span class="worktime-summary-card__label">累计工时</span>
        <strong>{{ monthSummary.totalLabel }}</strong>
        <p>根据规则自动扣除不计薪时段。</p>
      </article>
      <article class="surface-card worktime-summary-card">
        <span class="worktime-summary-card__eyebrow">Monthly Balance</span>
        <span class="worktime-summary-card__label">月结论</span>
        <strong>{{ monthSummary.balanceLabel }}</strong>
        <p>正负差值会同步反映到月历状态。</p>
      </article>
    </section>

    <section class="worktime-shell">
      <div class="worktime-shell__side panel-stack">
        <ShortcutLegend
          eyebrow="Shortcut Map"
          title="月历快捷键"
          :items="shortcutItems"
        />

        <BrowserDataPanel
          description="导出时会同时包含工时记录和规则配置。"
          :export-disabled="false"
          :status="storageStatus"
          title="浏览器数据"
          @export="exportRecords"
          @import-clipboard="importFromClipboard"
          @import-file="importFromFile"
        />

        <WorktimeRulesPanel
          :active-override-date="activeOverrideDate"
          :active-rule-label="activeRuleLabel"
          :active-rule-source="activeRuleSource"
          :active-weekday="activeWeekday"
          :default-target-minutes="defaultTargetMinutes"
          :override-date-input="overrideDateInput"
          :override-dates="overrideDates"
          :rule-draft="ruleDraft"
          :rule-editor-error="ruleEditorError"
          :rule-editor-status="ruleEditorStatus"
          :time-options="timeOptions"
          :weekday-items="weekdayItems"
          @add-override="addOverrideRule"
          @add-segment="addDraftSegment"
          @remove-override="removeActiveOverrideRule"
          @remove-segment="removeDraftSegment"
          @save-rule="saveRuleDraft"
          @select-override="selectOverrideRule"
          @select-weekday="selectWeeklyRule"
          @update-default-target-minutes="updateDefaultTargetMinutes"
          @update-override-date-input="updateOverrideDateInput"
          @update-rule-name="updateRuleDraftName"
          @update-rule-target-minutes="updateRuleDraftTargetMinutes"
          @update-segment="updateDraftSegment"
        />
      </div>

      <div class="worktime-shell__main panel-stack">
        <section class="surface-card-strong worktime-board">
          <div class="worktime-board__toolbar">
            <div class="worktime-board__toolbar-group">
              <button
                class="button button--ghost"
                type="button"
                @click="moveMonth(-1)"
              >
                上一个月
              </button>
              <button
                class="button button--ghost"
                type="button"
                @click="jumpToToday"
              >
                回到今天
              </button>
            </div>

            <div class="worktime-board__toolbar-center">
              <label class="worktime-board__picker">
                <span>年份</span>
                <BaseSelect
                  class="worktime-board__select"
                  label="可见年份"
                  :model-value="visibleYear"
                  :options="yearSelectOptions"
                  @update:model-value="updateVisibleYear"
                />
              </label>
              <label class="worktime-board__picker">
                <span>月份</span>
                <BaseSelect
                  class="worktime-board__select"
                  label="可见月份"
                  :model-value="visibleMonthIndex"
                  :options="monthSelectOptions"
                  @update:model-value="updateVisibleMonth"
                />
              </label>
            </div>

            <div class="worktime-board__toolbar-group">
              <button
                class="button button--ghost"
                type="button"
                @click="moveMonth(1)"
              >
                下一个月
              </button>
            </div>
          </div>

          <div class="worktime-board__shortcut">
            方向键切换日期，Enter 编辑，[ / ] 切换月份，T 回到今天。
          </div>

          <div class="worktime-calendar" role="grid" aria-label="工时月历">
            <div
              v-for="label in weekLabels"
              :key="label"
              class="worktime-calendar__weekday"
            >
              {{ label }}
            </div>

            <button
              v-for="day in calendarDays"
              :key="day.dateKey"
              class="worktime-calendar__day"
              :class="{
                'worktime-calendar__day--muted': !day.isCurrentMonth,
                'worktime-calendar__day--today': day.isToday,
                'worktime-calendar__day--selected': day.isSelected,
                'worktime-calendar__day--positive':
                  day.hasCompleteRecord && day.summary.balanceMinutes > 0,
                'worktime-calendar__day--negative':
                  day.hasCompleteRecord && day.summary.balanceMinutes < 0,
                'worktime-calendar__day--neutral':
                  day.hasCompleteRecord && day.summary.balanceMinutes === 0,
              }"
              type="button"
              @click="openEditor(day.dateKey)"
            >
              <div class="worktime-calendar__day-top">
                <span class="worktime-calendar__day-number">{{
                  day.dayNumber
                }}</span>
              </div>
              <div class="worktime-calendar__day-times">
                <span>{{ day.startTimeLabel }}</span>
                <span>{{ day.endTimeLabel }}</span>
              </div>
              <div class="worktime-calendar__day-main">
                <strong>{{ day.deltaLabel }}</strong>
              </div>
            </button>
          </div>
        </section>
      </div>
    </section>

    <WorkdayEntryDialog
      :applied-rule="editorResolvedRule"
      :can-copy-previous="canCopyPrevious"
      :date-label="selectedDateLabel"
      :end-time="draftEndTime"
      :error-message="editorError"
      :is-open="isDialogOpen"
      :start-time="draftStartTime"
      :summary="editorSummary"
      @request-close="requestCloseEditor"
      @copy-previous="copyPreviousDay"
      @delete="deleteEditorRecord"
      @save="saveEditor"
      @save-next="saveAndMove(1)"
      @save-previous="saveAndMove(-1)"
      @update:end-time="draftEndTime = $event"
      @update:start-time="draftStartTime = $event"
    />
  </ShortcutScope>
</template>
