import { describe, expect, it } from 'vitest'
import { damp, diveFactor, DIVE_LERP, framingDistance } from './camera'
import { depthToY, yToDepth, WORLD_R } from './world'

describe('camera maths', () => {
  it('depth is 0 at the surface and grows downward', () => {
    expect(yToDepth(WORLD_R)).toBe(0)
    expect(yToDepth(WORLD_R - 3200)).toBeCloseTo(1000)
    expect(yToDepth(depthToY(9400))).toBeCloseTo(9400)
  })
  it('damp matches the plain lerp factor at 60fps', () => {
    expect(damp(0, 100, 0.11, 1 / 60)).toBeCloseTo(11)
  })
  it('dive factor ramps to 0.11', () => {
    expect(diveFactor(0)).toBeLessThan(0.01)
    expect(diveFactor(5)).toBeCloseTo(DIVE_LERP)
  })
  it('framing distance fills the requested fraction of the view', () => {
    const d = framingDistance(98, 55, 0.55)
    const visibleH = 2 * d * Math.tan((55 * Math.PI) / 360)
    expect(98 / visibleH).toBeCloseTo(0.55)
  })
})
