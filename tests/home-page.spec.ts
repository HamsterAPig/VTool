import { createPinia } from 'pinia'
import { RouterLinkStub, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import HomePage from '@/features/home/HomePage.vue'

describe('HomePage', () => {
  it('renders the timestamp tool entry and upcoming tools', () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.text()).toContain('时间戳转换')
    expect(wrapper.text()).toContain('JSON 工具')
    expect(wrapper.text()).toContain('立即使用时间戳转换')
  })
})
