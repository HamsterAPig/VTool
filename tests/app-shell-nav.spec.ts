import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import AppShell from '@/app/AppShell.vue'
import { router } from '@/router'

describe('AppShell navigation', () => {
  beforeEach(async () => {
    window.history.pushState({}, '', '/')
    await router.push('/')
    await router.isReady()
  })

  it('includes the git commit helper entry in the top navigation', () => {
    const wrapper = mount(AppShell, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.text()).toContain('Git 提交辅助')
  })
})
