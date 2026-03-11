import { describe, expect, it } from 'vitest'

import {
  convertDateTimeToTimestamp,
  formatTimestampToDate,
  parseTimestampInput,
} from '@/features/timestamp-tool/timestamp'

describe('timestamp utilities', () => {
  it('parses second timestamps in auto mode', () => {
    expect(parseTimestampInput('1710162000', 'auto')).toEqual({
      milliseconds: 1710162000000,
      seconds: 1710162000,
    })
  })

  it('parses millisecond timestamps in auto mode', () => {
    expect(parseTimestampInput('1710162000000', 'auto')).toEqual({
      milliseconds: 1710162000000,
      seconds: 1710162000,
    })
  })

  it('formats timestamps into locale and iso output', () => {
    const result = formatTimestampToDate('1710162000', 'seconds')

    expect(result.seconds).toBe('1710162000')
    expect(result.milliseconds).toBe('1710162000000')
    expect(result.iso).toContain('2024-03-11')
  })

  it('converts a datetime-local value to timestamps', () => {
    const result = convertDateTimeToTimestamp('2024-03-11T15:00:00')

    expect(result.seconds).toMatch(/^\d+$/)
    expect(result.milliseconds).toMatch(/^\d+$/)
  })

  it('throws for invalid values', () => {
    expect(() => parseTimestampInput('abc', 'auto')).toThrow(
      '请输入合法的数字时间戳。',
    )
    expect(() => convertDateTimeToTimestamp('')).toThrow(
      '请输入合法的日期时间。',
    )
  })
})
