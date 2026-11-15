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
    const tan = Math.tan((55 * Math.PI) / 360)
    const whale = 95 * 1.5 // react-sized
    const d = framingDistance(whale, 55, 1.6)
    expect(whale / (2 * d * tan * 1.6)).toBeGreaterThan(0.4) // PRD: 40%+ of the viewport
    const p = framingDistance(whale, 55, 0.5)
    expect(whale / (2 * p * tan * 0.5)).toBeGreaterThan(0.75)
    const minnow = 10 * 1.5
    const m = framingDistance(minnow, 55, 1.6)
    expect(minnow / (2 * m * tan * 1.6)).toBeLessThan(0.3) // small stays visibly small
  })
})
