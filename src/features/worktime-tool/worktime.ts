export interface WorktimeDayRecord {
  date: string
  startTime: string
  endTime: string
  updatedAt: string
}

export interface WorktimeDaySummary {
  status: 'empty' | 'incomplete' | 'invalid' | 'complete'
  totalMinutes: number
  regularMinutes: number
  overtimeMinutes: number
  balanceMinutes: number
  totalLabel: string
  balanceLabel: string
  message: string
}

export interface WorktimeMonthSummary {
  recordedDays: number
  totalMinutes: number
  balanceMinutes: number
  totalLabel: string
  balanceLabel: string
}

export type WorktimeRecordMap = Record<string, WorktimeDayRecord>

const MORNING_START = 8 * 60 + 30
const MORNING_END = 12 * 60
const AFTERNOON_START = 13 * 60
const AFTERNOON_END = 17 * 60 + 30
const OVERTIME_START = 18 * 60
const DAY_TARGET_MINUTES = 8 * 60

function parseTimeValue(value: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return null
  }

  const parts = value.split(':')

  if (parts.length !== 2) {
    return null
  }

  const hour = Number(parts[0])
  const minute = Number(parts[1])

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null
  }

  return hour * 60 + minute
}

function overlapMinutes(
  start: number,
  end: number,
  rangeStart: number,
  rangeEnd: number,
): number {
  const from = Math.max(start, rangeStart)
  const to = Math.min(end, rangeEnd)

  return Math.max(0, to - from)
}

export function formatDurationMinutes(minutes: number): string {
  const absoluteMinutes = Math.abs(minutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const remainingMinutes = absoluteMinutes % 60

  return `${hours}小时${String(remainingMinutes).padStart(2, '0')}分钟`
}

export function formatBalanceMinutes(minutes: number): string {
  if (minutes === 0) {
    return '0分钟'
  }

  const prefix = minutes > 0 ? '+' : '-'

  return `${prefix}${formatDurationMinutes(minutes)}`
}

export function calculateWorktime(
  startTime: string,
  endTime: string,
): WorktimeDaySummary {
  if (!startTime && !endTime) {
    return {
      status: 'empty',
      totalMinutes: 0,
      regularMinutes: 0,
      overtimeMinutes: 0,
      balanceMinutes: 0,
      totalLabel: '0小时00分钟',
      balanceLabel: '0分钟',
      message: '当天还没有录入时间。',
    }
  }

  if (!startTime || !endTime) {
    return {
      status: 'incomplete',
      totalMinutes: 0,
      regularMinutes: 0,
      overtimeMinutes: 0,
      balanceMinutes: -DAY_TARGET_MINUTES,
      totalLabel: '0小时00分钟',
      balanceLabel: formatBalanceMinutes(-DAY_TARGET_MINUTES),
      message: '请同时填写上班和下班时间。',
    }
  }

  const startMinutes = parseTimeValue(startTime)
  const endMinutes = parseTimeValue(endTime)

  if (startMinutes === null || endMinutes === null) {
    return {
      status: 'invalid',
      totalMinutes: 0,
      regularMinutes: 0,
      overtimeMinutes: 0,
      balanceMinutes: 0,
      totalLabel: '0小时00分钟',
      balanceLabel: '0分钟',
      message: '时间格式不正确。',
    }
  }

  if (endMinutes <= startMinutes) {
    return {
      status: 'invalid',
      totalMinutes: 0,
      regularMinutes: 0,
      overtimeMinutes: 0,
      balanceMinutes: 0,
      totalLabel: '0小时00分钟',
      balanceLabel: '0分钟',
      message: '下班时间必须晚于上班时间。',
    }
  }

  const regularMinutes =
    overlapMinutes(startMinutes, endMinutes, MORNING_START, MORNING_END) +
    overlapMinutes(startMinutes, endMinutes, AFTERNOON_START, AFTERNOON_END)
  const overtimeMinutes = overlapMinutes(
    startMinutes,
    endMinutes,
    OVERTIME_START,
    24 * 60,
  )
  const totalMinutes = regularMinutes + overtimeMinutes
  const balanceMinutes = totalMinutes - DAY_TARGET_MINUTES

  return {
    status: 'complete',
    totalMinutes,
    regularMinutes,
    overtimeMinutes,
    balanceMinutes,
    totalLabel: formatDurationMinutes(totalMinutes),
    balanceLabel: formatBalanceMinutes(balanceMinutes),
    message: '已按固定班次规则完成计算。',
  }
}

function isRecordedDay(summary: WorktimeDaySummary): boolean {
  return summary.status === 'complete'
}

export function summarizeMonth(
  records: WorktimeDayRecord[],
): WorktimeMonthSummary {
  const summaries = records.map((record) =>
    calculateWorktime(record.startTime, record.endTime),
  )
  const recordedSummaries = summaries.filter(isRecordedDay)
  const totalMinutes = recordedSummaries.reduce(
    (sum, summary) => sum + summary.totalMinutes,
    0,
  )
  const balanceMinutes = recordedSummaries.reduce(
    (sum, summary) => sum + summary.balanceMinutes,
    0,
  )

  return {
    recordedDays: recordedSummaries.length,
    totalMinutes,
    balanceMinutes,
    totalLabel: formatDurationMinutes(totalMinutes),
    balanceLabel: formatBalanceMinutes(balanceMinutes),
  }
}

export function isWorktimeDayRecord(
  value: unknown,
): value is WorktimeDayRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<WorktimeDayRecord>

  return (
    typeof candidate.date === 'string' &&
    typeof candidate.startTime === 'string' &&
    typeof candidate.endTime === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

export function isWorktimeRecordMap(
  value: unknown,
): value is WorktimeRecordMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  return Object.values(value).every(isWorktimeDayRecord)
}
