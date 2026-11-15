import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import vert from './shaders/plankton.vert.glsl'
import frag from './shaders/plankton.frag.glsl'
import { depthFraction, yToDepth } from './world'
import { useOcean } from '../store/oceanStore'

const COUNT = 260
const BOX = 520

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function Plankton() {
  const dpr = useThree((s) => s.viewport.dpr)
  const geometry = useMemo(() => {
    const rand = mulberry32(7)
    const pos = new Float32Array(COUNT * 3)
    const seed = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (rand() - 0.5) * BOX
      pos[i * 3 + 1] = (rand() - 0.5) * BOX
      pos[i * 3 + 2] = (rand() - 0.5) * BOX
      seed[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTime: { value: 0 },
          uCam: { value: new THREE.Vector3() },
          uBox: { value: BOX },
          uPixelRatio: { value: dpr },
          uDim: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [dpr],
  )
  useFrame(({ camera, clock }) => {
    material.uniforms.uTime.value = useOcean.getState().reducedMotion ? 0 : clock.elapsedTime
    material.uniforms.uCam.value.copy(camera.position)
    material.uniforms.uDim.value = 1 - depthFraction(yToDepth(camera.position.y)) * 0.55
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}
