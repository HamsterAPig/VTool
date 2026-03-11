import { beforeEach, describe, expect, it } from 'vitest'

import {
  exportWorktimeData,
  importWorktimeData,
  loadWorktimeData,
  saveWorktimeData,
} from '@/features/worktime-tool/worktimeStorage'
import { createDefaultWorktimeRuleSet } from '@/features/worktime-tool/worktime'

describe('worktime storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('persists records and rules together', () => {
    const payload = {
      records: {
        '2026-03-01': {
          date: '2026-03-01',
          startTime: '08:30',
          endTime: '17:30',
          updatedAt: '2026-03-01T09:00:00.000Z',
        },
      },
      rules: createDefaultWorktimeRuleSet(),
    }

    saveWorktimeData(payload)

    expect(loadWorktimeData()).toEqual(payload)
  })

  it('imports legacy record-only payloads by injecting default rules', () => {
    const legacyRaw = JSON.stringify({
      version: 1,
      data: {
        '2026-03-01': {
          date: '2026-03-01',
          startTime: '08:30',
          endTime: '17:30',
          updatedAt: '2026-03-01T09:00:00.000Z',
        },
      },
    })

    const imported = importWorktimeData(legacyRaw)

    expect(imported.records['2026-03-01']?.startTime).toBe('08:30')
    expect(imported.rules.weeklyTemplates.monday.name).toContain('周一')
  })

  it('exports a payload that contains both records and rules', () => {
    const payload = {
      records: {},
      rules: createDefaultWorktimeRuleSet(),
    }

    const exported = exportWorktimeData(payload)

    expect(exported).toContain('"records"')
    expect(exported).toContain('"rules"')
  })
})
