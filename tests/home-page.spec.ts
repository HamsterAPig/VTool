import { createPinia } from 'pinia'
import { RouterLinkStub, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import HomePage from '@/features/home/HomePage.vue'

describe('HomePage', () => {
  it('renders the redesigned workspace overview and tool entries', () => {
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
    expect(wrapper.text()).toContain('JSON 工具')
    expect(wrapper.text()).toContain('进入 Git 提交流程')
    expect(wrapper.text()).toContain('打开工时台')
    expect(wrapper.text()).toContain('主题即页面样式')
  })
})
