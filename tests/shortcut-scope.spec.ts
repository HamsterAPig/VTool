import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ShortcutBinding } from '@/components/shortcutScope'

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

import ShortcutScope from '@/components/ShortcutScope.vue'

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

describe('ShortcutScope', () => {
  beforeEach(() => {
    hotkeysMockState.bindings = []
    focusTrapMockState.traps = []
    focusTrapMockState.createFocusTrap.mockClear()
    document.body.innerHTML = ''
  })

  it('registers and unregisters hotkeys with active state changes', async () => {
    const handler = vi.fn()
    const bindings: ShortcutBinding[] = [{ handler, keys: 'left' }]
    const wrapper = mount(ShortcutScope, {
      props: {
        active: true,
        bindings,
      },
    })

    expect(hotkeysMockState.bindings).toHaveLength(1)

    const event = triggerHotkey('left')

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ active: false })

    expect(hotkeysMockState.bindings).toHaveLength(0)
  })

  it('respects allowInInput when dispatching hotkeys', () => {
    const blockedHandler = vi.fn()
    const allowedHandler = vi.fn()
    const input = document.createElement('input')

    mount(ShortcutScope, {
      props: {
        active: true,
        bindings: [
          {
            handler: blockedHandler,
            keys: 'left',
          },
          {
            allowInInput: true,
            handler: allowedHandler,
            keys: 'right',
          },
        ] satisfies ShortcutBinding[],
      },
    })

    triggerHotkey('left', input)
    triggerHotkey('right', input)

    expect(blockedHandler).not.toHaveBeenCalled()
    expect(allowedHandler).toHaveBeenCalledTimes(1)
  })

  it('creates and tears down a focus trap when enabled', async () => {
    const wrapper = mount(ShortcutScope, {
      attachTo: document.body,
      props: {
        active: true,
        bindings: [],
        fallbackFocus: () => document.getElementById('fallback'),
        initialFocus: () => document.getElementById('initial'),
        trapFocus: true,
      },
      slots: {
        default:
          '<div id="fallback" tabindex="-1"><button id="initial" type="button">focus</button></div>',
      },
    })

    expect(focusTrapMockState.createFocusTrap).toHaveBeenCalledTimes(1)
    expect(focusTrapMockState.traps[0]?.activate).toHaveBeenCalledTimes(1)
    expect(focusTrapMockState.traps[0]?.options.escapeDeactivates).toBe(false)
    expect(focusTrapMockState.traps[0]?.options.clickOutsideDeactivates).toBe(
      false,
    )
    expect(focusTrapMockState.traps[0]?.options.returnFocusOnDeactivate).toBe(
      true,
    )

    await wrapper.setProps({ active: false })

    expect(focusTrapMockState.traps[0]?.deactivate).toHaveBeenCalledTimes(1)
  })
})
