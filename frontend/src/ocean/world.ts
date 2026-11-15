/**
 * World geometry. +Y is up in Three.js; the surface sits at y = +WORLD_R and the
 * abyss floor at y = -WORLD_R. PRD §7.3 writes depth as (camera.y + WORLD_R) / 3.2,
 * which assumes a y-down axis; see docs/decisions.md (D-01) for the flip.
 */
export const WORLD_R = 15000
export const METRES_PER_UNIT = 1 / 3.2
/** Depth the camera starts at on a fresh visit (PRD Flow 1 step 2: "~300m"). */
export const LANDING_DEPTH_M = 300
/** Deepest point the abyss reaches, in metres. */
export const MAX_DEPTH_M = (2 * WORLD_R) * METRES_PER_UNIT

/** Camera distance (along +z) from the creature plane. */
export const VIEW_DISTANCE = 220
export const FOV = 55

export const yToDepth = (y: number) => Math.max(0, (WORLD_R - y) * METRES_PER_UNIT)
export const depthToY = (depthM: number) => WORLD_R - depthM / METRES_PER_UNIT

/** 0 at the surface, 1 at the deepest legends; drives water colour and light. */
export const depthFraction = (depthM: number) => Math.min(1, Math.max(0, depthM / 9400))
