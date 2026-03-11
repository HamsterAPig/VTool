import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TimeFrequencyToolPage from '@/features/time-frequency-tool/TimeFrequencyToolPage.vue'

describe('TimeFrequencyToolPage', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders the tool and shows reciprocal frequency by default', () => {
    const wrapper = mount(TimeFrequencyToolPage)

    expect(wrapper.text()).toContain('时间 / 频率换算')
    expect(wrapper.text()).toContain('2 kHz')
    expect(wrapper.text()).toContain('500 us')
  })

  it('switches to frequency input and recalculates reciprocal time', async () => {
    const wrapper = mount(TimeFrequencyToolPage)

    await wrapper.findAll('.segment__item')[1]!.trigger('click')

    expect(wrapper.text()).toContain('20 ms')
    expect(wrapper.text()).toContain('50 Hz')
  })

  it('shows a reciprocal warning when the input is not greater than zero', async () => {
    const wrapper = mount(TimeFrequencyToolPage)

    await wrapper.get('#time-frequency-input').setValue('0')

    expect(wrapper.text()).toContain('时间与频率互转需要输入大于 0 的数值。')
    expect(wrapper.text()).toContain('0 us')
  })
})
