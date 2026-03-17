import { createPinia } from 'pinia'
import { RouterLinkStub, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import HomePage from '@/features/home/HomePage.vue'

describe('HomePage', () => {
  it('renders the active workspace cards and design principles', () => {
    const wrapper = mount(HomePage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.text()).toContain('Git 提交辅助')
    expect(wrapper.text()).toContain('工时日历')
    expect(wrapper.text()).toContain('时间戳转换')
    expect(wrapper.text()).toContain('时间 / 频率换算')
    expect(wrapper.text()).toContain('可直接投入使用的工具')
    expect(wrapper.text()).toContain('进入工作区')
    expect(wrapper.text()).toContain('主题即页面样式')
  })
})
