import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import fullscreenVert from './shaders/fullscreen.vert.glsl'
import waterFrag from './shaders/water.frag.glsl'
import godraysFrag from './shaders/godrays.frag.glsl'
import { depthFraction, yToDepth } from './world'
import { useOcean } from '../store/oceanStore'

const SURFACE = new THREE.Color('#0d4a68')
const ABYSS = new THREE.Color('#00060f')

/** Full-screen depth gradient behind everything, plus scene fog of the same water colour. */
export function Water() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVert,
        fragmentShader: waterFrag,
        uniforms: { uDepthFrac: { value: 0 }, uTime: { value: 0 } },
        depthTest: false,
        depthWrite: false,
      }),
    [],
  )
  const fogColor = useMemo(() => new THREE.Color(), [])

  useFrame(({ camera, scene, clock }) => {
    if (!performance.getEntriesByName('ocean:first-frame').length) performance.mark('ocean:first-frame')
    const frac = depthFraction(yToDepth(camera.position.y))
    material.uniforms.uDepthFrac.value = frac
    material.uniforms.uTime.value = useOcean.getState().reducedMotion ? 0 : clock.elapsedTime
    fogColor.copy(SURFACE).lerp(ABYSS, Math.pow(frac, 0.55)).multiplyScalar(0.8)
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(fogColor)
  })

  return (
    <mesh renderOrder={-1000} frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}

/** 6 volumetric-looking shafts from the surface; they fade out by the twilight zone. */
export function GodRays() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVert,
        fragmentShader: godraysFrag,
        uniforms: { uTime: { value: 0 }, uStrength: { value: 1 }, uAspect: { value: 1 } },
        depthTest: false,
        depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useFrame(({ camera, clock, size }) => {
    const depth = yToDepth(camera.position.y)
    material.uniforms.uStrength.value = Math.pow(1 - Math.min(1, depth / 3200), 1.6)
    material.uniforms.uAspect.value = size.width / size.height
    // Reduced motion: shafts hold still at a fixed phase.
    material.uniforms.uTime.value = useOcean.getState().reducedMotion ? 12 : clock.elapsedTime
  })
  return (
    <mesh renderOrder={1000} frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
