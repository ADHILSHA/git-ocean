import type { Creature } from '../types/repo'
import { useOcean } from '../store/oceanStore'

/** Shared by search and permalinks so both produce the exact same dive. */
export function startDive(c: Creature) {
  const s = useOcean.getState()
  s.addCreature(c)
  s.diveTo(c.id)
}

export const permalinkFor = (c: Creature) => `/dive/${c.repo.nameWithOwner}`
