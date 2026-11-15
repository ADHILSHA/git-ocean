import { depthToY, LANDING_DEPTH_M, MAX_DEPTH_M, VIEW_DISTANCE } from './world'

/** PRD §7.2: idle ease vs. cinematic dive ease (per 60fps frame). */
export const IDLE_LERP = 0.055
export const DIVE_LERP = 0.11
/** Idle downward drift, world units per second (~1.25 m/s). */
export const IDLE_DRIFT_UNITS_PER_S = 4
/** How long the dive takes to ramp up to the full 0.11 factor, so the counter accelerates. */
export const DIVE_RAMP_S = 1.1

export type CameraMode = 'idle' | 'diving' | 'arrived'

export interface Vec3 {
  x: number
  y: number
  z: number
}

/** Frame-rate independent version of `a + (b - a) * factor` tuned at 60fps. */
export function damp(current: number, target: number, factor: number, dt: number) {
  const k = 1 - Math.pow(1 - factor, dt * 60)
  return current + (target - current) * k
}

export function dampVec(current: Vec3, target: Vec3, factor: number, dt: number): Vec3 {
  return {
    x: damp(current.x, target.x, factor, dt),
    y: damp(current.y, target.y, factor, dt),
    z: damp(current.z, target.z, factor, dt),
  }
}

/** Dive factor ramps from a crawl to DIVE_LERP over DIVE_RAMP_S (ease-in, then the lerp eases out). */
export function diveFactor(elapsedS: number) {
  const t = Math.min(1, Math.max(0, elapsedS / DIVE_RAMP_S))
  return 0.004 + (DIVE_LERP - 0.004) * t * t
}

export const landingPosition = (): Vec3 => ({ x: 0, y: depthToY(LANDING_DEPTH_M), z: VIEW_DISTANCE })

export const clampY = (y: number) => Math.min(depthToY(0), Math.max(depthToY(MAX_DEPTH_M), y))

/** Body length (world units) of the largest possible creature (~250K stars). */
export const MAX_CREATURE = 98 * 1.5

/**
 * Camera distance on arrival. The largest creatures span ~55% of the viewport
 * width (PRD Flow 1: the whale fills 40%+); smaller ones fill less, sub-linearly,
 * so scale still reads after the dive instead of every fish looking whale-sized.
 * Portrait screens use more of their narrow width.
 */
export function framingFill(size: number, aspect: number) {
  const base = aspect < 1 ? 0.8 : 0.55
  return base * Math.pow(Math.min(1, size / MAX_CREATURE), 0.4)
}

export function framingDistance(size: number, fovDeg: number, aspect: number) {
  const halfTan = Math.tan((fovDeg * Math.PI) / 360)
  return Math.max(6, size / (framingFill(size, aspect) * 2 * halfTan * aspect))
}
