import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ShortcutBinding } from '@/components/shortcutScope'
import { createDefaultWorktimeRuleSet } from '@/features/worktime-tool/worktime'

const hotkeysMockState = vi.hoisted(() => ({
  bindings: [] as Array<{
    handler: ShortcutBinding['handler']
    keys: string
  }>,
}))

const focusTrapMockState = vi.hoisted(() => ({
  createFocusTrap: vi.fn(
    (element: HTMLElement, options: Record<string, unknown>) => {
      const trap = {
        activate: vi.fn(),
        deactivate: vi.fn(),
      }

      focusTrapMockState.traps.push({
        ...trap,
        element,
        options,
      })

      return trap
    },
  ),
  traps: [] as Array<{
    activate: ReturnType<typeof vi.fn>
    deactivate: ReturnType<typeof vi.fn>
    element: HTMLElement
    options: Record<string, unknown>
  }>,
}))

vi.mock('hotkeys-js', () => {
  const hotkeys = ((
    keys: string,
    optionsOrHandler: Record<string, unknown> | ShortcutBinding['handler'],
    maybeHandler?: ShortcutBinding['handler'],
  ) => {
    const handler =
      typeof optionsOrHandler === 'function' ? optionsOrHandler : maybeHandler

    if (handler) {
      hotkeysMockState.bindings.push({ handler, keys })
    }
  }) as any

  hotkeys.filter = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null

    return Boolean(
      target && !['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName),
    )
  }

  hotkeys.unbind = (keys?: string, handler?: ShortcutBinding['handler']) => {
    if (!keys) {
      hotkeysMockState.bindings = []
      return
    }

    hotkeysMockState.bindings = hotkeysMockState.bindings.filter((entry) => {
      if (entry.keys !== keys) {
        return true
      }

      return handler ? entry.handler !== handler : false
    })
  }

  return {
    default: hotkeys,
  }
})

vi.mock('focus-trap', () => ({
  createFocusTrap: focusTrapMockState.createFocusTrap,
}))

import WorktimeToolPage from '@/features/worktime-tool/WorktimeToolPage.vue'

const clipboardMockState = {
  readText: vi.fn<() => Promise<string>>(),
  writeText: vi.fn<() => Promise<void>>(),
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function triggerHotkey(keys: string, target: EventTarget = document.body) {
  const binding = hotkeysMockState.bindings.find((entry) => entry.keys === keys)

  expect(binding).toBeDefined()

  const event = {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target,
  } as unknown as KeyboardEvent

  binding?.handler(event)

  return event as unknown as {
    preventDefault: ReturnType<typeof vi.fn>
    stopPropagation: ReturnType<typeof vi.fn>
    target: EventTarget
  }
}

describe('WorktimeToolPage', () => {
  beforeEach(() => {
    hotkeysMockState.bindings = []
    focusTrapMockState.traps = []
    focusTrapMockState.createFocusTrap.mockClear()
    clipboardMockState.readText.mockReset().mockResolvedValue('')
    clipboardMockState.writeText.mockReset().mockResolvedValue(undefined)
    window.localStorage.clear()
    URL.createObjectURL = vi.fn(() => 'blob:mock')
    URL.revokeObjectURL = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboardMockState,
    })
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

    expect(wrapper.findAll('input[type="time"]')).toHaveLength(2)

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

  it('saves and moves to the next day when pressing right arrow in the dialog', async () => {
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

    const originalDateLabel = wrapper.get('.workday-dialog__header h2').text()
    const timeInputs = wrapper.findAll('.workday-dialog__time-input')

    await timeInputs[0]!.setValue('08:30')
    await timeInputs[1]!.setValue('18:30')

    triggerHotkey('right', timeInputs[1]!.element)
    await vi.waitFor(() =>
      expect(wrapper.get('.workday-dialog__header h2').text()).not.toBe(
        originalDateLabel,
      ),
    )

    const payload = window.localStorage.getItem('vtool.worktime.data')
    const refreshedInputs = wrapper.findAll('.workday-dialog__time-input')

    expect(payload).toContain('08:30')
    expect(payload).toContain('18:30')
    expect((refreshedInputs[0]!.element as HTMLInputElement).value).toBe('')
    expect((refreshedInputs[1]!.element as HTMLInputElement).value).toBe('')
  })

  it('auto-saves on overlay close and blocks close when data is incomplete', async () => {
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

    let timeInputs = wrapper.findAll('.workday-dialog__time-input')

    await timeInputs[0]!.setValue('08:30')
    await timeInputs[1]!.setValue('18:30')
    await wrapper.get('.workday-dialog').trigger('click')

    expect(wrapper.find('.workday-dialog').exists()).toBe(false)
    expect(window.localStorage.getItem('vtool.worktime.data')).toContain(
      '18:30',
    )

    await firstDayButton!.trigger('click')

    timeInputs = wrapper.findAll('.workday-dialog__time-input')

    await timeInputs[0]!.setValue('09:00')
    await timeInputs[1]!.setValue('')
    timeInputs = wrapper.findAll('.workday-dialog__time-input')
    ;(timeInputs[0]!.element as HTMLInputElement).focus()

    const tabEvent = triggerHotkey('tab', timeInputs[0]!.element)

    expect(tabEvent.preventDefault).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(timeInputs[1]!.element)

    triggerHotkey('esc', timeInputs[1]!.element)
    await vi.waitFor(() =>
      expect(wrapper.find('.workday-dialog').exists()).toBe(true),
    )

    expect(wrapper.text()).toContain('请同时填写上班和下班时间。')
  })

  it('imports worktime data from the clipboard', async () => {
    const today = new Date()
    const dateKey = formatDateKey(today)

    clipboardMockState.readText.mockResolvedValue(
      JSON.stringify({
        version: 2,
        data: {
          records: {
            [dateKey]: {
              date: dateKey,
              startTime: '08:30',
              endTime: '17:30',
              updatedAt: '2026-03-16T09:00:00.000Z',
            },
          },
          rules: createDefaultWorktimeRuleSet(),
        },
      }),
    )

    const wrapper = mount(WorktimeToolPage, {
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    await wrapper
      .get('.browser-data-panel__actions button.button--ghost')
      .trigger('click')

    await vi.waitFor(() =>
      expect(clipboardMockState.readText).toHaveBeenCalledTimes(1),
    )

    expect(window.localStorage.getItem('vtool.worktime.data')).toContain(
      dateKey,
    )
    expect(wrapper.text()).toContain('已导入 1 条记录和规则配置。')
    expect(wrapper.text()).toContain('记录天数1')
  })

  it('shows a status message when the clipboard is empty', async () => {
    clipboardMockState.readText.mockResolvedValue('   ')

    const wrapper = mount(WorktimeToolPage, {
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    await wrapper
      .get('.browser-data-panel__actions button.button--ghost')
      .trigger('click')

    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('剪贴板没有可导入的内容。'),
    )
  })

  it('shows a status message when clipboard import is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })

    const wrapper = mount(WorktimeToolPage, {
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    await wrapper
      .get('.browser-data-panel__actions button.button--ghost')
      .trigger('click')

    expect(wrapper.text()).toContain('当前环境不支持从剪贴板导入。')
  })
})
