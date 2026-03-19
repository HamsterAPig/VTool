import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_THEME_ID, isThemeId } from '@/features/theme/theme'
import {
  applyThemeToDocument,
  loadThemePreference,
  useThemePreferenceStore,
} from '@/stores/themePreference'

const THEME_STORAGE_KEY = 'vtool-theme-preference'

describe('theme preference', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.head
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((element) => element.remove())
    setActivePinia(createPinia())
  })

  it('validates supported theme ids', () => {
    expect(isThemeId('aurora-mist')).toBe(true)
    expect(isThemeId('jade-atelier')).toBe(true)
    expect(isThemeId('rose-lab')).toBe(true)
    expect(isThemeId('ios-18')).toBe(true)
    expect(isThemeId('warm-brown')).toBe(false)
  })

  it('falls back to the default theme when local storage is invalid', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'not-json')

    expect(loadThemePreference()).toBe(DEFAULT_THEME_ID)
  })

  it('hydrates the store from storage and applies the theme to the document', () => {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        data: 'jade-atelier',
      }),
    )

    const store = useThemePreferenceStore()

    store.initialize()

    expect(store.currentThemeId).toBe('jade-atelier')
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'jade-atelier',
    )
  })

  it('updates document theme metadata when applying a theme', () => {
    applyThemeToDocument('ios-18')

    const themeMeta = document.head.querySelector(
      'meta[name="theme-color"]',
    ) as HTMLMetaElement | null

    expect(document.documentElement.getAttribute('data-theme')).toBe('ios-18')
    expect(themeMeta?.content).toBe('#f4f6ff')
  })
})
