/**
 * The single place PRD §5's metaphor table becomes code. Every visual rule
 * (size, glow/speed, species colour, netting, depth) is defined here.
 */
import type { Creature, RepoData } from '../types/repo'
import { hashString, unit } from './hash'
import { hexToLinear, speciesFor } from './species'
import { depthToY } from '../ocean/world'

const DAY_MS = 86_400_000

/** PRD §5: size = 3 + (log10(stars+1)/5.4)^1.5 × 95 px at zoom 1. */
export function sizeFromStars(stars: number): number {
  const t = Math.log10(Math.max(0, stars) + 1) / 5.4
  return 3 + Math.pow(t, 1.5) * 95
}

/** Fame in 0..1 on the same log axis as size. */
export function fame(stars: number): number {
  return Math.min(1, Math.max(0, Math.log10(Math.max(0, stars) + 1) / 5.4))
}

/**
 * PRD §5 glow + swim speed: pushedAt recency and 30-day commit frequency.
 * 1 = pushed today with a busy month; 0 = untouched for a year, or archived.
 */
export function activityOf(repo: Pick<RepoData, 'pushedAt' | 'commitsLast30d' | 'isArchived'>, now = Date.now()): number {
  if (repo.isArchived) return 0
  const days = Math.max(0, (now - Date.parse(repo.pushedAt)) / DAY_MS)
  const recency = Math.exp(-days / 45)
  const frequency = Math.min(1, Math.log10(Math.max(0, repo.commitsLast30d) + 1) / 2.3)
  return Math.min(1, Math.max(0, 0.55 * recency + 0.45 * frequency))
}

/** PRD §5 netting: stale *unanswered* issues only (open > 2 years, zero comments). Never raw issue count. */
export const isNetted = (repo: Pick<RepoData, 'staleUnansweredIssues'>) => repo.staleUnansweredIssues > 0

/** PRD §5 depth: inverse of fame. Shallow = new/small, abyss = legends. Small deterministic jitter. */
export function depthFromStars(stars: number, id: string): number {
  const base = 150 + Math.pow(fame(stars), 2.2) * 9250
  const jitter = (unit(id, 'depth') - 0.5) * 0.08 * Math.max(400, base)
  return Math.min(9350, Math.max(80, base + jitter))
}

/** World units per "px at zoom 1"; framing scales with it, so it only sets how big fish read in idle drift. */
export const WORLD_UNITS_PER_PX = 1.5

export function homeFor(id: string, depthM: number, size: number): [number, number, number] {
  const x = (unit(id, 'x') - 0.5) * 640
  // Bigger creatures sit further back so they don't wall off the view.
  const z = -40 - unit(id, 'z') * 260 - Math.min(120, size)
  return [x, depthToY(depthM), z]
}

export function mapRepoToCreature(repo: RepoData, opts: { fabricated?: boolean; now?: number } = {}): Creature {
  const id = repo.nameWithOwner.toLowerCase()
  const size = sizeFromStars(repo.stargazerCount)
  const activity = activityOf(repo, opts.now)
  const species = speciesFor(repo.primaryLanguage)
  const depthM = depthFromStars(repo.stargazerCount, id)
  return {
    id,
    repo,
    size,
    activity,
    pulse: Math.round(activity * 100),
    species: species.language,
    color: hexToLinear(species.hex),
    netted: isNetted(repo),
    home: homeFor(id, depthM, size),
    depthM,
    phase: (hashString(id) % 10007) / 10007,
    fabricated: !!opts.fabricated,
  }
}
