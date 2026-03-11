export type TimestampPrecision = 'auto' | 'seconds' | 'milliseconds'

export interface ParsedTimestamp {
  milliseconds: number
  seconds: number
}

export interface TimestampToDateResult {
  iso: string
  locale: string
  milliseconds: string
  seconds: string
}

export interface DateToTimestampResult {
  iso: string
  locale: string
  milliseconds: string
  seconds: string
}

const TIMESTAMP_THRESHOLD = 1_000_000_000_000

export function detectPrecision(
  value: number,
  precision: TimestampPrecision,
): 'seconds' | 'milliseconds' {
  if (precision !== 'auto') {
    return precision
  }

  return Math.abs(value) >= TIMESTAMP_THRESHOLD ? 'milliseconds' : 'seconds'
}

export function parseTimestampInput(
  raw: string,
  precision: TimestampPrecision,
): ParsedTimestamp {
  const value = Number(raw.trim())

  if (!Number.isFinite(value)) {
    throw new Error('请输入合法的数字时间戳。')
  }

  const resolvedPrecision = detectPrecision(value, precision)
  const milliseconds = resolvedPrecision === 'seconds' ? value * 1000 : value
  const date = new Date(milliseconds)

  if (Number.isNaN(date.getTime())) {
    throw new Error('时间戳超出可解析范围。')
  }

  return {
    milliseconds: Math.trunc(milliseconds),
    seconds: Math.trunc(milliseconds / 1000),
  }
}

export function formatDateTimeInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join('T')
}

export function formatTimestampToDate(
  raw: string,
  precision: TimestampPrecision,
): TimestampToDateResult {
  const parsed = parseTimestampInput(raw, precision)
  const date = new Date(parsed.milliseconds)

  return {
    iso: date.toISOString(),
    locale: date.toLocaleString(),
    milliseconds: String(parsed.milliseconds),
    seconds: String(parsed.seconds),
  }
}

export function convertDateTimeToTimestamp(raw: string): DateToTimestampResult {
  const date = new Date(raw)

  if (Number.isNaN(date.getTime())) {
    throw new Error('请输入合法的日期时间。')
  }

  return {
    iso: date.toISOString(),
    locale: date.toLocaleString(),
    milliseconds: String(date.getTime()),
    seconds: String(Math.trunc(date.getTime() / 1000)),
  }
}
