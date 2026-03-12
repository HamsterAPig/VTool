import { describe, expect, it } from 'vitest'

import {
  applyEmojiSelection,
  applyTypeSelection,
  buildCommitSuggestion,
  getCompatibleCommitTypes,
  getCopyTargetValue,
  getDefaultCommitDraftState,
} from '@/features/git-commit-helper/gitCommitHelper'

describe('git commit helper utilities', () => {
  it('constrains commit types after selecting an emoji', () => {
    const nextDraft = applyEmojiSelection(getDefaultCommitDraftState(), ':bug:')

    expect(nextDraft.type).toBe('fix')
    expect(getCompatibleCommitTypes(':bug:').map((item) => item.type)).toEqual([
      'fix',
    ])
  })

  it('syncs the recommended emoji after selecting a type', () => {
    const nextDraft = applyTypeSelection(getDefaultCommitDraftState(), 'test')

    expect(nextDraft.emojiCode).toBe(':white_check_mark:')
    expect(nextDraft.type).toBe('test')
  })

  it('switches only the prefix when toggling between code and emoji styles', () => {
    const codeResult = buildCommitSuggestion({
      ...getDefaultCommitDraftState(),
      scope: 'home',
      description: '新增首页布局',
      style: 'code',
    })
    const emojiResult = buildCommitSuggestion({
      ...getDefaultCommitDraftState(),
      scope: 'home',
      description: '新增首页布局',
      style: 'emoji',
    })

    expect(codeResult.message).toBe(':sparkles: feat(home): 新增首页布局')
    expect(emojiResult.message).toBe('✨ feat(home): 新增首页布局')
  })

  it('formats messages with or without a scope', () => {
    expect(
      buildCommitSuggestion({
        ...getDefaultCommitDraftState(),
        description: '新增首页布局',
      }).message,
    ).toBe(':sparkles: feat: 新增首页布局')

    expect(
      buildCommitSuggestion({
        ...getDefaultCommitDraftState(),
        scope: 'home',
        description: '新增首页布局',
      }).message,
    ).toBe(':sparkles: feat(home): 新增首页布局')
  })

  it('does not generate the final command when description is empty', () => {
    const result = buildCommitSuggestion({
      ...getDefaultCommitDraftState(),
      scope: 'home',
    })

    expect(result.isReady).toBe(false)
    expect(result.message).toBe('')
    expect(result.command).toBe('')
  })

  it('returns copy values for message, command, code and emoji', () => {
    const result = buildCommitSuggestion({
      ...getDefaultCommitDraftState(),
      scope: 'home',
      description: '新增首页布局',
    })

    expect(getCopyTargetValue(result, 'message')).toBe(
      ':sparkles: feat(home): 新增首页布局',
    )
    expect(getCopyTargetValue(result, 'command')).toBe(
      'git commit -m ":sparkles: feat(home): 新增首页布局"',
    )
    expect(getCopyTargetValue(result, 'code')).toBe(':sparkles:')
    expect(getCopyTargetValue(result, 'emoji')).toBe('✨')
  })
})
