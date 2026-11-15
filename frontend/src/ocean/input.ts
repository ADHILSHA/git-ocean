/**
 * Canvas input: pick creatures (click / tap), swim up and down (wheel, touch
 * drag, arrow keys). Picking runs on the CPU against ocean/motion.ts, so it
 * matches what the shader draws.
 */
import * as THREE from 'three'
import type { RootState } from '@react-three/fiber'
import { nudgeDepth } from './CameraRig'
import { creaturePosition, oceanClock, worldSize } from './motion'
import { FOV } from './world'
import { useOcean } from '../store/oceanStore'

const v = new THREE.Vector3()
const TAN_HALF = Math.tan((FOV * Math.PI) / 360)

export function pickCreature(state: RootState, clientX: number, clientY: number): string | null {
  const { camera, size, gl } = state
  const rect = gl.domElement.getBoundingClientRect()
  const px = clientX - rect.left
  const py = clientY - rect.top
  let best: string | null = null
  let bestScore = 1
  for (const c of useOcean.getState().creatures) {
    const [x, y, z] = creaturePosition(c, oceanClock.t)
    const along = camera.position.z - z
    if (along < 1 || along > 1400) continue
    v.set(x, y, z).project(camera)
    const sx = ((v.x + 1) / 2) * size.width
    const sy = ((1 - v.y) / 2) * size.height
    const ppu = size.height / 2 / (along * TAN_HALF)
    const radius = Math.max(22, worldSize(c) * 0.5 * ppu)
    const score = Math.hypot(sx - px, sy - py) / radius
    // Nearer creatures win ties so a fish in front isn't hidden by one behind it.
    if (score < bestScore - 0.0001 * along) {
      bestScore = score
      best = c.id
    }
  }
  return best
}

export function attachInput(getState: () => RootState) {
  const el = getState().gl.domElement
  let down: { x: number; y: number; t: number; lastY: number; touch: boolean } | null = null

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    nudgeDepth(Math.max(-260, Math.min(260, e.deltaY * 0.9)))
  }
  const onDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY, t: performance.now(), lastY: e.clientY, touch: e.pointerType !== 'mouse' }
  }
  const onMove = (e: PointerEvent) => {
    if (down?.touch) {
      // Drag up to swim deeper, like scrolling a page.
      nudgeDepth((down.lastY - e.clientY) * 2.2)
      down.lastY = e.clientY
    } else if (e.pointerType === 'mouse') {
      el.style.cursor = pickCreature(getState(), e.clientX, e.clientY) ? 'pointer' : ''
    }
  }
  const onUp = (e: PointerEvent) => {
    if (!down) return
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y)
    const quick = performance.now() - down.t < 600
    down = null
    if (moved > 10 || !quick) return
    const id = pickCreature(getState(), e.clientX, e.clientY)
    const s = useOcean.getState()
    if (id && s.camera.mode === 'arrived' && s.camera.targetId !== id) s.endDive()
    s.select(id)
  }
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
    const step = { ArrowDown: 120, ArrowUp: -120, PageDown: 600, PageUp: -600 }[e.key]
    if (step) {
      e.preventDefault()
      nudgeDepth(step)
    }
  }

  el.addEventListener('wheel', onWheel, { passive: false })
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointercancel', () => (down = null))
  window.addEventListener('keydown', onKey)
  return () => {
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onUp)
    window.removeEventListener('keydown', onKey)
  }
}
