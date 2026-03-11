import {
  createDefaultWorktimeRuleSet,
  createEmptyPayload,
  isWorktimeRecordMap,
  isWorktimeStoragePayload,
  type WorktimeRecordMap,
  type WorktimeStoragePayload,
} from '@/features/worktime-tool/worktime'

const STORAGE_KEY = 'vtool.worktime.data'
const LEGACY_STORAGE_KEY = 'vtool.worktime.records'
const STORAGE_VERSION = 2

interface StorageEnvelope<T> {
  version: number
  data: T
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function isEnvelope<T>(
  value: unknown,
  validate: (candidate: unknown) => candidate is T,
): value is StorageEnvelope<T> {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StorageEnvelope<T>>

  return (
    typeof candidate.version === 'number' && validate(candidate.data as unknown)
  )
}

function createEnvelope(
  data: WorktimeStoragePayload,
): StorageEnvelope<WorktimeStoragePayload> {
  return {
    version: STORAGE_VERSION,
    data,
  }
}

function migrateLegacyRecords(
  records: WorktimeRecordMap,
): WorktimeStoragePayload {
  return {
    records,
    rules: createDefaultWorktimeRuleSet(),
  }
}

function parseImportedPayload(raw: string): WorktimeStoragePayload {
  const parsed = parseJson(raw)

  if (isEnvelope(parsed, isWorktimeStoragePayload)) {
    return parsed.data
  }

  if (isEnvelope(parsed, isWorktimeRecordMap)) {
    return migrateLegacyRecords(parsed.data)
  }

  if (isWorktimeStoragePayload(parsed)) {
    return parsed
  }

  if (isWorktimeRecordMap(parsed)) {
    return migrateLegacyRecords(parsed)
  }

  throw new Error('导入文件格式不正确。')
}

function readStorage(key: string): string | null {
  return window.localStorage.getItem(key)
}

function writeStorage(payload: WorktimeStoragePayload) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(createEnvelope(payload)),
  )
}

export function loadWorktimeData(): WorktimeStoragePayload {
  const currentRaw = readStorage(STORAGE_KEY)

  if (currentRaw) {
    try {
      return parseImportedPayload(currentRaw)
    } catch {
      return createEmptyPayload()
    }
  }

  const legacyRaw = readStorage(LEGACY_STORAGE_KEY)

  if (!legacyRaw) {
    return createEmptyPayload()
  }

  try {
    const migratedPayload = parseImportedPayload(legacyRaw)

    writeStorage(migratedPayload)
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    return migratedPayload
  } catch {
    return createEmptyPayload()
  }
}

export function saveWorktimeData(payload: WorktimeStoragePayload) {
  writeStorage(payload)
}

export function exportWorktimeData(payload: WorktimeStoragePayload): string {
  return JSON.stringify(createEnvelope(payload), null, 2)
}

export function importWorktimeData(raw: string): WorktimeStoragePayload {
  return parseImportedPayload(raw)
}

export function clearWorktimeData() {
  window.localStorage.removeItem(STORAGE_KEY)
}
