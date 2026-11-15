import { useEffect } from 'react'
import { fetchBatch } from './github'
import { mapRepoToCreature } from './mapRepoToCreature'
import { useOcean } from '../store/oceanStore'

/** Loads the ocean population once per visit. */
export function useOceanData() {
  useEffect(() => {
    let alive = true
    fetchBatch().then((batch) => {
      if (!alive) return
      useOcean.getState().setCreatures(batch.repos.map((r) => mapRepoToCreature(r)), batch.source)
    })
    return () => {
      alive = false
    }
  }, [])
}
