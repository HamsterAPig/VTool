import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import {
  calculateWorktime,
  type WorktimeDayRecord,
  type WorktimeRecordMap,
  summarizeMonth,
} from '@/features/worktime-tool/worktime'
import {
  exportWorktimeRecords,
  importWorktimeRecords,
  loadWorktimeRecords,
  saveWorktimeRecords,
} from '@/features/worktime-tool/worktimeStorage'

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

interface CalendarDay {
  date: Date
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
  record: WorktimeDayRecord | null
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
  const parts = dateKey.split('-')

  if (parts.length !== 3) {
    return new Date()
  }

  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])

  return new Date(year, month - 1, day)
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

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
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

export function useWorktimeCalendar() {
  const today = new Date()
  const todayKey = formatDateKey(today)
  const selectedDateKey = ref(todayKey)
  const visibleMonth = ref(startOfMonth(today))
  const records = ref<WorktimeRecordMap>(loadWorktimeRecords())
  const isDialogOpen = ref(false)
  const editorDateKey = ref(todayKey)
  const draftStartTime = ref('')
  const draftEndTime = ref('')
  const editorError = ref('')
  const storageStatus = ref('已启用浏览器自动保存。')

  const visibleMonthLabel = computed(() => formatMonthLabel(visibleMonth.value))
  const monthKey = computed(() => toMonthKey(visibleMonth.value))
  const monthRecords = computed(() =>
    Object.values(records.value)
      .filter((record) => record.date.startsWith(`${monthKey.value}-`))
      .sort((left, right) => left.date.localeCompare(right.date)),
  )
  const monthSummary = computed(() => summarizeMonth(monthRecords.value))
  const selectedDate = computed(() => parseDateKey(selectedDateKey.value))
  const selectedDateLabel = computed(() =>
    selectedDate.value.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }),
  )
  const editorSummary = computed(() =>
    calculateWorktime(draftStartTime.value, draftEndTime.value),
  )
  const canCopyPrevious = computed(() => {
    const previousDateKey = formatDateKey(
      addDays(parseDateKey(editorDateKey.value), -1),
    )
    const previousRecord = records.value[previousDateKey]

    return Boolean(previousRecord?.startTime && previousRecord?.endTime)
  })
  const calendarDays = computed<CalendarDay[]>(() => {
    const firstVisibleDate = addDays(
      visibleMonth.value,
      -visibleMonth.value.getDay(),
    )

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(firstVisibleDate, index)
      const dateKey = formatDateKey(date)
      const record = records.value[dateKey] ?? null

      return {
        date,
        dateKey,
        dayNumber: date.getDate(),
        isCurrentMonth: sameMonth(date, visibleMonth.value),
        isSelected: dateKey === selectedDateKey.value,
        isToday: dateKey === todayKey,
        record,
        summary: calculateWorktime(
          record?.startTime ?? '',
          record?.endTime ?? '',
        ),
      }
    })
  })
  const yearOptions = computed(() => {
    const recordedYears = Object.keys(records.value).map((value) =>
      Number(value.slice(0, 4)),
    )
    const currentYear = today.getFullYear()
    const minYear = Math.min(currentYear - 3, ...recordedYears, currentYear)
    const maxYear = Math.max(currentYear + 3, ...recordedYears, currentYear)

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

  function persistRecords(nextRecords: WorktimeRecordMap) {
    records.value = nextRecords
    saveWorktimeRecords(nextRecords)
  }

  function syncEditor(dateKey: string) {
    const record = records.value[dateKey]

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

  function saveEditor(): boolean {
    const summary = editorSummary.value

    if (summary.status !== 'complete') {
      editorError.value = summary.message
      return false
    }

    const nextRecords = {
      ...records.value,
      [editorDateKey.value]: {
        date: editorDateKey.value,
        startTime: draftStartTime.value,
        endTime: draftEndTime.value,
        updatedAt: new Date().toISOString(),
      },
    }

    persistRecords(nextRecords)
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
    if (!records.value[editorDateKey.value]) {
      draftStartTime.value = ''
      draftEndTime.value = ''
      editorError.value = ''
      return
    }

    const nextRecords = { ...records.value }

    delete nextRecords[editorDateKey.value]
    persistRecords(nextRecords)
    draftStartTime.value = ''
    draftEndTime.value = ''
    editorError.value = ''
    storageStatus.value = `已删除 ${editorDateKey.value} 的工时记录。`
  }

  function copyPreviousDay() {
    const previousDateKey = formatDateKey(
      addDays(parseDateKey(editorDateKey.value), -1),
    )
    const previousRecord = records.value[previousDateKey]

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
    const raw = exportWorktimeRecords(records.value)
    const filename = `worktime-records-${todayKey}.json`

    downloadJson(raw, filename)
    storageStatus.value = '已导出浏览器中的全部工时记录。'
  }

  async function importFromFile(file: File) {
    try {
      const raw = await file.text()
      const importedRecords = importWorktimeRecords(raw)

      persistRecords(importedRecords)
      storageStatus.value = `已导入 ${Object.keys(importedRecords).length} 条工时记录。`
    } catch (error) {
      storageStatus.value =
        error instanceof Error ? error.message : '导入失败，请检查文件内容。'
    }
  }

  function handleDialogShortcut(event: KeyboardEvent): boolean {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeEditor()
      return true
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      saveEditor()
      return true
    }

    if (event.altKey && event.key === 'ArrowRight') {
      event.preventDefault()
      saveAndMove(1)
      return true
    }

    if (event.altKey && event.key === 'ArrowLeft') {
      event.preventDefault()
      saveAndMove(-1)
      return true
    }

    return false
  }

  function handleCalendarShortcut(event: KeyboardEvent) {
    if (isTypingTarget(event.target)) {
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveSelection(-1)
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveSelection(1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveSelection(-7)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveSelection(7)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      openEditor()
      return
    }

    if (event.key.toLowerCase() === 't') {
      event.preventDefault()
      jumpToToday()
      return
    }

    if (event.key === '[') {
      event.preventDefault()
      moveMonth(-1)
      return
    }

    if (event.key === ']') {
      event.preventDefault()
      moveMonth(1)
    }
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (isDialogOpen.value) {
      if (handleDialogShortcut(event)) {
        return
      }
    }

    handleCalendarShortcut(event)
  }

  onMounted(() => {
    window.addEventListener('keydown', onWindowKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onWindowKeydown)
  })

  return {
    calendarDays,
    canCopyPrevious,
    closeEditor,
    copyPreviousDay,
    deleteEditorRecord,
    draftEndTime,
    draftStartTime,
    editorDateKey,
    editorError,
    editorSummary,
    exportRecords,
    importFromFile,
    isDialogOpen,
    monthSummary,
    moveMonth,
    openEditor,
    saveAndMove,
    saveEditor,
    selectedDateKey,
    selectedDateLabel,
    selectDate,
    storageStatus,
    visibleMonthIndex,
    visibleMonthLabel,
    visibleYear,
    weekLabels: WEEKDAY_LABELS,
    yearOptions,
    jumpToToday,
  }
}
