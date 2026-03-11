export interface BrowserStorageEnvelope<T> {
  version: number
  data: T
}

interface BrowserStorageOptions<T> {
  storageKey: string
  version: number
  fallback: T
  validate: (value: unknown) => value is T
}

function isEnvelope<T>(
  value: unknown,
  validate: (candidate: unknown) => candidate is T,
): value is BrowserStorageEnvelope<T> {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<BrowserStorageEnvelope<T>>

  return (
    typeof candidate.version === 'number' && validate(candidate.data as unknown)
  )
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

export function createBrowserStorage<T>(options: BrowserStorageOptions<T>) {
  function buildEnvelope(data: T): BrowserStorageEnvelope<T> {
    return {
      version: options.version,
      data,
    }
  }

  function load(): T {
    const raw = window.localStorage.getItem(options.storageKey)

    if (!raw) {
      return options.fallback
    }

    const parsed = safeParse(raw)

    if (!isEnvelope(parsed, options.validate)) {
      return options.fallback
    }

    return parsed.version === options.version ? parsed.data : options.fallback
  }

  function save(data: T) {
    const payload = JSON.stringify(buildEnvelope(data))

    window.localStorage.setItem(options.storageKey, payload)
  }

  function serialize(data: T): string {
    return JSON.stringify(buildEnvelope(data), null, 2)
  }

  function deserialize(raw: string): T {
    const parsed = safeParse(raw)

    if (!isEnvelope(parsed, options.validate)) {
      throw new Error('导入文件格式不正确。')
    }

    if (parsed.version !== options.version) {
      throw new Error('导入文件版本不兼容。')
    }

    return parsed.data
  }

  function clear() {
    window.localStorage.removeItem(options.storageKey)
  }

  return {
    clear,
    deserialize,
    load,
    save,
    serialize,
  }
}
