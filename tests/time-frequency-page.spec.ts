import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TimeFrequencyToolPage from '@/features/time-frequency-tool/TimeFrequencyToolPage.vue'

describe('TimeFrequencyToolPage', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders the tool and shows reciprocal frequency by default', () => {
    const wrapper = mount(TimeFrequencyToolPage, {
      attachTo: document.body,
    })

    expect(wrapper.text()).toContain('时间 / 频率换算')
    expect(wrapper.get('#time-frequency-unit').text()).toContain('毫秒 (ms)')
    expect(wrapper.text()).toContain('2 kHz')
    expect(wrapper.text()).toContain('500 us')
    expect(wrapper.text()).toContain('输入后自动换算')
  })

  it('switches to frequency input and recalculates reciprocal time', async () => {
    const wrapper = mount(TimeFrequencyToolPage, {
      attachTo: document.body,
    })

    await wrapper.findAll('.segment__item')[1]!.trigger('click')

    expect(wrapper.get('#time-frequency-unit').text()).toContain('赫兹 (Hz)')
    expect(wrapper.text()).toContain('20 ms')
    expect(wrapper.text()).toContain('50 Hz')
  })

  it('recalculates immediately after changing the selected unit', async () => {
    const wrapper = mount(TimeFrequencyToolPage, {
      attachTo: document.body,
    })

    await wrapper.get('#time-frequency-unit').trigger('click')

    const option = document.body.querySelector(
      '[data-select-option-value="us"]',
    ) as HTMLButtonElement | null

    option?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('2 MHz')
    expect(wrapper.text()).toContain('500 ns')
  })

  it('shows a reciprocal warning when the input is not greater than zero', async () => {
    const wrapper = mount(TimeFrequencyToolPage, {
      attachTo: document.body,
    })

    await wrapper.get('#time-frequency-input').setValue('0')

    expect(wrapper.text()).toContain('时间与频率互转需要输入大于 0 的数值。')
    expect(wrapper.text()).toContain('0 us')
  })
})
