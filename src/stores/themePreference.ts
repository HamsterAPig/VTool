import { defineStore } from 'pinia'

import {
  DEFAULT_THEME_ID,
  getThemeOption,
  isThemeId,
  themeOptions,
  type ThemeId,
} from '@/features/theme/theme'
import { createBrowserStorage } from '@/utils/browserStorage'

const THEME_STORAGE_KEY = 'vtool-theme-preference'
const THEME_STORAGE_VERSION = 1
const THEME_ATTRIBUTE = 'data-theme'
const THEME_META_NAME = 'theme-color'

function getThemePreferenceStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return createBrowserStorage<ThemeId>({
    storageKey: THEME_STORAGE_KEY,
    version: THEME_STORAGE_VERSION,
    fallback: DEFAULT_THEME_ID,
    validate: isThemeId,
  })
}

function upsertThemeMeta(themeColor: string) {
  if (typeof document === 'undefined') {
    return
  }

  let meta = document.querySelector(
    `meta[name="${THEME_META_NAME}"]`,
  ) as HTMLMetaElement | null

  if (!meta) {
    meta = document.createElement('meta')
    meta.name = THEME_META_NAME
    document.head.append(meta)
  }

  meta.content = themeColor
}

export function loadThemePreference(): ThemeId {
  return getThemePreferenceStorage()?.load() ?? DEFAULT_THEME_ID
}

export function applyThemeToDocument(themeId: ThemeId) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute(THEME_ATTRIBUTE, themeId)
  document.documentElement.style.colorScheme = 'light'
  upsertThemeMeta(getThemeOption(themeId).browserThemeColor)
}

export const useThemePreferenceStore = defineStore('themePreference', {
  state: () => ({
    currentThemeId: loadThemePreference() as ThemeId,
  }),
  getters: {
    availableThemes: () => themeOptions,
    currentTheme(state) {
      return getThemeOption(state.currentThemeId)
    },
  },
  actions: {
    initialize() {
      const themeId = loadThemePreference()

      this.currentThemeId = themeId
      applyThemeToDocument(themeId)
    },
    setTheme(themeId: ThemeId) {
      if (!isThemeId(themeId)) {
        return
      }

      this.currentThemeId = themeId
      getThemePreferenceStorage()?.save(themeId)
      applyThemeToDocument(themeId)
    },
  },
})
