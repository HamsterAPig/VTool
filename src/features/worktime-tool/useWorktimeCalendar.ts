import { computed, ref } from 'vue'

import {
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
  calculateWorktime,
  cloneDayTemplate,
  createDefaultDayTemplate,
  createRuleSegment,
  formatBalanceMinutes,
  formatDurationHours,
  formatMinuteValue,
  resolveRuleForDate,
  summarizeMonth,
  validateDayTemplate,
  weekdayKeyFromDate,
  type WeekdayKey,
  type WorktimeDayRecord,
  type WorktimeDayTemplate,
  type WorktimeStoragePayload,
} from '@/features/worktime-tool/worktime'
import {
  exportWorktimeData,
  importWorktimeData,
  loadWorktimeData,
  saveWorktimeData,
} from '@/features/worktime-tool/worktimeStorage'

interface CalendarDay {
  date: Date
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
  record: WorktimeDayRecord | null
  deltaLabel: string
  hasCompleteRecord: boolean
  startTimeLabel: string
  endTimeLabel: string
  summary: ReturnType<typeof calculateWorktime>
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatMonthLabel(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

function toMonthKey(date: Date): string {
  return formatDateKey(date).slice(0, 7)
}

function sameMonth(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  )
}

function moveToMonth(date: Date, year: number, month: number): Date {
  const day = Math.min(date.getDate(), getDaysInMonth(year, month))

  return new Date(year, month, day)
}

function downloadJson(raw: string, filename: string) {
  const blob = new Blob([raw], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function getVisibleDateRange(month: Date) {
  const firstVisibleDate = addDays(month, -month.getDay())
  const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const lastVisibleDate = addDays(lastDayOfMonth, 6 - lastDayOfMonth.getDay())
  const dayCount =
    Math.floor(
      (lastVisibleDate.getTime() - firstVisibleDate.getTime()) /
        (24 * 60 * 60 * 1000),
    ) + 1

  return {
    dayCount,
    firstVisibleDate,
  }
}

function getCalendarRecordLabels(record: WorktimeDayRecord | null) {
  return {
    endTimeLabel: record?.endTime || '--:--',
    startTimeLabel: record?.startTime || '--:--',
  }
}

function buildCalendarSummary(
  dateKey: string,
  record: WorktimeDayRecord | null,
  rules: WorktimeStoragePayload['rules'],
) {
  return calculateWorktime(
    {
      startTime: record?.startTime ?? '',
      endTime: record?.endTime ?? '',
    },
    resolveRuleForDate(dateKey, rules),
  )
}

function buildCalendarDay(
  date: Date,
  selectedDateKey: string,
  visibleMonth: Date,
  todayKey: string,
  payload: WorktimeStoragePayload,
): CalendarDay {
  const dateKey = formatDateKey(date)
  const record = payload.records[dateKey] ?? null
  const summary = buildCalendarSummary(dateKey, record, payload.rules)
  const { endTimeLabel, startTimeLabel } = getCalendarRecordLabels(record)

  return {
    date,
    dateKey,
    dayNumber: date.getDate(),
    isCurrentMonth: sameMonth(date, visibleMonth),
    isSelected: dateKey === selectedDateKey,
    isToday: dateKey === todayKey,
    record,
    deltaLabel: summary.status === 'complete' ? summary.balanceLabel : '',
    hasCompleteRecord: summary.status === 'complete',
    startTimeLabel,
    endTimeLabel,
    summary,
  }
}

function clonePayload(payload: WorktimeStoragePayload): WorktimeStoragePayload {
  return {
    records: Object.fromEntries(
      Object.entries(payload.records).map(([date, record]) => [
        date,
        { ...record },
      ]),
    ),
    rules: {
      version: payload.rules.version,
      defaultTargetMinutes: payload.rules.defaultTargetMinutes,
      weeklyTemplates: Object.fromEntries(
        WEEKDAY_KEYS.map((weekdayKey) => [
          weekdayKey,
          cloneDayTemplate(payload.rules.weeklyTemplates[weekdayKey]),
        ]),
      ) as WorktimeStoragePayload['rules']['weeklyTemplates'],
      dateOverrides: Object.fromEntries(
        Object.entries(payload.rules.dateOverrides).map(([date, template]) => [
          date,
          cloneDayTemplate(template),
        ]),
      ),
    },
  }
}

function createTimeOptions(): string[] {
  const options: string[] = []

  for (let minute = 0; minute <= 24 * 60; minute += 5) {
    const hours = Math.floor(minute / 60)
    const remainingMinutes = minute % 60
    const hourLabel = String(hours).padStart(2, '0')
    const minuteLabel = String(remainingMinutes).padStart(2, '0')

    options.push(`${hourLabel}:${minuteLabel}`)
  }

  return options
}

function createWeekdayItems() {
  return WEEKDAY_KEYS.map((key) => ({
    key,
    label: WEEKDAY_LABELS[key],
  }))
}

export function useWorktimeCalendar() {
  const today = new Date()
  const todayKey = formatDateKey(today)
  const selectedDateKey = ref(todayKey)
  const visibleMonth = ref(startOfMonth(today))
  const payload = ref<WorktimeStoragePayload>(loadWorktimeData())
  const isDialogOpen = ref(false)
  const editorDateKey = ref(todayKey)
  const draftStartTime = ref('')
  const draftEndTime = ref('')
  const editorError = ref('')
  const storageStatus = ref('浏览器内自动保存已开启。')
  const activeWeekday = ref<WeekdayKey>(weekdayKeyFromDate(today))
  const activeOverrideDate = ref('')
  const overrideDateInput = ref(todayKey)
  const ruleDraft = ref<WorktimeDayTemplate>(
    cloneDayTemplate(payload.value.rules.weeklyTemplates[activeWeekday.value]),
  )
  const ruleEditorError = ref('')
  const ruleEditorStatus = ref('规则修改后会立即影响月历和汇总。')

  const weekLabels = createWeekdayItems().map((item) => item.label)
  const weekdayItems = createWeekdayItems()
  const timeOptions = createTimeOptions()

  const visibleMonthLabel = computed(() => formatMonthLabel(visibleMonth.value))
  const monthKey = computed(() => toMonthKey(visibleMonth.value))
  const monthRecords = computed(() =>
    Object.values(payload.value.records)
      .filter((record) => record.date.startsWith(`${monthKey.value}-`))
      .sort((left, right) => left.date.localeCompare(right.date)),
  )
  const monthSummary = computed(() =>
    summarizeMonth(monthRecords.value, payload.value.rules),
  )
  const selectedDate = computed(() => parseDateKey(selectedDateKey.value))
  const selectedDateLabel = computed(() =>
    selectedDate.value.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }),
  )
  const editorResolvedRule = computed(() =>
    resolveRuleForDate(editorDateKey.value, payload.value.rules),
  )
  const editorRecord = computed(
    () => payload.value.records[editorDateKey.value] ?? null,
  )
  const editorSummary = computed(() =>
    calculateWorktime(
      {
        startTime: draftStartTime.value,
        endTime: draftEndTime.value,
      },
      editorResolvedRule.value,
    ),
  )
  const isEditorDirty = computed(
    () =>
      (editorRecord.value?.startTime ?? '') !== draftStartTime.value ||
      (editorRecord.value?.endTime ?? '') !== draftEndTime.value,
  )
  const canCopyPrevious = computed(() => {
    const previousDateKey = formatDateKey(
      addDays(parseDateKey(editorDateKey.value), -1),
    )
    const previousRecord = payload.value.records[previousDateKey]

    return Boolean(previousRecord?.startTime && previousRecord?.endTime)
  })
  const calendarDays = computed<CalendarDay[]>(() => {
    const { dayCount, firstVisibleDate } = getVisibleDateRange(
      visibleMonth.value,
    )

    return Array.from({ length: dayCount }, (_, index) => {
      const date = addDays(firstVisibleDate, index)
      return buildCalendarDay(
        date,
        selectedDateKey.value,
        visibleMonth.value,
        todayKey,
        payload.value,
      )
    })
  })
  const yearOptions = computed(() => {
    const recordedYears = Object.keys(payload.value.records).map((value) =>
      Number(value.slice(0, 4)),
    )
    const overrideYears = Object.keys(payload.value.rules.dateOverrides).map(
      (value) => Number(value.slice(0, 4)),
    )
    const currentYear = today.getFullYear()
    const minYear = Math.min(
      currentYear - 3,
      ...recordedYears,
      ...overrideYears,
      currentYear,
    )
    const maxYear = Math.max(
      currentYear + 3,
      ...recordedYears,
      ...overrideYears,
      currentYear,
    )

    return Array.from(
      { length: maxYear - minYear + 1 },
      (_, index) => minYear + index,
    )
  })
  const visibleYear = computed({
    get: () => visibleMonth.value.getFullYear(),
    set: (year: number) => {
      setVisibleMonth(year, visibleMonth.value.getMonth())
    },
  })
  const visibleMonthIndex = computed({
    get: () => visibleMonth.value.getMonth(),
    set: (month: number) => {
      setVisibleMonth(visibleMonth.value.getFullYear(), month)
    },
  })
  const overrideDates = computed(() =>
    Object.keys(payload.value.rules.dateOverrides).sort(),
  )
  const defaultTargetMinutes = computed(
    () => payload.value.rules.defaultTargetMinutes,
  )
  const activeRuleSource = computed(() =>
    activeOverrideDate.value ? 'override' : 'weekly',
  )
  const activeRuleLabel = computed(() =>
    activeOverrideDate.value
      ? `${activeOverrideDate.value} 例外规则`
      : `${WEEKDAY_LABELS[activeWeekday.value]}模板`,
  )

  function persistPayload(nextPayload: WorktimeStoragePayload) {
    payload.value = nextPayload
    saveWorktimeData(nextPayload)
  }

  function refreshRuleDraft() {
    const overrideTemplate = activeOverrideDate.value
      ? payload.value.rules.dateOverrides[activeOverrideDate.value]
      : undefined

    if (overrideTemplate) {
      ruleDraft.value = cloneDayTemplate(overrideTemplate)
      return
    }

    ruleDraft.value = cloneDayTemplate(
      payload.value.rules.weeklyTemplates[activeWeekday.value] ??
        createDefaultDayTemplate(),
    )
    activeOverrideDate.value = ''
  }

  function syncEditor(dateKey: string) {
    const record = payload.value.records[dateKey]

    editorDateKey.value = dateKey
    draftStartTime.value = record?.startTime ?? ''
    draftEndTime.value = record?.endTime ?? ''
    editorError.value = ''
  }

  function selectDate(dateKey: string) {
    const date = parseDateKey(dateKey)

    selectedDateKey.value = dateKey
    visibleMonth.value = startOfMonth(date)
  }

  function openEditor(dateKey = selectedDateKey.value) {
    selectDate(dateKey)
    syncEditor(dateKey)
    isDialogOpen.value = true
  }

  function closeEditor() {
    isDialogOpen.value = false
    editorError.value = ''
  }

  function requestCloseEditor() {
    if (!isEditorDirty.value) {
      closeEditor()
      return true
    }

    if (!saveEditor()) {
      return false
    }

    closeEditor()
    return true
  }

  function saveEditor(): boolean {
    const summary = editorSummary.value

    if (summary.status !== 'complete') {
      editorError.value = summary.message
      return false
    }

    const nextPayload = clonePayload(payload.value)

    nextPayload.records[editorDateKey.value] = {
      date: editorDateKey.value,
      startTime: draftStartTime.value,
      endTime: draftEndTime.value,
      updatedAt: new Date().toISOString(),
    }

    persistPayload(nextPayload)
    storageStatus.value = `已保存 ${editorDateKey.value} 的工时记录。`
    editorError.value = ''
    return true
  }

  function saveAndMove(amount: number) {
    if (!saveEditor()) {
      return
    }

    const nextDateKey = formatDateKey(
      addDays(parseDateKey(editorDateKey.value), amount),
    )

    openEditor(nextDateKey)
  }

  function deleteEditorRecord() {
    if (!payload.value.records[editorDateKey.value]) {
      draftStartTime.value = ''
      draftEndTime.value = ''
      editorError.value = ''
      return
    }

    const nextPayload = clonePayload(payload.value)

    delete nextPayload.records[editorDateKey.value]
    persistPayload(nextPayload)
    draftStartTime.value = ''
    draftEndTime.value = ''
    editorError.value = ''
    storageStatus.value = `已删除 ${editorDateKey.value} 的工时记录。`
  }

  function copyPreviousDay() {
    const previousDateKey = formatDateKey(
      addDays(parseDateKey(editorDateKey.value), -1),
    )
    const previousRecord = payload.value.records[previousDateKey]

    if (!previousRecord) {
      editorError.value = '前一天没有可复制的记录。'
      return
    }

    draftStartTime.value = previousRecord.startTime
    draftEndTime.value = previousRecord.endTime
    editorError.value = ''
  }

  function moveSelection(amount: number) {
    selectDate(
      formatDateKey(addDays(parseDateKey(selectedDateKey.value), amount)),
    )
  }

  function setVisibleMonth(year: number, month: number) {
    const nextDate = moveToMonth(
      parseDateKey(selectedDateKey.value),
      year,
      month,
    )

    selectedDateKey.value = formatDateKey(nextDate)
    visibleMonth.value = startOfMonth(nextDate)
  }

  function moveMonth(amount: number) {
    const nextMonth = addMonths(visibleMonth.value, amount)

    setVisibleMonth(nextMonth.getFullYear(), nextMonth.getMonth())
  }

  function jumpToToday() {
    selectDate(todayKey)
  }

  function exportRecords() {
    const raw = exportWorktimeData(payload.value)
    const filename = `worktime-data-${todayKey}.json`

    downloadJson(raw, filename)
    storageStatus.value = '已导出工时记录和规则配置。'
  }

  function importFromRaw(raw: string) {
    const importedPayload = importWorktimeData(raw)

    persistPayload(importedPayload)
    refreshRuleDraft()
    storageStatus.value = `已导入 ${Object.keys(importedPayload.records).length} 条记录和规则配置。`
  }

  async function importFromFile(file: File) {
    try {
      const raw = await file.text()
      importFromRaw(raw)
    } catch (error) {
      storageStatus.value =
        error instanceof Error ? error.message : '导入失败，请检查文件内容。'
    }
  }

  async function importFromClipboard() {
    if (!navigator.clipboard?.readText) {
      storageStatus.value = '当前环境不支持从剪贴板导入。'
      return
    }

    try {
      const raw = await navigator.clipboard.readText()

      if (!raw.trim()) {
        storageStatus.value = '剪贴板没有可导入的内容。'
        return
      }

      importFromRaw(raw)
    } catch (error) {
      storageStatus.value =
        error instanceof Error
          ? `读取剪贴板失败：${error.message}`
          : '读取剪贴板失败，请检查浏览器权限。'
    }
  }

  function selectWeeklyRule(weekdayKey: WeekdayKey) {
    activeWeekday.value = weekdayKey
    activeOverrideDate.value = ''
    ruleDraft.value = cloneDayTemplate(
      payload.value.rules.weeklyTemplates[weekdayKey],
    )
    ruleEditorError.value = ''
  }

  function selectOverrideRule(dateKey: string) {
    activeOverrideDate.value = dateKey
    activeWeekday.value = weekdayKeyFromDate(parseDateKey(dateKey))
    overrideDateInput.value = dateKey
    ruleDraft.value = cloneDayTemplate(
      payload.value.rules.dateOverrides[dateKey] ??
        resolveRuleForDate(dateKey, payload.value.rules).template,
    )
    ruleEditorError.value = ''
  }

  function updateDefaultTargetMinutes(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      ruleEditorError.value = '默认目标分钟数必须是大于等于 0 的整数。'
      return
    }

    const nextPayload = clonePayload(payload.value)

    nextPayload.rules.defaultTargetMinutes = value
    persistPayload(nextPayload)
    ruleEditorError.value = ''
    ruleEditorStatus.value = `默认目标分钟数已更新为 ${formatMinuteValue(value)}。`
  }

  function updateRuleDraftName(value: string) {
    ruleDraft.value = {
      ...ruleDraft.value,
      name: value,
    }
  }

  function updateRuleDraftTargetMinutes(value: number) {
    ruleDraft.value = {
      ...ruleDraft.value,
      targetMinutes: Number.isInteger(value) ? value : 0,
    }
  }

  function updateDraftSegment(
    segmentId: string,
    field: 'label' | 'start' | 'end' | 'type',
    value: string,
  ) {
    ruleDraft.value = {
      ...ruleDraft.value,
      segments: ruleDraft.value.segments.map((segment) =>
        segment.id === segmentId ? { ...segment, [field]: value } : segment,
      ),
    }
  }

  function addDraftSegment(type: 'paid' | 'unpaid' = 'paid') {
    ruleDraft.value = {
      ...ruleDraft.value,
      segments: [...ruleDraft.value.segments, createRuleSegment(type)],
    }
  }

  function removeDraftSegment(segmentId: string) {
    ruleDraft.value = {
      ...ruleDraft.value,
      segments: ruleDraft.value.segments.filter(
        (segment) => segment.id !== segmentId,
      ),
    }
  }

  function saveRuleDraft() {
    const validationMessage = validateDayTemplate(
      ruleDraft.value,
      payload.value.rules.defaultTargetMinutes,
    )

    if (validationMessage) {
      ruleEditorError.value = validationMessage
      return
    }

    const nextPayload = clonePayload(payload.value)

    if (activeOverrideDate.value) {
      nextPayload.rules.dateOverrides[activeOverrideDate.value] =
        cloneDayTemplate(ruleDraft.value)
      ruleEditorStatus.value = `已保存 ${activeOverrideDate.value} 的例外规则。`
    } else {
      nextPayload.rules.weeklyTemplates[activeWeekday.value] = cloneDayTemplate(
        ruleDraft.value,
      )
      ruleEditorStatus.value = `已保存 ${WEEKDAY_LABELS[activeWeekday.value]}模板。`
    }

    persistPayload(nextPayload)
    ruleEditorError.value = ''
  }

  function addOverrideRule() {
    if (!overrideDateInput.value) {
      ruleEditorError.value = '请先选择例外日期。'
      return
    }

    const nextPayload = clonePayload(payload.value)
    const template =
      nextPayload.rules.dateOverrides[overrideDateInput.value] ??
      resolveRuleForDate(overrideDateInput.value, nextPayload.rules).template

    nextPayload.rules.dateOverrides[overrideDateInput.value] =
      cloneDayTemplate(template)
    persistPayload(nextPayload)
    selectOverrideRule(overrideDateInput.value)
    ruleEditorStatus.value = `已为 ${overrideDateInput.value} 创建例外规则。`
  }

  function removeActiveOverrideRule() {
    if (!activeOverrideDate.value) {
      return
    }

    const nextPayload = clonePayload(payload.value)
    const removedDate = activeOverrideDate.value

    delete nextPayload.rules.dateOverrides[removedDate]
    persistPayload(nextPayload)
    activeOverrideDate.value = ''
    selectWeeklyRule(weekdayKeyFromDate(parseDateKey(removedDate)))
    ruleEditorStatus.value = `已删除 ${removedDate} 的例外规则。`
  }

  return {
    activeOverrideDate,
    activeRuleLabel,
    activeRuleSource,
    activeWeekday,
    calendarDays,
    canCopyPrevious,
    closeEditor,
    copyPreviousDay,
    deleteEditorRecord,
    defaultTargetMinutes,
    draftEndTime,
    draftStartTime,
    editorError,
    editorResolvedRule,
    editorSummary,
    exportRecords,
    importFromClipboard,
    importFromFile,
    isEditorDirty,
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
    ruleDraft,
    ruleEditorError,
    ruleEditorStatus,
    saveAndMove,
    saveEditor,
    saveRuleDraft,
    selectDate,
    selectOverrideRule,
    selectWeeklyRule,
    selectedDateLabel,
    storageStatus,
    timeOptions,
    updateDefaultTargetMinutes,
    updateDraftSegment,
    updateOverrideDateInput: (value: string) => {
      overrideDateInput.value = value
    },
    updateRuleDraftName,
    updateRuleDraftTargetMinutes,
    visibleMonthIndex,
    visibleMonthLabel,
    visibleYear,
    weekLabels,
    weekdayItems,
    yearOptions,
    addDraftSegment,
    addOverrideRule,
    removeDraftSegment,
    formatBalanceMinutes,
    formatDurationHours,
    formatMinuteValue,
  }
}
