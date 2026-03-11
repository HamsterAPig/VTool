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
    expect(wrapper.findAll('.worktime-calendar__day')).toHaveLength(35)
    expect(
      (wrapper.get('.worktime-rules').element as HTMLDetailsElement).open,
    ).toBe(false)

    const firstDayButton = wrapper
      .findAll('.worktime-calendar__day')
      .find((item) => !item.classes().includes('worktime-calendar__day--muted'))

    expect(firstDayButton).toBeDefined()
    await firstDayButton!.trigger('click')

    expect(wrapper.findAll('input[type="time"]')).toHaveLength(0)

    const timeInputs = wrapper.findAll('.workday-dialog__time-input')

    expect(timeInputs).toHaveLength(2)
    await timeInputs[0]!.setValue('08:30')
    await timeInputs[1]!.setValue('18:30')
    await wrapper
      .get('.workday-dialog__actions .button--primary')
      .trigger('click')

    expect(wrapper.find('.worktime-calendar__day-note').exists()).toBe(false)
    expect(wrapper.find('.worktime-calendar__day-badge').exists()).toBe(false)
    expect(wrapper.text()).toContain('记录天数1')
    expect(wrapper.text()).toContain('8小时30分钟')
    expect(wrapper.text()).toContain('+30 分钟')
    expect(firstDayButton!.text()).toContain('08:30')
    expect(firstDayButton!.text()).toContain('18:30')

    const payload = window.localStorage.getItem('vtool.worktime.data')

    expect(payload).toContain('08:30')
    expect(payload).toContain('18:30')
    expect(payload).toContain('"rules"')
  })

  it('updates calendar results when a weekday rule target changes', async () => {
    const wrapper = mount(WorktimeToolPage, {
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    const firstDayButton = wrapper
      .findAll('.worktime-calendar__day')
      .find((item) => !item.classes().includes('worktime-calendar__day--muted'))

    expect(firstDayButton).toBeDefined()
    await firstDayButton!.trigger('click')

    const timeInputs = wrapper.findAll('.workday-dialog__time-input')

    await timeInputs[0]!.setValue('08:30')
    await timeInputs[1]!.setValue('17:30')
    await wrapper
      .get('.workday-dialog__actions .button--primary')
      .trigger('click')

    await wrapper.get('.worktime-rules__summary').trigger('click')

    const weekdayChip = wrapper
      .findAll('.worktime-rules__chip')
      .find((item) => item.text() === '周日')

    expect(weekdayChip).toBeDefined()
    await weekdayChip!.trigger('click')

    const targetInputs = wrapper.findAll('input[type="number"]')

    await targetInputs[1]!.setValue('420')
    await wrapper
      .get('.worktime-rules__editor-actions .button--primary')
      .trigger('click')

    expect(wrapper.text()).toContain('+60 分钟')
  })
})
