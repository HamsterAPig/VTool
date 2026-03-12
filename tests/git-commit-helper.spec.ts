import { describe, expect, it } from 'vitest'

import {
  applyEmojiSelection,
  applyTypeSelection,
  buildCommitSuggestion,
  buildGitEmojiSections,
  getCompatibleCommitTypes,
  getCopyTargetValue,
  getDefaultCommitDraftState,
  gitEmojiDefinitions,
  matchesGitEmojiSearch,
} from '@/features/git-commit-helper/gitCommitHelper'

describe('git commit helper utilities', () => {
  it('ships a near-complete gitmoji catalog', () => {
    expect(gitEmojiDefinitions.length).toBeGreaterThan(70)
    expect(
      gitEmojiDefinitions.find((item) => item.code === ':passport_control:'),
    ).toBeDefined()
    expect(
      gitEmojiDefinitions.find((item) => item.code === ':airplane:'),
    ).toBeDefined()
  })

  it('constrains commit types after selecting an emoji', () => {
    const nextDraft = applyEmojiSelection(
      getDefaultCommitDraftState(),
      ':passport_control:',
    )

    expect(nextDraft.type).toBe('feat')
    expect(
      getCompatibleCommitTypes(':passport_control:').map((item) => item.type),
    ).toEqual(['feat', 'fix'])
  })

  it('syncs the recommended emoji after selecting a type', () => {
    const nextDraft = applyTypeSelection(getDefaultCommitDraftState(), 'build')

    expect(nextDraft.emojiCode).toBe(':package:')
    expect(nextDraft.type).toBe('build')
  })

  it('supports emoji search by code, name and Chinese description', () => {
    const bugEmoji = gitEmojiDefinitions.find((item) => item.code === ':bug:')
    const wheelchairEmoji = gitEmojiDefinitions.find(
      (item) => item.code === ':wheelchair:',
    )

    expect(bugEmoji).toBeDefined()
    expect(wheelchairEmoji).toBeDefined()
    expect(matchesGitEmojiSearch(bugEmoji!, 'bug')).toBe(true)
    expect(matchesGitEmojiSearch(bugEmoji!, ':bug:')).toBe(true)
    expect(matchesGitEmojiSearch(wheelchairEmoji!, '可访问性')).toBe(true)
  })

  it('groups matching emoji into recommended, compatible and extended sections', () => {
    const sections = buildGitEmojiSections('feat', '修复')

    expect(sections.map((section) => section.id)).toEqual(['extended'])
    expect(sections[0]?.items.some((item) => item.code === ':bug:')).toBe(true)
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
