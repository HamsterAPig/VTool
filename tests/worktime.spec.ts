import { describe, expect, it } from 'vitest'

import {
  calculateWorktime,
  summarizeMonth,
  type WorktimeDayRecord,
} from '@/features/worktime-tool/worktime'

describe('worktime utilities', () => {
  it('calculates a standard workday as eight hours', () => {
    const summary = calculateWorktime('08:30', '17:30')

    expect(summary.status).toBe('complete')
    expect(summary.totalMinutes).toBe(480)
    expect(summary.balanceMinutes).toBe(0)
    expect(summary.totalLabel).toBe('8小时00分钟')
  })

  it('ignores pre-shift time and the 17:30 to 18:00 gap', () => {
    const summary = calculateWorktime('08:00', '18:30')

    expect(summary.status).toBe('complete')
    expect(summary.totalMinutes).toBe(510)
    expect(summary.balanceMinutes).toBe(30)
    expect(summary.balanceLabel).toBe('+0小时30分钟')
  })

  it('returns an invalid result when end time is earlier than start time', () => {
    const summary = calculateWorktime('18:30', '08:30')

    expect(summary.status).toBe('invalid')
    expect(summary.message).toBe('下班时间必须晚于上班时间。')
  })

  it('summarizes only complete days in a month', () => {
    const records: WorktimeDayRecord[] = [
      {
        date: '2026-03-01',
        startTime: '08:30',
        endTime: '17:30',
        updatedAt: '2026-03-01T10:00:00.000Z',
      },
      {
        date: '2026-03-02',
        startTime: '09:00',
        endTime: '18:30',
        updatedAt: '2026-03-02T10:00:00.000Z',
      },
      {
        date: '2026-03-03',
        startTime: '08:30',
        endTime: '',
        updatedAt: '2026-03-03T10:00:00.000Z',
      },
    ]

    const summary = summarizeMonth(records)

    expect(summary.recordedDays).toBe(2)
    expect(summary.totalMinutes).toBe(960)
    expect(summary.balanceMinutes).toBe(0)
    expect(summary.balanceLabel).toBe('0分钟')
  })
})
