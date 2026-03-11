import { beforeEach, describe, expect, it } from 'vitest'

import { formatDocumentTitle, router, updateDocumentTitle } from '@/router'

describe('router document title', () => {
  beforeEach(async () => {
    window.history.pushState({}, '', '/')
    await router.push('/')
    await router.isReady()
    document.title = ''
  })

  it('formats titles with the VTool prefix', () => {
    expect(formatDocumentTitle('首页')).toBe('VTool|首页')
    expect(formatDocumentTitle()).toBe('VTool')
  })

  it('updates the title for the current route', async () => {
    await router.push('/tools/time-frequency')
    updateDocumentTitle()

    expect(document.title).toBe('VTool|时间 / 频率换算')
  })

  it('falls back to the app title when no page title is provided', () => {
    document.title = 'stale'
    updateDocumentTitle({
      ...router.currentRoute.value,
      meta: {},
    })

    expect(document.title).toBe('VTool')
  })
})
