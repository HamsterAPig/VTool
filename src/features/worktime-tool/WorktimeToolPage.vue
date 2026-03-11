<script setup lang="ts">
import BrowserDataPanel from '@/components/BrowserDataPanel.vue'
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
  closeEditor,
  copyPreviousDay,
  defaultTargetMinutes,
  deleteEditorRecord,
  draftEndTime,
  draftStartTime,
  editorError,
  editorResolvedRule,
  editorSummary,
  exportRecords,
  importFromFile,
  isDialogOpen,
  jumpToToday,
  monthSummary,
  moveMonth,
  openEditor,
  overrideDateInput,
  overrideDates,
  removeActiveOverrideRule,
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
</script>

<template>
  <div class="tool-page worktime-page">
    <section class="tool-hero worktime-hero">
      <span class="hero-badge">Worktime Rule Engine</span>
      <h1>工时日历</h1>
      <p>只看分钟差值，规则独立可配，记录和规则一起保存在浏览器里。</p>
    </section>

    <section class="worktime-overview">
      <article class="surface-panel worktime-summary-card">
        <span class="worktime-summary-card__label">当前月份</span>
        <strong>{{ visibleMonthLabel }}</strong>
      </article>
      <article class="surface-panel worktime-summary-card">
        <span class="worktime-summary-card__label">记录天数</span>
        <strong>{{ monthSummary.recordedDays }}</strong>
      </article>
      <article class="surface-panel worktime-summary-card">
        <span class="worktime-summary-card__label">累计分钟</span>
        <strong>{{ monthSummary.totalLabel }}</strong>
      </article>
      <article class="surface-panel worktime-summary-card">
        <span class="worktime-summary-card__label">月结论</span>
        <strong>{{ monthSummary.balanceLabel }}</strong>
      </article>
    </section>

    <BrowserDataPanel
      description="导出时会同时包含工时记录和规则配置。"
      :export-disabled="false"
      :status="storageStatus"
      title="浏览器数据"
      @export="exportRecords"
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

    <section class="surface-panel worktime-board">
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
            <select v-model.number="visibleYear" class="glass-input">
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
          </label>
          <label class="worktime-board__picker">
            <span>月份</span>
            <select v-model.number="visibleMonthIndex" class="glass-input">
              <option
                v-for="(month, index) in monthOptions"
                :key="month"
                :value="index"
              >
                {{ month }}
              </option>
            </select>
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
          <div class="worktime-calendar__day-main">
            <strong>{{ day.deltaLabel }}</strong>
          </div>
        </button>
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
      @close="closeEditor"
      @copy-previous="copyPreviousDay"
      @delete="deleteEditorRecord"
      @save="saveEditor"
      @save-next="saveAndMove(1)"
      @save-previous="saveAndMove(-1)"
      @update:end-time="draftEndTime = $event"
      @update:start-time="draftStartTime = $event"
    />
  </div>
</template>
