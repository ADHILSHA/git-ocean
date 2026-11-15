/** Raw repo facts as the edge function returns them. The one shape every layer agrees on. */
export interface RepoData {
  nameWithOwner: string
  url: string
  description: string | null
  stargazerCount: number
  primaryLanguage: string | null
  /** ISO timestamp of the last push. */
  pushedAt: string
  /** Commits on the default branch in the last 30 days. */
  commitsLast30d: number
  openIssues: number
  /** Open issues older than 2 years with zero comments (PRD §5 netting rule), counted among the oldest sampled. */
  staleUnansweredIssues: number
  /** True when the sample hit its cap, so the real count may be higher. */
  staleUnansweredCapped: boolean
  oldestStaleIssueUrl: string | null
  isArchived: boolean
}

export type DataSource = 'live' | 'cache' | 'stale-cache' | 'mock'

export interface BatchResponse {
  repos: RepoData[]
  source: DataSource
  fetchedAt: string
}

export interface RepoResponse {
  repo: RepoData | null
  source: DataSource
}

/** A repo after PRD §5's metaphor table has been applied. */
export interface Creature {
  id: string
  repo: RepoData
  /** Body length in world units ("px at zoom 1"). */
  size: number
  /** 0 (dormant, dim) to 1 (alive right now, bright pulse). */
  activity: number
  /** Pulse %, shown in the Info Card. */
  pulse: number
  species: string
  /** Linear RGB 0..1 */
  color: [number, number, number]
  netted: boolean
  /** Swim-loop anchor in world space. */
  home: [number, number, number]
  depthM: number
  /** Deterministic per-creature phase so motion differs between fish. */
  phase: number
  /** Created by fabricate.ts for a search with no match: not a real repo. */
  fabricated: boolean
}
