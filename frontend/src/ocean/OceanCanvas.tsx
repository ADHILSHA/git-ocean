import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { CameraRig, initialCamera } from './CameraRig'
import { CreatureField } from './CreatureField'
import { SelectionRing } from './SelectionRing'
import { attachInput, exposeForTests } from './input'
import { trackPointer } from './pointer'
import { Plankton } from './Plankton'
import { GodRays, Water } from './Water'
import { FOV } from './world'

export function OceanCanvas() {
  return (
    <Canvas
      className="ocean-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ position: [initialCamera.x, initialCamera.y, initialCamera.z], fov: FOV, near: 0.5, far: 2400 }}
      aria-hidden="true"
      onCreated={({ gl, get }) => {
        trackPointer(gl.domElement)
        attachInput(get)
        if (import.meta.env.DEV) exposeForTests(get)
      }}
    >
      <fog attach="fog" args={['#0a3550', 260, 1400]} />
      <Water />
      <Plankton />
      <CreatureField />
      <GodRays />
      <CameraRig />
      <SelectionRing />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.62} luminanceSmoothing={0.2} intensity={0.85} mipmapBlur />
        <Vignette offset={0.28} darkness={0.78} />
      </EffectComposer>
    </Canvas>
  )
}
