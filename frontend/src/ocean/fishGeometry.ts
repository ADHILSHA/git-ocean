import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** Unit fish: head at +x, total length 1, centred on the origin. */
export function createFishGeometry(detail = 1): THREE.BufferGeometry {
  const body = new THREE.SphereGeometry(0.5, Math.round(22 * detail), Math.round(14 * detail))
  body.scale(0.88, 0.34, 0.22)
  body.translate(0.06, 0, 0)
  const p = body.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const t = THREE.MathUtils.smoothstep(v.x, -0.4, 0.15)
    const taper = 0.38 + 0.62 * t
    p.setXYZ(i, v.x, v.y * taper, v.z * taper)
  }
  body.computeVertexNormals()

  const tail = new THREE.SphereGeometry(0.5, 10, 8)
  tail.scale(0.16, 0.36, 0.035)
  tail.translate(-0.42, 0, 0)

  const fin = new THREE.SphereGeometry(0.5, 8, 6)
  fin.scale(0.22, 0.12, 0.025)
  fin.rotateZ(-0.5)
  fin.translate(0.0, 0.15, 0)

  const merged = mergeGeometries([body, tail, fin])!
  merged.computeBoundingSphere()
  return merged
}
