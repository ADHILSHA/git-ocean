/**
 * CPU copy of the swim path in shaders/swim.glsl. Keep the two in lockstep:
 * picking and the dive camera use this to find where a fish actually is.
 */
import type { Creature } from '../types/repo'
import { WORLD_UNITS_PER_PX } from '../data/mapRepoToCreature'

const TAU = Math.PI * 2

/** Shared ocean clock (seconds). Frozen at 0 under reduced motion. */
export const oceanClock = { t: 0 }

export const worldSize = (c: Pick<Creature, 'size'>) => c.size * WORLD_UNITS_PER_PX

export function swimParams(size: number, activity: number) {
  const lin = (3 + 22 * Math.pow(activity, 1.5)) / (1 + size / 80)
  const radius = 14 + size * 0.7
  return { radius, w: lin / radius }
}

export function creaturePosition(c: Pick<Creature, 'size' | 'activity' | 'phase' | 'home'>, t: number): [number, number, number] {
  const size = worldSize(c)
  const { radius: A, w } = swimParams(size, c.activity)
  const theta = c.phase * TAU + w * t + (w / 1.9) * 0.8 * c.activity * Math.sin(t * 1.9 + c.phase * 17)
  return [
    c.home[0] + A * Math.cos(theta),
    c.home[1] + A * 0.12 * Math.sin(2 * theta) + Math.sin(t * 0.6 + c.phase * 11) * 2,
    c.home[2] + A * 0.3 * Math.sin(theta),
  ]
}
