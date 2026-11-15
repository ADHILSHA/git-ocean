import { describe, expect, it } from 'vitest'
import { fabricateCreature } from './fabricate'
import { rankMatch } from './rank'
import { fixtureRepos } from './fixtures'

const NOW = Date.parse('2026-11-15T10:00:00Z')

describe('fabricate', () => {
  it('is deterministic per search term', () => {
    expect(fabricateCreature('my-imaginary-repo', NOW)).toEqual(fabricateCreature('my-imaginary-repo', NOW))
    expect(fabricateCreature('another', NOW).id).not.toBe(fabricateCreature('my-imaginary-repo', NOW).id)
  })
  it('is flagged as fabricated and lives deep', () => {
    const c = fabricateCreature('nothing-here', NOW)
    expect(c.fabricated).toBe(true)
    expect(c.netted).toBe(false)
    expect(c.depthM).toBeGreaterThan(3000)
  })
})

describe('rankMatch', () => {
  const repos = fixtureRepos(NOW)
  it('prefers exact repo names, then stars', () => {
    expect(rankMatch('react', repos)?.nameWithOwner).toBe('facebook/react')
    expect(rankMatch('facebook/react', repos)?.nameWithOwner).toBe('facebook/react')
    expect(rankMatch('RUST', repos)?.nameWithOwner).toBe('rust-lang/rust')
  })
  it('matches substrings and returns null on no match', () => {
    expect(rankMatch('kuber', repos)?.nameWithOwner).toBe('kubernetes/kubernetes')
    expect(rankMatch('zzqqxx', repos)).toBeNull()
  })
})
