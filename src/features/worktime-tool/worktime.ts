export type WeekdayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

export type WorktimeSegmentType = 'paid' | 'unpaid'

export interface WorktimeDayRecord {
  date: string
  startTime: string
  endTime: string
  updatedAt: string
}

export interface WorktimeRuleSegment {
  id: string
  label: string
  start: string
  end: string
  type: WorktimeSegmentType
}

export interface WorktimeDayTemplate {
  name: string
  targetMinutes?: number
  segments: WorktimeRuleSegment[]
}

export interface WorktimeRuleSet {
  version: number
  defaultTargetMinutes: number
  weeklyTemplates: Record<WeekdayKey, WorktimeDayTemplate>
  dateOverrides: Record<string, WorktimeDayTemplate>
}

export interface ResolvedWorktimeRule {
  date: string
  source: 'weekly' | 'override'
  weekdayKey: WeekdayKey
  template: WorktimeDayTemplate
  targetMinutes: number
}

export interface WorktimeStoragePayload {
  records: WorktimeRecordMap
  rules: WorktimeRuleSet
}

export interface WorktimeDaySummary {
  status: 'empty' | 'incomplete' | 'invalid' | 'complete'
  totalMinutes: number
  balanceMinutes: number
  targetMinutes: number
  totalLabel: string
  balanceLabel: string
  targetLabel: string
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

export const WEEKDAY_KEYS: WeekdayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  sunday: '周日',
  monday: '周一',
  tuesday: '周二',
  wednesday: '周三',
  thursday: '周四',
  friday: '周五',
  saturday: '周六',
}

const MINUTES_PER_DAY = 24 * 60

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function createStandardSegments(): WorktimeRuleSegment[] {
  return [
    {
      id: createId('segment'),
      label: '上午班内',
      start: '08:30',
      end: '12:00',
      type: 'paid',
    },
    {
      id: createId('segment'),
      label: '午休',
      start: '12:00',
      end: '13:00',
      type: 'unpaid',
    },
    {
      id: createId('segment'),
      label: '下午班内',
      start: '13:00',
      end: '17:30',
      type: 'paid',
    },
    {
      id: createId('segment'),
      label: '晚餐空档',
      start: '17:30',
      end: '18:00',
      type: 'unpaid',
    },
    {
      id: createId('segment'),
      label: '晚间加班',
      start: '18:00',
      end: '24:00',
      type: 'paid',
    },
  ]
}

export function createDefaultDayTemplate(
  name = '标准班次',
  targetMinutes = 480,
): WorktimeDayTemplate {
  return {
    name,
    targetMinutes,
    segments: createStandardSegments(),
  }
}

export function createDefaultWorktimeRuleSet(): WorktimeRuleSet {
  return {
    version: 1,
    defaultTargetMinutes: 480,
    weeklyTemplates: {
      sunday: createDefaultDayTemplate('周日模板'),
      monday: createDefaultDayTemplate('周一模板'),
      tuesday: createDefaultDayTemplate('周二模板'),
      wednesday: createDefaultDayTemplate('周三模板'),
      thursday: createDefaultDayTemplate('周四模板'),
      friday: createDefaultDayTemplate('周五模板'),
      saturday: createDefaultDayTemplate('周六模板'),
    },
    dateOverrides: {},
  }
}

export function cloneDayTemplate(
  template: WorktimeDayTemplate,
): WorktimeDayTemplate {
  return {
    name: template.name,
    targetMinutes: template.targetMinutes,
    segments: template.segments.map((segment) => ({ ...segment })),
  }
}

export function createEmptyPayload(): WorktimeStoragePayload {
  return {
    records: {},
    rules: createDefaultWorktimeRuleSet(),
  }
}

export function weekdayKeyFromDate(date: Date): WeekdayKey {
  return WEEKDAY_KEYS[date.getDay()] ?? 'sunday'
}

function parseLocalDate(date: string): Date {
  const [yearRaw, monthRaw, dayRaw] = date.split('-')
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)

  return new Date(year, month - 1, day)
}

export function parseTimeValue(value: string): number | null {
  if (!/^(?:[01]\d|2[0-4]):[0-5]\d$/.test(value)) {
    return null
  }

  if (value === '24:00') {
    return MINUTES_PER_DAY
  }

  const [hourRaw, minuteRaw] = value.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null
  }

  return hour * 60 + minute
}

function isMinuteRangeValid(start: number | null, end: number | null): boolean {
  return start !== null && end !== null && start < end
}

function sortSegments(
  segments: WorktimeRuleSegment[],
): Array<WorktimeRuleSegment & { startMinutes: number; endMinutes: number }> {
  return segments
    .map((segment) => ({
      ...segment,
      startMinutes: parseTimeValue(segment.start) ?? -1,
      endMinutes: parseTimeValue(segment.end) ?? -1,
    }))
    .sort((left, right) => left.startMinutes - right.startMinutes)
}

export function validateDayTemplate(
  template: WorktimeDayTemplate,
  defaultTargetMinutes: number,
): string | null {
  const resolvedTargetMinutes = template.targetMinutes ?? defaultTargetMinutes

  return (
    validateTemplateName(template.name) ??
    validateTargetMinutes(resolvedTargetMinutes) ??
    validateSegmentList(template.segments)
  )
}

function validateTemplateName(name: string): string | null {
  return name.trim() ? null : '规则名称不能为空。'
}

function validateTargetMinutes(targetMinutes: number): string | null {
  return Number.isInteger(targetMinutes) && targetMinutes >= 0
    ? null
    : '目标分钟数必须是大于等于 0 的整数。'
}

function validateSegmentList(segments: WorktimeRuleSegment[]): string | null {
  if (segments.length === 0) {
    return '至少需要一个时间段。'
  }

  const sortedSegments = sortSegments(segments)

  return (
    findInvalidSegmentMessage(sortedSegments) ??
    findOverlappingSegmentMessage(sortedSegments)
  )
}

function findInvalidSegmentMessage(
  segments: Array<
    WorktimeRuleSegment & { startMinutes: number; endMinutes: number }
  >,
): string | null {
  const hasInvalidRange = segments.some(
    (segment) =>
      !isMinuteRangeValid(segment.startMinutes, segment.endMinutes) ||
      segment.endMinutes > MINUTES_PER_DAY,
  )

  return hasInvalidRange ? '存在无效的时间段范围。' : null
}

function findOverlappingSegmentMessage(
  segments: Array<
    WorktimeRuleSegment & { startMinutes: number; endMinutes: number }
  >,
): string | null {
  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1]
    const current = segments[index]

    if (previous && current && previous.endMinutes > current.startMinutes) {
      return '时间段不能重叠。'
    }
  }

  return null
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

export function formatMinuteValue(minutes: number): string {
  return `${minutes} 分钟`
}

export function formatDurationHours(minutes: number): string {
  const normalizedMinutes = Math.abs(minutes)
  const hours = Math.floor(normalizedMinutes / 60)
  const remainingMinutes = normalizedMinutes % 60

  return `${hours}小时${String(remainingMinutes).padStart(2, '0')}分钟`
}

export function formatBalanceMinutes(minutes: number): string {
  if (minutes === 0) {
    return '0 分钟'
  }

  const prefix = minutes > 0 ? '+' : '-'

  return `${prefix}${Math.abs(minutes)} 分钟`
}

export function normalizeEditableTimeValue(raw: string): string {
  const trimmed = raw.trim()

  if (!trimmed) {
    return ''
  }

  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [hourRaw, minuteRaw] = trimmed.split(':')
    const hour = hourRaw?.padStart(2, '0') ?? ''

    return `${hour}:${minuteRaw ?? ''}`
  }

  if (/^\d{3,4}$/.test(trimmed)) {
    const normalized = trimmed.padStart(4, '0')
    const hour = normalized.slice(0, 2)
    const minute = normalized.slice(2)

    return `${hour}:${minute}`
  }

  return trimmed
}

function buildStatusSummary(
  status: WorktimeDaySummary['status'],
  targetMinutes: number,
  message: string,
  totalMinutes = 0,
  balanceMinutes = 0,
): WorktimeDaySummary {
  return {
    status,
    totalMinutes,
    balanceMinutes,
    targetMinutes,
    totalLabel: formatMinuteValue(totalMinutes),
    balanceLabel: formatBalanceMinutes(balanceMinutes),
    targetLabel: formatMinuteValue(targetMinutes),
    message,
  }
}

export function resolveRuleForDate(
  date: string,
  ruleSet: WorktimeRuleSet,
): ResolvedWorktimeRule {
  const dateObject = parseLocalDate(date)
  const weekdayKey = weekdayKeyFromDate(dateObject)
  const overrideTemplate = ruleSet.dateOverrides[date]
  const template = overrideTemplate ?? ruleSet.weeklyTemplates[weekdayKey]
  const targetMinutes = template?.targetMinutes ?? ruleSet.defaultTargetMinutes

  return {
    date,
    source: overrideTemplate ? 'override' : 'weekly',
    weekdayKey,
    template: template
      ? cloneDayTemplate(template)
      : createDefaultDayTemplate(),
    targetMinutes,
  }
}

export function calculateWorktime(
  record: Pick<WorktimeDayRecord, 'startTime' | 'endTime'>,
  rule: ResolvedWorktimeRule,
): WorktimeDaySummary {
  if (!record.startTime && !record.endTime) {
    return buildStatusSummary(
      'empty',
      rule.targetMinutes,
      '当天还没有录入时间。',
    )
  }

  if (!record.startTime || !record.endTime) {
    return buildStatusSummary(
      'incomplete',
      rule.targetMinutes,
      '请同时填写上班和下班时间。',
      0,
      -rule.targetMinutes,
    )
  }

  const startMinutes = parseTimeValue(record.startTime)
  const endMinutes = parseTimeValue(record.endTime)

  if (!isMinuteRangeValid(startMinutes, endMinutes)) {
    return buildStatusSummary(
      'invalid',
      rule.targetMinutes,
      '下班时间必须晚于上班时间。',
    )
  }

  const templateError = validateDayTemplate(rule.template, rule.targetMinutes)

  if (templateError) {
    return buildStatusSummary('invalid', rule.targetMinutes, templateError)
  }

  const totalMinutes = rule.template.segments
    .filter((segment) => segment.type === 'paid')
    .reduce((sum, segment) => {
      const rangeStart = parseTimeValue(segment.start) ?? 0
      const rangeEnd = parseTimeValue(segment.end) ?? 0

      return (
        sum +
        overlapMinutes(startMinutes ?? 0, endMinutes ?? 0, rangeStart, rangeEnd)
      )
    }, 0)
  const balanceMinutes = totalMinutes - rule.targetMinutes

  return buildStatusSummary(
    'complete',
    rule.targetMinutes,
    '已按当前规则完成计算。',
    totalMinutes,
    balanceMinutes,
  )
}

export function summarizeMonth(
  records: WorktimeDayRecord[],
  ruleSet: WorktimeRuleSet,
): WorktimeMonthSummary {
  const recordedSummaries = records
    .map((record) =>
      calculateWorktime(record, resolveRuleForDate(record.date, ruleSet)),
    )
    .filter((summary) => summary.status === 'complete')
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
    totalLabel: formatDurationHours(totalMinutes),
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

function isWeekdayTemplateMap(
  value: unknown,
): value is Record<WeekdayKey, WorktimeDayTemplate> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  return WEEKDAY_KEYS.every((key) =>
    isWorktimeDayTemplate((value as Record<string, unknown>)[key]),
  )
}

export function isWorktimeRuleSegment(
  value: unknown,
): value is WorktimeRuleSegment {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<WorktimeRuleSegment>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.label === 'string' &&
    typeof candidate.start === 'string' &&
    typeof candidate.end === 'string' &&
    (candidate.type === 'paid' || candidate.type === 'unpaid')
  )
}

export function isWorktimeDayTemplate(
  value: unknown,
): value is WorktimeDayTemplate {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<WorktimeDayTemplate>

  return (
    typeof candidate.name === 'string' &&
    (candidate.targetMinutes === undefined ||
      Number.isInteger(candidate.targetMinutes)) &&
    Array.isArray(candidate.segments) &&
    candidate.segments.every(isWorktimeRuleSegment)
  )
}

export function isWorktimeRuleSet(value: unknown): value is WorktimeRuleSet {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<WorktimeRuleSet>

  return (
    typeof candidate.version === 'number' &&
    Number.isInteger(candidate.defaultTargetMinutes) &&
    isWeekdayTemplateMap(candidate.weeklyTemplates) &&
    Boolean(
      candidate.dateOverrides &&
      typeof candidate.dateOverrides === 'object' &&
      !Array.isArray(candidate.dateOverrides) &&
      Object.values(candidate.dateOverrides).every(isWorktimeDayTemplate),
    )
  )
}

export function isWorktimeStoragePayload(
  value: unknown,
): value is WorktimeStoragePayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<WorktimeStoragePayload>

  return (
    isWorktimeRecordMap(candidate.records) && isWorktimeRuleSet(candidate.rules)
  )
}

export function createRuleSegment(
  type: WorktimeSegmentType = 'paid',
): WorktimeRuleSegment {
  return {
    id: createId('segment'),
    label: type === 'paid' ? '计薪段' : '不计薪段',
    start: '09:00',
    end: '10:00',
    type,
  }
}
