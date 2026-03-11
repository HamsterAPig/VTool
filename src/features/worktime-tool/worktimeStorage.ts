import { createBrowserStorage } from '@/utils/browserStorage'
import {
  type WorktimeRecordMap,
  isWorktimeRecordMap,
} from '@/features/worktime-tool/worktime'

const storage = createBrowserStorage<WorktimeRecordMap>({
  storageKey: 'vtool.worktime.records',
  version: 1,
  fallback: {},
  validate: isWorktimeRecordMap,
})

export function loadWorktimeRecords() {
  return storage.load()
}

export function saveWorktimeRecords(records: WorktimeRecordMap) {
  storage.save(records)
}

export function exportWorktimeRecords(records: WorktimeRecordMap): string {
  return storage.serialize(records)
}

export function importWorktimeRecords(raw: string): WorktimeRecordMap {
  return storage.deserialize(raw)
}

export function clearWorktimeRecords() {
  storage.clear()
}
