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

  it('renders the workspace above the result board with full catalog hints', () => {
    const wrapper = mount(GitCommitHelperPage, {
      attachTo: document.body,
    })

    const workspace = wrapper.get('.git-commit-helper-workspace').element
    const resultBoard = wrapper.get('.git-commit-helper-result-board').element

    expect(wrapper.text()).toContain('Git 提交辅助')
    expect(wrapper.text()).toContain('内置')
    expect(wrapper.get('#git-commit-type').text()).toContain('新增功能 (feat)')
    expect(wrapper.find('#git-commit-description').exists()).toBe(true)
    expect(
      workspace.compareDocumentPosition(resultBoard) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0)
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
      '[data-select-option-value="build"]',
    ) as HTMLButtonElement | null

    option?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain(':package:')
    expect(wrapper.get('[data-emoji-code=":package:"]').classes()).toContain(
      'git-commit-helper-emoji-card--active',
    )
  })

  it('filters the emoji catalog without clearing the current selection', async () => {
    const wrapper = mount(GitCommitHelperPage, {
      attachTo: document.body,
    })

    await wrapper.get('#git-commit-emoji-search').setValue('bug')
    await wrapper.get('#git-commit-description').setValue('新增首页布局')

    expect(wrapper.findAll('[data-emoji-code]').length).toBe(1)
    expect(wrapper.find('[data-emoji-code=":sparkles:"]').exists()).toBe(false)
    expect(wrapper.text()).toContain(':sparkles: feat: 新增首页布局')
    expect(wrapper.text()).toContain('当前已选')
    expect(wrapper.text()).toContain('✨ :sparkles:')
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
