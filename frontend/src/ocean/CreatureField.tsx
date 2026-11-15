import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import creatureVert from './shaders/creature.vert.glsl'
import creatureFrag from './shaders/creature.frag.glsl'
import nettingVert from './shaders/netting.vert.glsl'
import nettingFrag from './shaders/netting.frag.glsl'
import { createFishGeometry } from './fishGeometry'
import { oceanClock, worldSize } from './motion'
import { pointer } from './pointer'
import { FOV } from './world'
import { useOcean } from '../store/oceanStore'
import type { Creature } from '../types/repo'

function instancedGeometry(base: THREE.BufferGeometry, list: Creature[], allIndex: Map<string, number>) {
  const g = new THREE.InstancedBufferGeometry()
  g.index = base.index
  g.attributes.position = base.attributes.position
  g.attributes.normal = base.attributes.normal
  const n = list.length
  const home = new Float32Array(n * 3)
  const color = new Float32Array(n * 3)
  const size = new Float32Array(n)
  const activity = new Float32Array(n)
  const phase = new Float32Array(n)
  const id = new Float32Array(n)
  list.forEach((c, i) => {
    home.set(c.home, i * 3)
    color.set(c.color, i * 3)
    size[i] = worldSize(c)
    activity[i] = c.activity
    phase[i] = c.phase
    id[i] = allIndex.get(c.id) ?? -1
  })
  g.setAttribute('aHome', new THREE.InstancedBufferAttribute(home, 3))
  g.setAttribute('aColor', new THREE.InstancedBufferAttribute(color, 3))
  g.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 1))
  g.setAttribute('aActivity', new THREE.InstancedBufferAttribute(activity, 1))
  g.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1))
  g.setAttribute('aId', new THREE.InstancedBufferAttribute(id, 1))
  g.instanceCount = n
  return g
}

/**
 * Two instanced draws: every creature body in one, netting shells over netted
 * creatures only in the other (ARCHITECTURE.md, Rendering strategy).
 */
export function CreatureField() {
  const creatures = useOcean((s) => s.creatures)
  const base = useMemo(() => createFishGeometry(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCursor: { value: new THREE.Vector2(9, 9) },
      uFlee: { value: 0 },
      uAspect: { value: 1 },
      uTanHalfFov: { value: Math.tan((FOV * Math.PI) / 360) },
      uSelected: { value: -1 },
      uFogColor: { value: new THREE.Color() },
      uFogNear: { value: 260 },
      uFogFar: { value: 1400 },
    }),
    [],
  )

  const bodyMaterial = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: creatureVert, fragmentShader: creatureFrag, uniforms }),
    [uniforms],
  )
  const netMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: nettingVert,
        fragmentShader: nettingFrag,
        uniforms,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [uniforms],
  )

  const { bodies, nets } = useMemo(() => {
    const index = new Map(creatures.map((c, i) => [c.id, i]))
    return {
      bodies: instancedGeometry(base, creatures, index),
      nets: instancedGeometry(base, creatures.filter((c) => c.netted), index),
    }
  }, [base, creatures])

  useEffect(() => () => {
    bodies.dispose()
    nets.dispose()
  }, [bodies, nets])

  useFrame(({ scene, size }, dt) => {
    const s = useOcean.getState()
    if (!s.reducedMotion) oceanClock.t += Math.min(dt, 0.1)
    uniforms.uTime.value = oceanClock.t
    uniforms.uAspect.value = size.width / size.height
    uniforms.uCursor.value.set(pointer.ndc.x, pointer.ndc.y)
    pointer.energy *= Math.pow(0.12, Math.min(dt, 0.1))
    uniforms.uFlee.value = s.reducedMotion ? 0 : Math.min(1, pointer.energy)
    uniforms.uSelected.value = s.selectionId ? creatures.findIndex((c) => c.id === s.selectionId) : -1
    if (scene.fog instanceof THREE.Fog) {
      uniforms.uFogColor.value.copy(scene.fog.color)
      uniforms.uFogNear.value = scene.fog.near
      uniforms.uFogFar.value = scene.fog.far
    }
  })

  return (
    <group>
      {creatures.length > 0 && <mesh geometry={bodies} material={bodyMaterial} frustumCulled={false} />}
      {nets.instanceCount > 0 && <mesh geometry={nets} material={netMaterial} frustumCulled={false} renderOrder={2} />}
    </group>
  )
}
