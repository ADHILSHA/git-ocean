import { create } from 'zustand'
import type { CameraMode } from '../ocean/camera'
import type { Creature, DataSource } from '../types/repo'

const SPECIES_KEY = 'git-ocean:species'

function loadSpecies(): string[] {
  try {
    const raw = localStorage.getItem(SPECIES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export interface OceanState {
  creatures: Creature[]
  dataSource: DataSource | null
  camera: { mode: CameraMode; targetId: string | null; diveStartedAt: number }
  selectionId: string | null
  speciesDiscovered: string[]
  /** Latest species added, so the panel can mark it quietly. */
  lastSpecies: string | null
  /** Bumped on each dive so the flash replays. */
  flashKey: number
  reducedMotion: boolean

  setCreatures: (c: Creature[], source: DataSource) => void
  addCreature: (c: Creature) => void
  select: (id: string | null) => void
  diveTo: (id: string) => void
  arrive: () => void
  endDive: () => void
  setReducedMotion: (v: boolean) => void
}

export const useOcean = create<OceanState>((set, get) => ({
  creatures: [],
  dataSource: null,
  camera: { mode: 'idle', targetId: null, diveStartedAt: 0 },
  selectionId: null,
  speciesDiscovered: loadSpecies(),
  lastSpecies: null,
  flashKey: 0,
  reducedMotion: false,

  setCreatures: (incoming, source) => {
    // Keep creatures added by search / permalinks that the batch doesn't contain.
    const ids = new Set(incoming.map((c) => c.id))
    const extras = get().creatures.filter((c) => !ids.has(c.id) && (c.fabricated || get().camera.targetId === c.id || get().selectionId === c.id))
    set({ creatures: [...incoming, ...extras], dataSource: source })
  },
  addCreature: (c) => {
    if (get().creatures.some((x) => x.id === c.id)) return
    set({ creatures: [...get().creatures, c] })
  },
  select: (id) => {
    set({ selectionId: id })
    if (!id) return
    const c = get().creatures.find((x) => x.id === id)
    if (!c || c.fabricated) return
    const known = get().speciesDiscovered
    if (!known.includes(c.species)) {
      const next = [...known, c.species]
      try {
        localStorage.setItem(SPECIES_KEY, JSON.stringify(next))
      } catch {
        /* storage unavailable: the log still works for this visit */
      }
      set({ speciesDiscovered: next, lastSpecies: c.species })
    }
  },
  diveTo: (id) =>
    set((s) => ({
      camera: { mode: 'diving', targetId: id, diveStartedAt: performance.now() },
      flashKey: s.flashKey + 1,
      selectionId: null,
        })),
  arrive: () => {
    const { camera } = get()
    if (camera.mode !== 'diving' || !camera.targetId) return
    set({ camera: { ...camera, mode: 'arrived' } })
    get().select(camera.targetId)
  },
  endDive: () => set((s) => ({ camera: { mode: 'idle', targetId: null, diveStartedAt: 0 }, selectionId: s.selectionId })),
  setReducedMotion: (v) => set({ reducedMotion: v }),
}))

/** Depth is written straight to the DOM every frame (not React state) — see DepthCompass. */
export const liveDepth = { metres: 0, listeners: new Set<(m: number) => void>() }
export function publishDepth(m: number) {
  liveDepth.metres = m
  liveDepth.listeners.forEach((fn) => fn(m))
}
