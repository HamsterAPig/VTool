import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import WorktimeToolPage from '@/features/worktime-tool/WorktimeToolPage.vue'

describe('WorktimeToolPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    URL.createObjectURL = vi.fn(() => 'blob:mock')
    URL.revokeObjectURL = vi.fn()
  })

  it('renders a Sunday-first calendar and saves a workday record', async () => {
    const wrapper = mount(WorktimeToolPage, {
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    expect(wrapper.text()).toContain('周日')
    expect(wrapper.text()).toContain('周六')

    const firstDayButton = wrapper
      .findAll('.worktime-calendar__day')
      .find((item) => !item.classes().includes('worktime-calendar__day--muted'))

    expect(firstDayButton).toBeDefined()
    await firstDayButton!.trigger('click')

    const timeInputs = wrapper.findAll('input[type="time"]')

    expect(timeInputs).toHaveLength(2)
    await timeInputs[0]!.setValue('08:30')
    await timeInputs[1]!.setValue('18:30')
    await wrapper
      .get('.workday-dialog__actions .button--primary')
      .trigger('click')

    expect(wrapper.text()).toContain('记录天数1')
    expect(wrapper.text()).toContain('8小时30分钟')
    expect(wrapper.text()).toContain('+0小时30分钟')

    const payload = window.localStorage.getItem('vtool.worktime.records')

    expect(payload).toContain('08:30')
    expect(payload).toContain('18:30')
  })
})
