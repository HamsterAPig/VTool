<script setup lang="ts">
import BrowserDataPanel from '@/components/BrowserDataPanel.vue'
import WorkdayEntryDialog from '@/features/worktime-tool/WorkdayEntryDialog.vue'
import { useWorktimeCalendar } from '@/features/worktime-tool/useWorktimeCalendar'

const {
  calendarDays,
  canCopyPrevious,
  closeEditor,
  copyPreviousDay,
  deleteEditorRecord,
  draftEndTime,
  draftStartTime,
  editorError,
  editorSummary,
  exportRecords,
  importFromFile,
  isDialogOpen,
  jumpToToday,
  monthSummary,
  moveMonth,
  openEditor,
  saveAndMove,
  saveEditor,
  selectedDateLabel,
  storageStatus,
  visibleMonthIndex,
  visibleMonthLabel,
  visibleYear,
  weekLabels,
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

function getDayMainTitle(day: (typeof calendarDays.value)[number]) {
  return day.record ? day.summary.totalLabel : '未录入'
}

function getDayMainSubtitle(day: (typeof calendarDays.value)[number]) {
  if (!day.record) {
    return '不计入汇总'
  }

  return day.summary.balanceLabel
}
</script>

<template>
  <div class="tool-page worktime-page">
    <section class="tool-hero worktime-hero">
      <span class="hero-badge">Worktime Calendar</span>
      <h1>工时日历</h1>
      <p>
        用月历管理每天的上下班时间，自动扣除午休与 17:30-18:00
        空档，直接给出当日和当月的工时结论。
      </p>
    </section>

    <section class="worktime-overview">
      <article class="surface-panel worktime-summary-card">
        <span class="worktime-summary-card__label">当前月份</span>
        <strong>{{ visibleMonthLabel }}</strong>
        <p>只统计有完整上班数据的日期。</p>
      </article>
      <article class="surface-panel worktime-summary-card">
        <span class="worktime-summary-card__label">记录天数</span>
        <strong>{{ monthSummary.recordedDays }}</strong>
        <p>本月已录入并可计算的工作日数。</p>
      </article>
      <article class="surface-panel worktime-summary-card">
        <span class="worktime-summary-card__label">累计工时</span>
        <strong>{{ monthSummary.totalLabel }}</strong>
        <p>只累计当月有效记录的总工时。</p>
      </article>
      <article class="surface-panel worktime-summary-card">
        <span class="worktime-summary-card__label">工时结论</span>
        <strong>{{ monthSummary.balanceLabel }}</strong>
        <p>超过为正，不足为负，基准按每天 8 小时。</p>
      </article>
    </section>

    <BrowserDataPanel
      description="全部工时数据保存在当前浏览器中，可随时导入或导出 JSON 备份。"
      :export-disabled="false"
      :status="storageStatus"
      title="浏览器数据管理"
      @export="exportRecords"
      @import-file="importFromFile"
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
        键盘：方向键切换日期，Enter 编辑，T 回到今天，[ / ] 切换月份。
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
              day.summary.status === 'complete' &&
              day.summary.balanceMinutes > 0,
            'worktime-calendar__day--negative':
              day.summary.status === 'complete' &&
              day.summary.balanceMinutes < 0,
          }"
          type="button"
          @click="openEditor(day.dateKey)"
        >
          <div class="worktime-calendar__day-top">
            <span class="worktime-calendar__day-number">{{
              day.dayNumber
            }}</span>
            <span v-if="day.record" class="worktime-calendar__day-badge"
              >已录入</span
            >
          </div>
          <div class="worktime-calendar__day-main">
            <strong>{{ getDayMainTitle(day) }}</strong>
            <span>{{ getDayMainSubtitle(day) }}</span>
          </div>
          <p class="worktime-calendar__day-note">{{ day.summary.message }}</p>
        </button>
      </div>
    </section>

    <WorkdayEntryDialog
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
