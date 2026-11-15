/** Typed client for the edge function. The browser never calls GitHub directly. */
import type { BatchResponse, RepoData, RepoResponse } from '../types/repo'

const LAST_BATCH_KEY = 'git-ocean:last-batch'
const API = '/api/github'

async function getJson<T>(url: string, timeoutMs = 9000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

function readLastBatch(): BatchResponse | null {
  try {
    const raw = localStorage.getItem(LAST_BATCH_KEY)
    return raw ? (JSON.parse(raw) as BatchResponse) : null
  } catch {
    return null
  }
}

/**
 * Ocean population. If the edge function is unreachable, fall back to the last
 * batch this browser received (PRD §9), and only then to the fixture ocean.
 */
export async function fetchBatch(fetcher: typeof getJson = getJson): Promise<BatchResponse> {
  try {
    const batch = await fetcher<BatchResponse>(API)
    if (!batch.repos?.length) throw new Error('empty batch')
    try {
      localStorage.setItem(LAST_BATCH_KEY, JSON.stringify(batch))
    } catch {
      /* quota or private mode: fine */
    }
    return batch
  } catch {
    const last = readLastBatch()
    if (last) return { ...last, source: last.source === 'mock' ? 'mock' : 'stale-cache' }
    const { fixtureRepos } = await import('./fixtures')
    return { repos: fixtureRepos(), source: 'mock', fetchedAt: new Date().toISOString() }
  }
}

export async function searchRepo(term: string): Promise<RepoData | null> {
  try {
    return (await getJson<RepoResponse>(`${API}?search=${encodeURIComponent(term)}`)).repo
  } catch {
    return null
  }
}

export async function fetchRepo(owner: string, name: string): Promise<RepoData | null> {
  try {
    return (await getJson<RepoResponse>(`${API}?repo=${encodeURIComponent(owner)}/${encodeURIComponent(name)}`)).repo
  } catch {
    return null
  }
}
