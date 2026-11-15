/**
 * Fixture ocean for GITHUB_PROVIDER=mock (no token, tests, offline dev).
 * Numbers are illustrative, not live GitHub data. A handful of well-known
 * repo names are included so search and permalinks can be exercised.
 */
import type { RepoData } from '../types/repo'
import { mulberry32 } from './hash'

const DAY = 86_400_000

interface Seed {
  name: string
  stars: number
  lang: string | null
  daysAgo: number
  commits: number
  issues: number
  stale?: number
}

const KNOWN: Seed[] = [
  { name: 'facebook/react', stars: 232000, lang: 'JavaScript', daysAgo: 0, commits: 210, issues: 820 },
  { name: 'torvalds/linux', stars: 186000, lang: 'C', daysAgo: 0, commits: 1000, issues: 0 },
  { name: 'microsoft/vscode', stars: 168000, lang: 'TypeScript', daysAgo: 0, commits: 900, issues: 9800 },
  { name: 'tensorflow/tensorflow', stars: 187000, lang: 'C++', daysAgo: 1, commits: 400, issues: 2100, stale: 14 },
  { name: 'rust-lang/rust', stars: 99000, lang: 'Rust', daysAgo: 0, commits: 800, issues: 10400 },
  { name: 'golang/go', stars: 124000, lang: 'Go', daysAgo: 0, commits: 350, issues: 9000, stale: 6 },
  { name: 'python/cpython', stars: 64000, lang: 'Python', daysAgo: 0, commits: 600, issues: 7000 },
  { name: 'rails/rails', stars: 56000, lang: 'Ruby', daysAgo: 0, commits: 280, issues: 450 },
  { name: 'spring-projects/spring-boot', stars: 75000, lang: 'Java', daysAgo: 0, commits: 320, issues: 500 },
  { name: 'vuejs/vue', stars: 208000, lang: 'TypeScript', daysAgo: 160, commits: 0, issues: 360, stale: 9 },
  { name: 'django/django', stars: 81000, lang: 'Python', daysAgo: 0, commits: 140, issues: 0 },
  { name: 'denoland/deno', stars: 98000, lang: 'Rust', daysAgo: 0, commits: 260, issues: 2200 },
  { name: 'vercel/next.js', stars: 127000, lang: 'JavaScript', daysAgo: 0, commits: 700, issues: 3100 },
  { name: 'kubernetes/kubernetes', stars: 111000, lang: 'Go', daysAgo: 0, commits: 500, issues: 2600 },
  { name: 'nodejs/node', stars: 108000, lang: 'JavaScript', daysAgo: 0, commits: 380, issues: 1700, stale: 3 },
  { name: 'jquery/jquery', stars: 59000, lang: 'JavaScript', daysAgo: 40, commits: 4, issues: 60, stale: 2 },
  { name: 'atom/atom', stars: 60000, lang: 'JavaScript', daysAgo: 900, commits: 0, issues: 0 },
  { name: 'tokio-rs/tokio', stars: 27000, lang: 'Rust', daysAgo: 1, commits: 60, issues: 330 },
  { name: 'pallets/flask', stars: 68000, lang: 'Python', daysAgo: 3, commits: 25, issues: 5 },
  { name: 'sinatra/sinatra', stars: 12000, lang: 'Ruby', daysAgo: 60, commits: 2, issues: 40, stale: 5 },
  { name: 'redis/redis', stars: 67000, lang: 'C', daysAgo: 0, commits: 90, issues: 2300, stale: 31 },
  { name: 'gohugoio/hugo', stars: 76000, lang: 'Go', daysAgo: 1, commits: 70, issues: 600 },
  { name: 'pmndrs/zustand', stars: 48000, lang: 'TypeScript', daysAgo: 2, commits: 30, issues: 4 },
  { name: 'square/okhttp', stars: 46000, lang: 'Kotlin', daysAgo: 1, commits: 45, issues: 150, stale: 4 },
  { name: 'apple/swift', stars: 67000, lang: 'C++', daysAgo: 0, commits: 900, issues: 7000, stale: 22 },
]

const OWNERS = ['tidepool', 'kelpworks', 'brineco', 'saltmarsh', 'deeplab', 'coralsoft', 'anchorhq', 'lanternfish', 'reefline', 'mareio', 'driftwood', 'hadal', 'pelagic', 'nautilo', 'seaglass', 'abyssal']
const NAMES = ['tide', 'kelp', 'reef', 'current', 'shoal', 'brine', 'swell', 'trench', 'drift', 'lantern', 'gyre', 'eddy', 'surge', 'fathom', 'harbor', 'buoy', 'sonar', 'marlin', 'squid', 'urchin', 'kraken', 'plankton', 'nacre', 'sounding']
const SUFFIX = ['', '-js', '-rs', '-cli', '-core', '-kit', '.py', '-go', '-lab', '-ui', '-db', '-sync']
const LANGS: (string | null)[] = ['Python', 'Python', 'JavaScript', 'JavaScript', 'TypeScript', 'TypeScript', 'Rust', 'Go', 'Go', 'C', 'C++', 'Ruby', 'Java', 'Java', 'Kotlin', 'Shell', 'Swift', null]

function generated(count: number): Seed[] {
  const rand = mulberry32(20261115)
  const out: Seed[] = []
  const used = new Set(KNOWN.map((k) => k.name))
  while (out.length < count) {
    const owner = OWNERS[Math.floor(rand() * OWNERS.length)]
    const name = NAMES[Math.floor(rand() * NAMES.length)] + SUFFIX[Math.floor(rand() * SUFFIX.length)]
    const full = `${owner}/${name}`
    if (used.has(full)) continue
    used.add(full)
    const tier = rand()
    // ~60% small, ~30% mid, ~10% large: the shallows are where most repos live.
    const stars = tier < 0.6 ? Math.floor(5 + Math.pow(rand(), 2) * 400) : tier < 0.9 ? Math.floor(500 + Math.pow(rand(), 2) * 19500) : Math.floor(20000 + rand() * 120000)
    const alive = rand()
    const daysAgo = alive < 0.35 ? Math.floor(rand() * 3) : alive < 0.7 ? Math.floor(rand() * 90) : Math.floor(90 + rand() * 1400)
    const commits = daysAgo < 3 ? Math.floor(5 + rand() * 150) : daysAgo < 30 ? Math.floor(rand() * 12) : 0
    const issues = Math.floor(Math.pow(rand(), 2) * Math.max(3, stars / 40))
    const stale = rand() < 0.13 && issues > 0 ? 1 + Math.floor(rand() * Math.min(19, issues)) : 0
    out.push({ name: full, stars, lang: LANGS[Math.floor(rand() * LANGS.length)], daysAgo, commits, issues, stale })
  }
  return out
}

function toRepo(s: Seed, now: number): RepoData {
  const stale = s.stale ?? 0
  return {
    nameWithOwner: s.name,
    url: `https://github.com/${s.name}`,
    description: null,
    stargazerCount: s.stars,
    primaryLanguage: s.lang,
    pushedAt: new Date(now - s.daysAgo * DAY).toISOString(),
    commitsLast30d: s.commits,
    openIssues: Math.max(s.issues, stale),
    staleUnansweredIssues: stale,
    staleUnansweredCapped: stale >= 20,
    oldestStaleIssueUrl: stale > 0 ? `https://github.com/${s.name}/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-asc` : null,
    isArchived: s.name === 'atom/atom',
  }
}

export function fixtureRepos(now = Date.now(), count = 260): RepoData[] {
  return [...KNOWN, ...generated(count - KNOWN.length)].map((s) => toRepo(s, now))
}
