import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

function lobe(sx: number, sy: number, sz: number, rotZ: number, x: number, y: number, seg = 12) {
  const g = new THREE.SphereGeometry(0.5, seg, Math.round(seg * 0.7))
  g.scale(sx, sy, sz)
  g.rotateZ(rotZ)
  g.translate(x, y, 0)
  return g
}

/** Unit fish: head at +x, total length 1, centred on the origin. Fins are part of the same mesh. */
export function createFishGeometry(): THREE.BufferGeometry {
  const body = new THREE.SphereGeometry(0.5, 40, 24)
  body.scale(0.84, 0.32, 0.21)
  body.translate(0.07, 0, 0)
  const p = body.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    // Taper toward a narrow tail stalk; slightly flatter belly.
    const t = THREE.MathUtils.smoothstep(v.x, -0.36, 0.2)
    const taper = 0.28 + 0.72 * t
    const belly = v.y < 0 ? 0.88 : 1
    p.setXYZ(i, v.x, v.y * taper * belly, v.z * taper)
  }
  body.computeVertexNormals()

  const parts = [
    body,
    // Forked tail.
    lobe(0.22, 0.06, 0.025, -0.8, -0.42, 0.085),
    lobe(0.22, 0.06, 0.025, 0.8, -0.42, -0.085),
    // Swept dorsal fin and a small pectoral.
    lobe(0.24, 0.07, 0.02, -0.42, 0.0, 0.13),
    lobe(0.12, 0.035, 0.02, 0.5, 0.12, -0.09, 10),
  ]
  // mergeGeometries needs matching attribute sets.
  parts.forEach((g) => g.deleteAttribute('uv'))
  const merged = mergeGeometries(parts)!
  merged.computeBoundingSphere()
  return merged
}
