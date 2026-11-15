import type { RepoData } from '../types/repo'

/** Best match for a typed name: exact repo name, then exact owner/name, then prefix, then substring; ties by stars. */
export function rankMatch(term: string, repos: RepoData[]): RepoData | null {
  const t = term.trim().toLowerCase()
  if (!t) return null
  const score = (r: RepoData) => {
    const full = r.nameWithOwner.toLowerCase()
    const name = full.split('/')[1] ?? full
    if (full === t) return 5
    if (name === t) return 4
    if (name.startsWith(t)) return 3
    if (name.includes(t)) return 2
    if (full.includes(t)) return 1
    return 0
  }
  let best: RepoData | null = null
  let bestScore = 0
  for (const r of repos) {
    const s = score(r)
    if (s > bestScore || (s === bestScore && s > 0 && best && r.stargazerCount > best.stargazerCount)) {
      best = r
      bestScore = s
    }
  }
  return best
}
