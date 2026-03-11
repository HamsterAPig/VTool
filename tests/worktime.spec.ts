import { describe, expect, it } from 'vitest'

import {
  calculateWorktime,
  createDefaultWorktimeRuleSet,
  resolveRuleForDate,
  summarizeMonth,
  type WorktimeDayRecord,
} from '@/features/worktime-tool/worktime'

describe('worktime utilities', () => {
  const ruleSet = createDefaultWorktimeRuleSet()

  it('calculates a standard workday as 480 minutes', () => {
    const summary = calculateWorktime(
      {
        startTime: '08:30',
        endTime: '17:30',
      },
      resolveRuleForDate('2026-03-11', ruleSet),
    )

    expect(summary.status).toBe('complete')
    expect(summary.totalMinutes).toBe(480)
    expect(summary.balanceMinutes).toBe(0)
    expect(summary.totalLabel).toBe('480 分钟')
  })

  it('ignores pre-shift time and the 17:30 to 18:00 gap', () => {
    const summary = calculateWorktime(
      {
        startTime: '08:00',
        endTime: '18:30',
      },
      resolveRuleForDate('2026-03-12', ruleSet),
    )

    expect(summary.status).toBe('complete')
    expect(summary.totalMinutes).toBe(510)
    expect(summary.balanceMinutes).toBe(30)
    expect(summary.balanceLabel).toBe('+30 分钟')
  })

  it('returns an invalid result when end time is earlier than start time', () => {
    const summary = calculateWorktime(
      {
        startTime: '18:30',
        endTime: '08:30',
      },
      resolveRuleForDate('2026-03-13', ruleSet),
    )

    expect(summary.status).toBe('invalid')
    expect(summary.message).toBe('下班时间必须晚于上班时间。')
  })

  it('prefers date override rules over weekday templates', () => {
    const customRuleSet = createDefaultWorktimeRuleSet()

    customRuleSet.dateOverrides['2026-03-15'] = {
      name: '半天例外',
      targetMinutes: 240,
      segments: [
        {
          id: 'half-day',
          label: '上午',
          start: '09:00',
          end: '13:00',
          type: 'paid',
        },
      ],
    }

    const summary = calculateWorktime(
      {
        startTime: '09:00',
        endTime: '13:00',
      },
      resolveRuleForDate('2026-03-15', customRuleSet),
    )

    expect(summary.status).toBe('complete')
    expect(summary.totalMinutes).toBe(240)
    expect(summary.balanceMinutes).toBe(0)
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

    const summary = summarizeMonth(records, ruleSet)

    expect(summary.recordedDays).toBe(2)
    expect(summary.totalMinutes).toBe(960)
    expect(summary.totalLabel).toBe('16小时00分钟')
    expect(summary.balanceMinutes).toBe(0)
    expect(summary.balanceLabel).toBe('0 分钟')
  })
})
