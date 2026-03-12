import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import BaseSelect from '@/components/BaseSelect.vue'

describe('BaseSelect', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the floating panel and emits the selected value', async () => {
    const wrapper = mount(BaseSelect, {
      attachTo: document.body,
      props: {
        id: 'demo-select',
        modelValue: 'ms',
        options: [
          { label: '毫秒 (ms)', value: 'ms' },
          { label: '微秒 (us)', value: 'us' },
        ],
      },
    })

    await wrapper.get('#demo-select').trigger('click')

    const option = document.body.querySelector(
      '[data-select-option-value="us"]',
    ) as HTMLButtonElement | null

    expect(option).not.toBeNull()

    option?.click()

    expect(wrapper.emitted('update:modelValue')).toEqual([['us']])
  })

  it('supports keyboard opening from the trigger', async () => {
    const wrapper = mount(BaseSelect, {
      attachTo: document.body,
      props: {
        id: 'keyboard-select',
        modelValue: 'Hz',
        options: [
          { label: '赫兹 (Hz)', value: 'Hz' },
          { label: '千赫 (kHz)', value: 'kHz' },
        ],
      },
    })

    await wrapper.get('#keyboard-select').trigger('keydown', {
      key: 'ArrowDown',
    })

    expect(document.body.querySelector('[role="listbox"]')).not.toBeNull()
  })
})
