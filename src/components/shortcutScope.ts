/* eslint-disable no-unused-vars */

export interface ShortcutBinding {
  keys: string | string[]
  handler: (_event: KeyboardEvent) => void
  preventDefault?: boolean
  stopPropagation?: boolean
  enabled?: boolean
  allowInInput?: boolean
}
