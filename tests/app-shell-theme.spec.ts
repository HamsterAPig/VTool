import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import AppShell from '@/app/AppShell.vue'
import { router } from '@/router'

const THEME_STORAGE_KEY = 'vtool-theme-preference'

describe('AppShell theme switching', () => {
  beforeEach(async () => {
    localStorage.clear()
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('data-theme')
    document.head
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((element) => element.remove())

    window.history.pushState({}, '', '/')
    await router.push('/')
    await router.isReady()
  })

  afterEach(() => {
    document.body.innerHTML = ''
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
      attachTo: document.body,
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.text()).toContain('玉影雅室')
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'jade-atelier',
    )

    wrapper.unmount()
  })

  it('switches theme from the header control and persists the selection', async () => {
    const wrapper = mount(AppShell, {
      attachTo: document.body,
      global: {
        plugins: [createPinia(), router],
      },
    })

    await wrapper.get('.theme-switcher__trigger').trigger('click')
    await nextTick()

    const panel = document.body.querySelector(
      '.theme-switcher__panel',
    ) as HTMLDivElement | null
    const roseThemeOption = Array.from(
      document.body.querySelectorAll('.theme-switcher__option'),
    ).find((option) => option.textContent?.includes('玫瑰实验室'))

    expect(panel).not.toBeNull()
    expect(panel?.style.left).not.toBe('')
    expect(panel?.style.width).not.toBe('')
    expect(roseThemeOption).toBeDefined()
    ;(roseThemeOption as HTMLButtonElement | undefined)?.click()
    await nextTick()

    expect(document.documentElement.getAttribute('data-theme')).toBe('rose-lab')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toContain('rose-lab')
    expect(document.body.querySelector('.theme-switcher__panel')).toBeNull()
    expect(wrapper.text()).toContain('玫瑰实验室')

    wrapper.unmount()
  })

  it('closes the teleported panel when clicking outside', async () => {
    const wrapper = mount(AppShell, {
      attachTo: document.body,
      global: {
        plugins: [createPinia(), router],
      },
    })

    await wrapper.get('.theme-switcher__trigger').trigger('click')
    await nextTick()

    expect(document.body.querySelector('.theme-switcher__panel')).not.toBeNull()

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()

    expect(document.body.querySelector('.theme-switcher__panel')).toBeNull()

    wrapper.unmount()
  })

  it('closes the teleported panel on escape', async () => {
    const wrapper = mount(AppShell, {
      attachTo: document.body,
      global: {
        plugins: [createPinia(), router],
      },
    })

    await wrapper.get('.theme-switcher__trigger').trigger('click')
    await nextTick()

    expect(document.body.querySelector('.theme-switcher__panel')).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(document.body.querySelector('.theme-switcher__panel')).toBeNull()

    wrapper.unmount()
  })
})
