import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { creaturePosition, oceanClock, worldSize } from './motion'
import { FOV } from './world'
import { useOcean } from '../store/oceanStore'

const v = new THREE.Vector3()
const TAN_HALF = Math.tan((FOV * Math.PI) / 360)

/**
 * Positions the HTML ring (#selection-ring) over the selected creature each frame,
 * so a card about a tiny fish still points at it. Hidden once the fish fills the view.
 */
export function SelectionRing() {
  useFrame(({ camera, size }) => {
    const el = document.getElementById('selection-ring')
    if (!el) return
    const s = useOcean.getState()
    const c = s.selectionId ? s.creatures.find((x) => x.id === s.selectionId) : undefined
    if (!c) {
      el.hidden = true
      return
    }
    const [x, y, z] = creaturePosition(c, oceanClock.t)
    const along = camera.position.z - z
    v.set(x, y, z).project(camera)
    const r = Math.max(16, (worldSize(c) * 0.6 * size.height) / 2 / (along * TAN_HALF))
    if (along < 1 || r > 140 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) {
      el.hidden = true
      return
    }
    el.hidden = false
    el.style.transform = `translate(${((v.x + 1) / 2) * size.width - r}px, ${((1 - v.y) / 2) * size.height - r}px)`
    el.style.width = el.style.height = `${r * 2}px`
  })
  return null
}
