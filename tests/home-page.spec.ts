import { createPinia, setActivePinia } from 'pinia'
import { RouterLinkStub, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomePage from '@/features/home/HomePage.vue'
import { useThemePreferenceStore } from '@/stores/themePreference'

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    setActivePinia(createPinia())
  })

  function mountHomePage() {
    return mount(HomePage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })
  }

  it('renders the active workspace cards, hero actions, and design principles', () => {
    const wrapper = mountHomePage()

    expect(wrapper.text()).toContain('Git 提交辅助')
    expect(wrapper.text()).toContain('工时日历')
    expect(wrapper.text()).toContain('时间戳转换')
    expect(wrapper.text()).toContain('时间 / 频率换算')
    expect(wrapper.text()).toContain('可直接投入使用的工具')
    expect(wrapper.text()).toContain('进入工作区')
    expect(wrapper.text()).toContain('进入 Git 提交流程')
    expect(wrapper.text()).toContain('主题即页面样式')
  })

  it('renders the iOS 18 hero experience and updates motion variables on pointer move', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const themePreferenceStore = useThemePreferenceStore()
    themePreferenceStore.setTheme('ios-18')

    const wrapper = mount(HomePage, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })
    const hero = wrapper.get('.home-hero')
    const heroElement = hero.element as HTMLElement

    vi.spyOn(heroElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 240,
      height: 240,
      left: 20,
      right: 420,
      top: 40,
      width: 400,
      x: 20,
      y: 40,
      toJSON: () => ({}),
    } as DOMRect)

    heroElement.dispatchEvent(
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 320,
        clientY: 200,
      }),
    )
    await wrapper.vm.$nextTick()

    expect(hero.attributes('data-hero-variant')).toBe('ios-18')
    expect(wrapper.text()).toContain('Liquid Glass Workspace')
    expect(wrapper.text()).toContain('液态玻璃')
    expect(wrapper.text()).toContain('Fluid Glass')
    expect(heroElement.style.getPropertyValue('--hero-pointer-x')).toBe('75%')
    expect(heroElement.style.getPropertyValue('--hero-pointer-y')).toBe('67%')
  })
})
