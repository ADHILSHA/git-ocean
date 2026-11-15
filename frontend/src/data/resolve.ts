/**
 * Search resolution (PRD §7.2): match a loaded creature by name substring,
 * then ask the edge function, then fabricate. Never fails.
 */
import type { Creature } from '../types/repo'
import { fabricateCreature } from './fabricate'
import { fetchRepo, searchRepo } from './github'
import { mapRepoToCreature } from './mapRepoToCreature'
import { rankMatch } from './rank'

export async function resolveSearch(term: string, loaded: Creature[]): Promise<Creature> {
  const local = rankMatch(term, loaded.filter((c) => !c.fabricated).map((c) => c.repo))
  if (local) return loaded.find((c) => c.repo === local)!
  const remote = await searchRepo(term)
  if (remote) return loaded.find((c) => c.id === remote.nameWithOwner.toLowerCase()) ?? mapRepoToCreature(remote)
  return fabricateCreature(term)
}

/** Permalinks resolve through the same layer; an unknown owner/repo fabricates like a search would. */
export async function resolvePermalink(owner: string, name: string, loaded: Creature[]): Promise<Creature> {
  const id = `${owner}/${name}`.toLowerCase()
  const hit = loaded.find((c) => c.id === id)
  if (hit) return hit
  const remote = await fetchRepo(owner, name)
  if (remote) return mapRepoToCreature(remote)
  return fabricateCreature(name)
}
