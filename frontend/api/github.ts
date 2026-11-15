/**
 * Vercel edge function: the only code that talks to GitHub (token stays server-side).
 *
 *   GET /api/github                 -> ocean population batch (BatchResponse)
 *   GET /api/github?search=react    -> best repo match or null (RepoResponse)
 *   GET /api/github?repo=owner/name -> that repo or null (RepoResponse)
 *
 * GITHUB_PROVIDER=mock, or no GITHUB_TOKEN, serves fixture data through the same shapes.
 */
import type { BatchResponse, DataSource, RepoData, RepoResponse } from '../src/types/repo'
import { fixtureRepos } from '../src/data/fixtures'
import { rankMatch } from '../src/data/rank'

export const config = { runtime: 'edge' }

const GRAPHQL_URL = 'https://api.github.com/graphql'
const FRESH_MS = 5 * 60_000
const DAY = 86_400_000
const STALE_SAMPLE = 20
const TWO_YEARS = 2 * 365 * DAY

// ---------------------------------------------------------------- cache
interface Entry {
  at: number
  body: unknown
}
/** Per-isolate memory cache, plus the CDN cache via Cache-Control (see docs/decisions.md D-08). */
const cache = new Map<string, Entry>()
export const _resetCache = () => cache.clear()

async function cached<T>(key: string, now: number, load: () => Promise<T>): Promise<{ body: T; source: DataSource }> {
  const hit = cache.get(key)
  if (hit && now - hit.at < FRESH_MS) return { body: hit.body as T, source: 'cache' }
  try {
    const body = await load()
    cache.set(key, { at: now, body })
    return { body, source: 'live' }
  } catch (err) {
    // Rate-limited or network failure: serve the last good copy if we have one.
    if (hit) return { body: hit.body as T, source: 'stale-cache' }
    throw err
  }
}

// ---------------------------------------------------------------- GraphQL
const REPO_FIELDS = `
fragment RepoFields on Repository {
  nameWithOwner
  url
  description
  stargazerCount
  isArchived
  pushedAt
  primaryLanguage { name }
  openIssues: issues(states: OPEN) { totalCount }
  oldestOpen: issues(states: OPEN, first: ${STALE_SAMPLE}, orderBy: { field: CREATED_AT, direction: ASC }) {
    nodes { createdAt url comments { totalCount } }
  }
  defaultBranchRef { target { ... on Commit { history(since: $since) { totalCount } } } }
}`

const SEARCH_QUERY = `query($q: String!, $first: Int!, $since: GitTimestamp!) {
  search(query: $q, type: REPOSITORY, first: $first) { nodes { ...RepoFields } }
}
${REPO_FIELDS}`

const REPO_QUERY = `query($owner: String!, $name: String!, $since: GitTimestamp!) {
  repository(owner: $owner, name: $name) { ...RepoFields }
}
${REPO_FIELDS}`

export interface RepoNode {
  nameWithOwner: string
  url: string
  description: string | null
  stargazerCount: number
  isArchived: boolean
  pushedAt: string | null
  primaryLanguage: { name: string } | null
  openIssues: { totalCount: number }
  oldestOpen: { nodes: { createdAt: string; url: string; comments: { totalCount: number } }[] }
  defaultBranchRef: { target: { history?: { totalCount: number } } | null } | null
}

/** Netting = issues open > 2 years with zero comments (PRD §5), counted among the oldest open issues. */
export function toRepoData(n: RepoNode, now: number): RepoData {
  const stale = n.oldestOpen.nodes.filter((i) => now - Date.parse(i.createdAt) > TWO_YEARS && i.comments.totalCount === 0)
  return {
    nameWithOwner: n.nameWithOwner,
    url: n.url,
    description: n.description,
    stargazerCount: n.stargazerCount,
    primaryLanguage: n.primaryLanguage?.name ?? null,
    pushedAt: n.pushedAt ?? new Date(0).toISOString(),
    commitsLast30d: n.defaultBranchRef?.target?.history?.totalCount ?? 0,
    openIssues: n.openIssues.totalCount,
    staleUnansweredIssues: stale.length,
    staleUnansweredCapped: stale.length >= STALE_SAMPLE,
    oldestStaleIssueUrl: stale[0]?.url ?? null,
    isArchived: n.isArchived,
  }
}

async function gql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'git-ocean' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: { type?: string; message: string }[] }
  if (json.errors?.length && !json.data) throw new Error(json.errors.map((e) => e.type ?? e.message).join(', '))
  if (json.errors?.some((e) => e.type === 'RATE_LIMITED')) throw new Error('RATE_LIMITED')
  return json.data as T
}

const isoDaysAgo = (now: number, d: number) => new Date(now - d * DAY).toISOString()
const dateDaysAgo = (now: number, d: number) => isoDaysAgo(now, d).slice(0, 10)

/** Population mix: legends for the abyss, then progressively smaller, livelier repos for the shallows. */
export function batchQueries(now: number): string[] {
  return [
    'stars:>40000 sort:stars',
    `stars:4000..40000 pushed:>${dateDaysAgo(now, 30)} sort:stars`,
    `stars:400..4000 pushed:>${dateDaysAgo(now, 14)} sort:updated`,
    `stars:40..400 pushed:>${dateDaysAgo(now, 7)} sort:updated`,
    `stars:5..200 created:>${dateDaysAgo(now, 60)} sort:stars`,
  ]
}

// ---------------------------------------------------------------- providers
interface Provider {
  batch(now: number): Promise<RepoData[]>
  search(term: string, now: number): Promise<RepoData | null>
  repo(owner: string, name: string, now: number): Promise<RepoData | null>
}

const mockProvider: Provider = {
  async batch(now) {
    return fixtureRepos(now)
  },
  async search(term, now) {
    return rankMatch(term, fixtureRepos(now))
  },
  async repo(owner, name, now) {
    const id = `${owner}/${name}`.toLowerCase()
    return fixtureRepos(now).find((r) => r.nameWithOwner.toLowerCase() === id) ?? null
  },
}

function githubProvider(token: string): Provider {
  return {
    async batch(now) {
      const since = isoDaysAgo(now, 30)
      const results = await Promise.allSettled(
        batchQueries(now).map((q) => gql<{ search: { nodes: RepoNode[] } }>(token, SEARCH_QUERY, { q, first: 100, since })),
      )
      const ok = results.filter((r): r is PromiseFulfilledResult<{ search: { nodes: RepoNode[] } }> => r.status === 'fulfilled')
      if (!ok.length) throw (results[0] as PromiseRejectedResult).reason
      const seen = new Set<string>()
      const out: RepoData[] = []
      for (const r of ok)
        for (const n of r.value.search.nodes) {
          if (!n?.nameWithOwner || seen.has(n.nameWithOwner)) continue
          seen.add(n.nameWithOwner)
          out.push(toRepoData(n, now))
        }
      return out
    },
    async search(term, now) {
      const t = term.trim()
      if (t.includes('/')) {
        const [owner, name] = t.split('/')
        const hit = await this.repo(owner, name, now)
        if (hit) return hit
      }
      const q = `${t.replace(/[^\w.\-/ ]/g, ' ')} in:name sort:stars`
      const data = await gql<{ search: { nodes: RepoNode[] } }>(token, SEARCH_QUERY, { q, first: 10, since: isoDaysAgo(now, 30) })
      return rankMatch(t.split('/').pop() ?? t, data.search.nodes.filter(Boolean).map((n) => toRepoData(n, now)))
    },
    async repo(owner, name, now) {
      const data = await gql<{ repository: RepoNode | null }>(token, REPO_QUERY, { owner, name, since: isoDaysAgo(now, 30) })
      return data.repository ? toRepoData(data.repository, now) : null
    },
  }
}

function env(name: string): string | undefined {
  return typeof process !== 'undefined' ? process.env[name] : undefined
}

export function pickProvider(): { provider: Provider; mock: boolean } {
  const token = env('GITHUB_TOKEN')
  if (env('GITHUB_PROVIDER') === 'mock' || !token) return { provider: mockProvider, mock: true }
  return { provider: githubProvider(token), mock: false }
}

// ---------------------------------------------------------------- handler
const json = (body: unknown, status = 200, maxAge = 300) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': status === 200 ? `public, s-maxage=${maxAge}, stale-while-revalidate=1800` : 'no-store',
    },
  })

const NAME_RE = /^(?!\.+$)[\w.-]{1,100}$/

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const now = Date.now()
  const { provider, mock } = pickProvider()
  const tag = (s: DataSource): DataSource => (mock ? 'mock' : s)

  try {
    const repoParam = url.searchParams.get('repo')
    if (repoParam !== null) {
      const [owner, name] = repoParam.split('/')
      if (!owner || !name || !NAME_RE.test(owner) || !NAME_RE.test(name)) return json({ error: 'Expected ?repo=owner/name' }, 400)
      const key = `repo:${owner}/${name}`.toLowerCase()
      const { body, source } = await cached(key, now, () => provider.repo(owner, name, now))
      return json({ repo: body, source: tag(source) } satisfies RepoResponse)
    }

    const search = url.searchParams.get('search')
    if (search !== null) {
      const term = search.trim().slice(0, 100)
      if (!term) return json({ error: 'Empty search' }, 400)
      const { body, source } = await cached(`search:${term.toLowerCase()}`, now, () => provider.search(term, now))
      return json({ repo: body, source: tag(source) } satisfies RepoResponse)
    }

    const { body, source } = await cached('batch:v1', now, () => provider.batch(now))
    return json({ repos: body, source: tag(source), fetchedAt: new Date(now).toISOString() } satisfies BatchResponse)
  } catch (err) {
    return json({ error: 'GitHub is unreachable right now', detail: String((err as Error).message ?? err) }, 503)
  }
}
