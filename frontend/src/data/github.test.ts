import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBatch } from './github'
import type { BatchResponse } from '../types/repo'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  })
})
afterEach(() => vi.unstubAllGlobals())

const batch: BatchResponse = {
  repos: [{ nameWithOwner: 'a/b', url: '', description: null, stargazerCount: 5, primaryLanguage: 'Go', pushedAt: '2026-01-01T00:00:00Z', commitsLast30d: 0, openIssues: 0, staleUnansweredIssues: 0, staleUnansweredCapped: false, oldestStaleIssueUrl: null, isArchived: false }],
  source: 'live',
  fetchedAt: '2026-11-15T00:00:00Z',
}

describe('fetchBatch (client)', () => {
  it('remembers the last batch and serves it when the edge function is unreachable', async () => {
    const ok = vi.fn(async () => batch) as never
    expect((await fetchBatch(ok)).source).toBe('live')
    const down = vi.fn(async () => {
      throw new Error('network')
    }) as never
    const fallback = await fetchBatch(down)
    expect(fallback.source).toBe('stale-cache')
    expect(fallback.repos[0].nameWithOwner).toBe('a/b')
  })
  it('falls back to the fixture ocean when nothing was ever cached', async () => {
    const down = vi.fn(async () => {
      throw new Error('network')
    }) as never
    const res = await fetchBatch(down)
    expect(res.source).toBe('mock')
    expect(res.repos.length).toBeGreaterThan(200)
  })
})
