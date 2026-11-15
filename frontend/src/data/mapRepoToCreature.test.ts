import { describe, expect, it } from 'vitest'
import { activityOf, depthFromStars, isNetted, mapRepoToCreature, sizeFromStars } from './mapRepoToCreature'
import { fixtureRepos } from './fixtures'
import { speciesFor } from './species'

const NOW = Date.parse('2026-11-15T00:00:00Z')

describe('PRD §5 metaphor table', () => {
  it('size follows 3 + (log10(stars+1)/5.4)^1.5 × 95', () => {
    expect(sizeFromStars(0)).toBe(3)
    expect(sizeFromStars(232000)).toBeCloseTo(3 + Math.pow(Math.log10(232001) / 5.4, 1.5) * 95, 6)
    expect(sizeFromStars(232000)).toBeGreaterThan(90)
  })
  it('recent, busy repos glow; stale and archived ones do not', () => {
    const fresh = activityOf({ pushedAt: '2026-11-14T12:00:00Z', commitsLast30d: 200, isArchived: false }, NOW)
    const stale = activityOf({ pushedAt: '2024-01-01T00:00:00Z', commitsLast30d: 0, isArchived: false }, NOW)
    expect(fresh).toBeGreaterThan(0.9)
    expect(stale).toBeLessThan(0.01)
    expect(activityOf({ pushedAt: '2026-11-14T12:00:00Z', commitsLast30d: 200, isArchived: true }, NOW)).toBe(0)
  })
  it('netting means stale unanswered issues, never a high open-issue count', () => {
    expect(isNetted({ staleUnansweredIssues: 0 })).toBe(false)
    expect(isNetted({ staleUnansweredIssues: 3 })).toBe(true)
    const busy = fixtureRepos(NOW).find((r) => r.nameWithOwner === 'microsoft/vscode')!
    expect(busy.openIssues).toBeGreaterThan(1000)
    expect(mapRepoToCreature(busy, { now: NOW }).netted).toBe(false)
  })
  it('depth is the inverse of fame: legends live in the abyss', () => {
    expect(depthFromStars(10, 'a/b')).toBeLessThan(1000)
    expect(depthFromStars(232000, 'facebook/react')).toBeGreaterThan(8500)
  })
  it('species colour comes from the language table, with one shared colour for the rest', () => {
    expect(speciesFor('Rust').hex).toBe('#ffb48a')
    expect(speciesFor('Kotlin').language).toBe('Other')
    expect(speciesFor(null).language).toBe('Other')
  })
  it('mapping is deterministic', () => {
    const r = fixtureRepos(NOW)[0]
    expect(mapRepoToCreature(r, { now: NOW })).toEqual(mapRepoToCreature(r, { now: NOW }))
  })
  it('fixtures give 200+ creatures with variety', () => {
    const cs = fixtureRepos(NOW).map((r) => mapRepoToCreature(r, { now: NOW }))
    expect(cs.length).toBeGreaterThanOrEqual(200)
    expect(new Set(cs.map((c) => c.species)).size).toBeGreaterThanOrEqual(9)
    expect(cs.filter((c) => c.netted).length).toBeGreaterThan(10)
    expect(new Set(cs.map((c) => c.id)).size).toBe(cs.length)
  })
})
