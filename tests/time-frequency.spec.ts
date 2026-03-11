import { describe, expect, it } from 'vitest'

import {
  buildTimeFrequencyResult,
  convertReciprocalDimension,
  convertWithinDimension,
  formatDisplayNumber,
  parseInputValue,
  pickBestUnit,
} from '@/features/time-frequency-tool/timeFrequency'

describe('time frequency utilities', () => {
  it('parses floating-point and scientific input values', () => {
    expect(parseInputValue('0.5')).toBe(0.5)
    expect(parseInputValue('1e6')).toBe(1_000_000)
  })

  it('converts time units within the same dimension', () => {
    const items = convertWithinDimension(0.5, 'ms')
    const microseconds = items.find((item) => item.unit === 'us')

    expect(microseconds?.display).toBe('500 us')
  })

  it('converts time to reciprocal frequency', () => {
    const items = convertReciprocalDimension(0.5, 'ms')
    const kilohertz = items.find((item) => item.unit === 'kHz')

    expect(kilohertz?.display).toBe('2 kHz')
  })

  it('converts frequency to reciprocal time', () => {
    const items = convertReciprocalDimension(50, 'Hz')
    const milliseconds = items.find((item) => item.unit === 'ms')

    expect(milliseconds?.display).toBe('20 ms')
  })

  it('formats repeating decimals with readable precision', () => {
    const items = convertReciprocalDimension(1.5, 'MHz')
    const microseconds = items.find((item) => item.unit === 'us')

    expect(microseconds?.display).toBe('0.666667 us')
    expect(formatDisplayNumber(0.30000000000000004)).toBe('0.3')
  })

  it('selects the most readable unit in a conversion set', () => {
    const preferred = pickBestUnit(convertReciprocalDimension(0.5, 'ms'))

    expect(preferred.display).toBe('2 kHz')
  })

  it('returns partial success for non-positive reciprocal conversions', () => {
    const result = buildTimeFrequencyResult('0', 'ms')

    expect(
      result.sameDimensionGroup.items.find((item) => item.unit === 'us')
        ?.display,
    ).toBe('0 us')
    expect(result.reciprocalGroup.status).toBe('error')
  })

  it('throws for invalid input text', () => {
    expect(() => parseInputValue('')).toThrow('请输入要换算的数值。')
    expect(() => parseInputValue('abc')).toThrow(
      '请输入合法的数字，支持浮点数和科学计数法。',
    )
  })
})
