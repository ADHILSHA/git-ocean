import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler, { _resetCache, toRepoData, type RepoNode } from './github'

const NOW = Date.parse('2026-11-15T00:00:00Z')

function node(name: string, over: Partial<RepoNode> = {}): RepoNode {
  return {
    nameWithOwner: name,
    url: `https://github.com/${name}`,
    description: null,
    stargazerCount: 1000,
    isArchived: false,
    pushedAt: '2026-11-10T00:00:00Z',
    primaryLanguage: { name: 'Go' },
    openIssues: { totalCount: 40 },
    oldestOpen: { nodes: [] },
    defaultBranchRef: { target: { history: { totalCount: 12 } } },
    ...over,
  }
}

const gqlOk = (nodes: RepoNode[]) =>
  new Response(JSON.stringify({ data: { search: { nodes } } }), { status: 200, headers: { 'Content-Type': 'application/json' } })

describe('toRepoData', () => {
  it('counts only issues open > 2 years with zero comments as netting', () => {
    const r = toRepoData(
      node('a/b', {
        oldestOpen: {
          nodes: [
            { createdAt: '2021-01-01T00:00:00Z', url: 'u1', comments: { totalCount: 0 } },
            { createdAt: '2021-02-01T00:00:00Z', url: 'u2', comments: { totalCount: 4 } },
            { createdAt: '2026-01-01T00:00:00Z', url: 'u3', comments: { totalCount: 0 } },
          ],
        },
      }),
      NOW,
    )
    expect(r.staleUnansweredIssues).toBe(1)
    expect(r.oldestStaleIssueUrl).toBe('u1')
    expect(r.commitsLast30d).toBe(12)
    expect(r.openIssues).toBe(40)
  })
})

describe('edge handler', () => {
  beforeEach(() => {
    _resetCache()
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('serves fixtures through the same shape when there is no token (mock provider)', async () => {
    vi.stubEnv('GITHUB_TOKEN', '')
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const body = await (await handler(new Request('http://x/api/github'))).json()
    expect(body.source).toBe('mock')
    expect(body.repos.length).toBeGreaterThan(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('mock search finds known repos and returns null for nonsense', async () => {
    vi.stubEnv('GITHUB_PROVIDER', 'mock')
    const hit = await (await handler(new Request('http://x/api/github?search=react'))).json()
    expect(hit.repo.nameWithOwner).toBe('facebook/react')
    const miss = await (await handler(new Request('http://x/api/github?search=zzqqxx-not-a-repo'))).json()
    expect(miss.repo).toBeNull()
  })

  it('caches live batches and falls back to the last good batch when GitHub fails', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test-token')
    vi.stubEnv('GITHUB_PROVIDER', 'github')
    const fetchMock = vi.fn(async () => gqlOk([node('a/one'), node('b/two')]))
    vi.stubGlobal('fetch', fetchMock)

    const first = await (await handler(new Request('http://x/api/github'))).json()
    expect(first.source).toBe('live')
    expect(first.repos.map((r: { nameWithOwner: string }) => r.nameWithOwner)).toEqual(['a/one', 'b/two'])
    const calls = fetchMock.mock.calls.length

    const second = await (await handler(new Request('http://x/api/github'))).json()
    expect(second.source).toBe('cache')
    expect(fetchMock.mock.calls.length).toBe(calls)

    // Past the TTL, GitHub rate-limits us: the last batch is served instead of an error.
    vi.setSystemTime(NOW + 10 * 60_000)
    fetchMock.mockImplementation(async () => new Response('rate limited', { status: 403 }))
    const third = await (await handler(new Request('http://x/api/github'))).json()
    expect(third.source).toBe('stale-cache')
    expect(third.repos).toHaveLength(2)

    // Network failure behaves the same.
    fetchMock.mockImplementation(async () => {
      throw new TypeError('fetch failed')
    })
    const fourth = await (await handler(new Request('http://x/api/github'))).json()
    expect(fourth.source).toBe('stale-cache')
  })

  it('returns 503 (not fabricated data) when the batch fails with nothing cached', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test-token')
    vi.stubEnv('GITHUB_PROVIDER', 'github')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 502 })))
    const res = await handler(new Request('http://x/api/github'))
    expect(res.status).toBe(503)
  })

  it('rejects malformed repo params', async () => {
    vi.stubEnv('GITHUB_PROVIDER', 'mock')
    expect((await handler(new Request('http://x/api/github?repo=../etc'))).status).toBe(400)
  })
})
