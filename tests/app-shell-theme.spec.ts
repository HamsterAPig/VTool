import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import AppShell from '@/app/AppShell.vue'
import { router } from '@/router'

const THEME_STORAGE_KEY = 'vtool-theme-preference'

describe('AppShell theme switching', () => {
  beforeEach(async () => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.head
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((element) => element.remove())

    window.history.pushState({}, '', '/')
    await router.push('/')
    await router.isReady()
  })

  it('restores the saved theme on mount', () => {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        data: 'jade-atelier',
      }),
    )

    const wrapper = mount(AppShell, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.text()).toContain('玉影雅室')
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'jade-atelier',
    )
  })

  it('switches theme from the header control and persists the selection', async () => {
    const wrapper = mount(AppShell, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    await wrapper.get('.theme-switcher__trigger').trigger('click')
    await nextTick()

    const roseThemeOption = wrapper
      .findAll('.theme-switcher__option')
      .find((option) => option.text().includes('玫瑰实验室'))

    expect(roseThemeOption).toBeDefined()

    await roseThemeOption?.trigger('click')
    await nextTick()

    expect(document.documentElement.getAttribute('data-theme')).toBe('rose-lab')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toContain('rose-lab')
    expect(wrapper.text()).toContain('玫瑰实验室')
  })
})
