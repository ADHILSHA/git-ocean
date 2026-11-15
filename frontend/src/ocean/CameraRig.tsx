import { useFrame } from '@react-three/fiber'
import { clampY, damp, diveFactor, framingDistance, IDLE_DRIFT_UNITS_PER_S, IDLE_LERP, landingPosition } from './camera'
import { creaturePosition, oceanClock, worldSize } from './motion'
import { depthToY, FOV, VIEW_DISTANCE, yToDepth } from './world'
import { publishDepth, useOcean } from '../store/oceanStore'

export const initialCamera = landingPosition()

// Test/dev aid: `?depth=9000` starts the visit at that depth.
if (typeof location !== 'undefined') {
  const d = Number(new URLSearchParams(location.search).get('depth'))
  if (d > 0) initialCamera.y = depthToY(d)
}

/** Mutable idle swim target. Wheel / drag / keys nudge it; the camera eases toward it. */
export const idleTarget = { y: initialCamera.y }

/** Swim up (negative) or down (positive) by `deltaUnits`. Leaves a finished dive. */
export function nudgeDepth(deltaUnits: number) {
  const s = useOcean.getState()
  if (s.camera.mode === 'arrived') s.endDive()
  if (s.camera.mode === 'diving') return
  idleTarget.y = clampY(idleTarget.y - deltaUnits)
}

/** Teleport (used by permalinks to start "above" a creature, and by reduced motion). */
export function placeCamera(y: number) {
  idleTarget.y = clampY(y)
  cameraJump.y = idleTarget.y
}
const cameraJump: { y: number | null } = { y: null }

const ARRIVE_EPS = 0.02

/** Portrait screens stand further back in open water so the shoal still fits across them. */
const idleZ = (aspect: number) => VIEW_DISTANCE + (aspect < 1 ? (1 - aspect) * 520 : 0)

export function CameraRig() {
  useFrame(({ camera, size }, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const s = useOcean.getState()
    const pos = camera.position
    if (cameraJump.y !== null) {
      pos.set(0, cameraJump.y, VIEW_DISTANCE)
      cameraJump.y = null
    }
    const target = s.camera.targetId ? s.creatures.find((c) => c.id === s.camera.targetId) : undefined

    if (target && s.camera.mode !== 'idle') {
      const [cx, cy, cz] = creaturePosition(target, oceanClock.t)
      const dist = framingDistance(worldSize(target), FOV, size.width / size.height)
      const tx = cx
      const ty = cy + worldSize(target) * 0.05
      const tz = cz + dist
      if (s.reducedMotion) {
        pos.set(tx, ty, tz)
      } else {
        const f = s.camera.mode === 'diving' ? diveFactor((performance.now() - s.camera.diveStartedAt) / 1000) : 0.08
        pos.set(damp(pos.x, tx, f, dt), damp(pos.y, ty, f, dt), damp(pos.z, tz, f, dt))
      }
      if (s.camera.mode === 'diving') {
        const remaining = Math.hypot(tx - pos.x, ty - pos.y, tz - pos.z)
        if (remaining < Math.max(1.5, dist * ARRIVE_EPS) || s.reducedMotion) s.arrive()
      }
      idleTarget.y = pos.y
    } else {
      if (!s.reducedMotion) idleTarget.y = clampY(idleTarget.y - IDLE_DRIFT_UNITS_PER_S * dt)
      if (s.reducedMotion) {
        pos.set(0, idleTarget.y, idleZ(size.width / size.height))
      } else {
        pos.y = damp(pos.y, idleTarget.y, IDLE_LERP, dt)
        // After a dive, drift back out to the open-water viewpoint.
        pos.x = damp(pos.x, 0, IDLE_LERP * 0.25, dt)
        pos.z = damp(pos.z, idleZ(size.width / size.height), IDLE_LERP * 0.25, dt)
      }
    }
    camera.lookAt(pos.x, pos.y, pos.z - 1)
    publishDepth(yToDepth(pos.y))
  })
  return null
}
