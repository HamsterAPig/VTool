import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GitCommitHelperPage from '@/features/git-commit-helper/GitCommitHelperPage.vue'

describe('GitCommitHelperPage', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders the default recommendation and empty-state hint', () => {
    const wrapper = mount(GitCommitHelperPage, {
      attachTo: document.body,
    })

    expect(wrapper.text()).toContain('Git 提交辅助')
    expect(wrapper.get('#git-commit-type').text()).toContain('新增功能 (feat)')
    expect(wrapper.text()).toContain(':sparkles:')
    expect(wrapper.text()).toContain(
      '输入 description 后，这里会生成完整建议文案。',
    )
  })

  it('constrains the type and refreshes the message after switching emoji', async () => {
    const wrapper = mount(GitCommitHelperPage, {
      attachTo: document.body,
    })

    await wrapper.get('#git-commit-description').setValue('修复复制按钮')
    await wrapper.get('[data-emoji-code=":bug:"]').trigger('click')

    expect(wrapper.get('#git-commit-type').text()).toContain('缺陷修复 (fix)')
    expect(wrapper.text()).toContain(':bug: fix: 修复复制按钮')
  })

  it('syncs the recommended emoji after switching type', async () => {
    const wrapper = mount(GitCommitHelperPage, {
      attachTo: document.body,
    })

    await wrapper.get('#git-commit-type').trigger('click')

    const option = document.body.querySelector(
      '[data-select-option-value="test"]',
    ) as HTMLButtonElement | null

    option?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain(':white_check_mark:')
    expect(
      wrapper.get('[data-emoji-code=":white_check_mark:"]').classes(),
    ).toContain('git-commit-helper-emoji-card--active')
  })

  it('updates all four result cards after entering scope and description', async () => {
    const wrapper = mount(GitCommitHelperPage, {
      attachTo: document.body,
    })

    await wrapper.get('#git-commit-scope').setValue('home')
    await wrapper.get('#git-commit-description').setValue('新增首页布局')

    expect(wrapper.text()).toContain(':sparkles: feat(home): 新增首页布局')
    expect(wrapper.text()).toContain(
      'git commit -m ":sparkles: feat(home): 新增首页布局"',
    )
    expect(wrapper.text()).toContain(':sparkles:')
    expect(wrapper.text()).toContain('✨')
  })
})
