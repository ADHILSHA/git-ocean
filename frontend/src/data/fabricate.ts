/**
 * PRD §7.2: a search with no match still lands somewhere. The creature is
 * deterministic per search term (same term, same creature) and is flagged
 * `fabricated` so the UI never presents its numbers as real (decisions.md D-07).
 */
import type { Creature, RepoData } from '../types/repo'
import { mulberry32, hashString } from './hash'
import { mapRepoToCreature } from './mapRepoToCreature'
import { SPECIES } from './species'

const DAY = 86_400_000

export function fabricateRepo(term: string, now = Date.now()): RepoData {
  const clean = term.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'unnamed'
  const rand = mulberry32(hashString(clean))
  // "Deep in the world": fabricated creatures live in the lower half of the ocean.
  const stars = Math.round(Math.pow(10, 3.6 + rand() * 1.6))
  const lang = SPECIES[Math.floor(rand() * SPECIES.length)].language
  const today = Math.floor(now / DAY) * DAY
  return {
    nameWithOwner: `uncharted/${clean}`,
    url: `https://github.com/search?q=${encodeURIComponent(term.trim())}&type=repositories`,
    description: null,
    stargazerCount: stars,
    primaryLanguage: lang,
    pushedAt: new Date(today - Math.floor(rand() * 20) * DAY).toISOString(),
    commitsLast30d: Math.floor(rand() * 60),
    openIssues: 0,
    staleUnansweredIssues: 0,
    staleUnansweredCapped: false,
    oldestStaleIssueUrl: null,
    isArchived: false,
  }
}

export function fabricateCreature(term: string, now = Date.now()): Creature {
  return mapRepoToCreature(fabricateRepo(term, now), { fabricated: true, now })
}
