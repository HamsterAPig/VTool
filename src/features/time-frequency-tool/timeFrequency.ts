export type ConversionDimension = 'time' | 'frequency'
export type TimeUnit = 's' | 'ms' | 'us' | 'ns'
export type FrequencyUnit = 'Hz' | 'kHz' | 'MHz' | 'GHz'
export type SupportedUnit = TimeUnit | FrequencyUnit

interface UnitDefinition<TUnit extends SupportedUnit = SupportedUnit> {
  unit: TUnit
  label: string
  dimension: ConversionDimension
  factor: number
}

export interface ConversionResultItem {
  key: string
  label: string
  unit: SupportedUnit
  dimension: ConversionDimension
  value: number
  displayValue: string
  display: string
}

export interface ConversionGroup {
  title: string
  dimension: ConversionDimension
  preferred: ConversionResultItem
  items: ConversionResultItem[]
}

export interface ReciprocalGroupSuccess extends ConversionGroup {
  status: 'success'
}

export interface ReciprocalGroupError {
  status: 'error'
  title: string
  dimension: ConversionDimension
  message: string
}

export type ReciprocalGroup = ReciprocalGroupSuccess | ReciprocalGroupError

export interface TimeFrequencyConversionResult {
  sourceDimension: ConversionDimension
  sourceValue: number
  sourceUnit: SupportedUnit
  sourceDisplay: string
  sameDimensionGroup: ConversionGroup
  reciprocalGroup: ReciprocalGroup
}

const TIME_UNIT_DEFINITIONS: UnitDefinition<TimeUnit>[] = [
  { unit: 's', label: '秒', dimension: 'time', factor: 1 },
  { unit: 'ms', label: '毫秒', dimension: 'time', factor: 1e-3 },
  { unit: 'us', label: '微秒', dimension: 'time', factor: 1e-6 },
  { unit: 'ns', label: '纳秒', dimension: 'time', factor: 1e-9 },
]

const FREQUENCY_UNIT_DEFINITIONS: UnitDefinition<FrequencyUnit>[] = [
  { unit: 'Hz', label: '赫兹', dimension: 'frequency', factor: 1 },
  { unit: 'kHz', label: '千赫', dimension: 'frequency', factor: 1e3 },
  { unit: 'MHz', label: '兆赫', dimension: 'frequency', factor: 1e6 },
  { unit: 'GHz', label: '吉赫', dimension: 'frequency', factor: 1e9 },
]

const UNIT_DEFINITIONS: Record<SupportedUnit, UnitDefinition> = {
  s: { unit: 's', label: '秒', dimension: 'time', factor: 1 },
  ms: { unit: 'ms', label: '毫秒', dimension: 'time', factor: 1e-3 },
  us: { unit: 'us', label: '微秒', dimension: 'time', factor: 1e-6 },
  ns: { unit: 'ns', label: '纳秒', dimension: 'time', factor: 1e-9 },
  Hz: { unit: 'Hz', label: '赫兹', dimension: 'frequency', factor: 1 },
  kHz: { unit: 'kHz', label: '千赫', dimension: 'frequency', factor: 1e3 },
  MHz: { unit: 'MHz', label: '兆赫', dimension: 'frequency', factor: 1e6 },
  GHz: { unit: 'GHz', label: '吉赫', dimension: 'frequency', factor: 1e9 },
}

export const TIME_UNITS = TIME_UNIT_DEFINITIONS.map((item) => ({
  unit: item.unit,
  label: item.label,
}))

export const FREQUENCY_UNITS = FREQUENCY_UNIT_DEFINITIONS.map((item) => ({
  unit: item.unit,
  label: item.label,
}))

export function getUnitDimension(unit: SupportedUnit): ConversionDimension {
  return UNIT_DEFINITIONS[unit].dimension
}

export function parseInputValue(raw: string): number {
  const value = Number(raw.trim())

  if (!raw.trim()) {
    throw new Error('请输入要换算的数值。')
  }

  if (!Number.isFinite(value)) {
    throw new Error('请输入合法的数字，支持浮点数和科学计数法。')
  }

  return value
}

function normalizeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value
}

function trimScientificNotation(raw: string): string {
  const [coefficient = raw, exponent = '0'] = raw.split('e')

  return `${coefficient.replace(/\.?0+$/, '')}e${exponent}`
}

export function formatDisplayNumber(value: number): string {
  const normalized = normalizeZero(value)
  const absoluteValue = Math.abs(normalized)

  if (absoluteValue === 0) {
    return '0'
  }

  if (absoluteValue >= 1e9 || absoluteValue < 1e-6) {
    return trimScientificNotation(normalized.toExponential(6))
  }

  const rounded = Number(normalized.toFixed(6))

  if (Number.isInteger(rounded)) {
    return String(rounded)
  }

  return rounded.toString()
}

function formatDisplay(value: number, unit: SupportedUnit): string {
  return `${formatDisplayNumber(value)} ${unit}`
}

function getDefinitionsByDimension(
  dimension: ConversionDimension,
): UnitDefinition[] {
  return dimension === 'time'
    ? [...TIME_UNIT_DEFINITIONS]
    : [...FREQUENCY_UNIT_DEFINITIONS]
}

function getReciprocalDimension(
  dimension: ConversionDimension,
): ConversionDimension {
  return dimension === 'time' ? 'frequency' : 'time'
}

function toBaseValue(value: number, unit: SupportedUnit): number {
  return value * UNIT_DEFINITIONS[unit].factor
}

export function convertWithinDimension(
  value: number,
  fromUnit: SupportedUnit,
): ConversionResultItem[] {
  const definition = UNIT_DEFINITIONS[fromUnit]
  const baseValue = toBaseValue(value, fromUnit)

  return getDefinitionsByDimension(definition.dimension).map((item) => {
    const convertedValue = normalizeZero(baseValue / item.factor)

    return {
      key: `${definition.dimension}-${item.unit}`,
      label: `${item.label} (${item.unit})`,
      unit: item.unit,
      dimension: item.dimension,
      value: convertedValue,
      displayValue: formatDisplayNumber(convertedValue),
      display: formatDisplay(convertedValue, item.unit),
    }
  })
}

function convertReciprocalBase(value: number, fromUnit: SupportedUnit): number {
  const baseValue = toBaseValue(value, fromUnit)

  if (baseValue <= 0) {
    throw new Error('时间与频率互转需要输入大于 0 的数值。')
  }

  const reciprocalBaseValue = 1 / baseValue

  if (!Number.isFinite(reciprocalBaseValue)) {
    throw new Error('当前输入超出可换算范围，请调整数值后再试。')
  }

  return reciprocalBaseValue
}

export function convertReciprocalDimension(
  value: number,
  fromUnit: SupportedUnit,
): ConversionResultItem[] {
  const reciprocalBaseValue = convertReciprocalBase(value, fromUnit)
  const reciprocalDimension = getReciprocalDimension(getUnitDimension(fromUnit))

  return getDefinitionsByDimension(reciprocalDimension).map((item) => {
    const convertedValue = normalizeZero(reciprocalBaseValue / item.factor)

    return {
      key: `${reciprocalDimension}-${item.unit}`,
      label: `${item.label} (${item.unit})`,
      unit: item.unit,
      dimension: item.dimension,
      value: convertedValue,
      displayValue: formatDisplayNumber(convertedValue),
      display: formatDisplay(convertedValue, item.unit),
    }
  })
}

function computePreferredScore(value: number): number {
  const absoluteValue = Math.abs(value)

  if (absoluteValue === 0) {
    return Number.POSITIVE_INFINITY
  }

  if (absoluteValue >= 1 && absoluteValue < 100) {
    return 0
  }

  if (absoluteValue >= 100 && absoluteValue < 1000) {
    return absoluteValue - 100
  }

  if (absoluteValue < 1) {
    return 1 - absoluteValue
  }

  return absoluteValue - 1000 + 1000
}

export function pickBestUnit(
  items: ConversionResultItem[],
): ConversionResultItem {
  const inRange = items.filter((item) => {
    const absoluteValue = Math.abs(item.value)

    return absoluteValue >= 1 && absoluteValue < 1000
  })

  const candidates = inRange.length > 0 ? inRange : items

  return [...candidates].sort((left, right) => {
    const scoreDelta =
      computePreferredScore(left.value) - computePreferredScore(right.value)

    if (scoreDelta !== 0) {
      return scoreDelta
    }

    return Math.abs(left.value) - Math.abs(right.value)
  })[0]!
}

function buildGroup(
  title: string,
  dimension: ConversionDimension,
  items: ConversionResultItem[],
): ConversionGroup {
  return {
    title,
    dimension,
    preferred: pickBestUnit(items),
    items,
  }
}

export function buildTimeFrequencyResult(
  raw: string,
  unit: SupportedUnit,
): TimeFrequencyConversionResult {
  const sourceValue = parseInputValue(raw)
  const sourceDimension = getUnitDimension(unit)
  const sameDimensionItems = convertWithinDimension(sourceValue, unit)
  const sourceDisplay = formatDisplay(sourceValue, unit)

  let reciprocalGroup: ReciprocalGroup

  try {
    reciprocalGroup = {
      status: 'success',
      ...buildGroup(
        sourceDimension === 'time' ? '对应频率' : '对应时间',
        getReciprocalDimension(sourceDimension),
        convertReciprocalDimension(sourceValue, unit),
      ),
    }
  } catch (error) {
    reciprocalGroup = {
      status: 'error',
      title: sourceDimension === 'time' ? '对应频率' : '对应时间',
      dimension: getReciprocalDimension(sourceDimension),
      message:
        error instanceof Error ? error.message : '换算失败，请检查输入内容。',
    }
  }

  return {
    sourceDimension,
    sourceValue,
    sourceUnit: unit,
    sourceDisplay,
    sameDimensionGroup: buildGroup(
      sourceDimension === 'time' ? '时间单位换算' : '频率单位换算',
      sourceDimension,
      sameDimensionItems,
    ),
    reciprocalGroup,
  }
}
