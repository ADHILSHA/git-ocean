import { useFrame } from '@react-three/fiber'
import { clampY, damp, IDLE_DRIFT_UNITS_PER_S, IDLE_LERP, landingPosition } from './camera'
import { depthToY, yToDepth } from './world'
import { publishDepth, useOcean } from '../store/oceanStore'

export const initialCamera = landingPosition()

// Test/dev aid: `?depth=9000` starts the visit at that depth.
if (typeof location !== 'undefined') {
  const d = Number(new URLSearchParams(location.search).get('depth'))
  if (d > 0) initialCamera.y = depthToY(d)
}

/** Mutable idle swim target. Wheel / drag / keys nudge it; the camera eases toward it. */
export const idleTarget = { y: initialCamera.y }

export function nudgeDepth(deltaUnits: number) {
  idleTarget.y = clampY(idleTarget.y - deltaUnits)
}

/** Idle drift: the target sinks slowly, the camera eases after it at the idle lerp. */
export function CameraRig() {
  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const { reducedMotion } = useOcean.getState()
    if (!reducedMotion) idleTarget.y = clampY(idleTarget.y - IDLE_DRIFT_UNITS_PER_S * dt)
    camera.position.y = reducedMotion ? idleTarget.y : damp(camera.position.y, idleTarget.y, IDLE_LERP, dt)
    camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 1)
    publishDepth(yToDepth(camera.position.y))
  })
  return null
}
