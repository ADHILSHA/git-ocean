import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { resolvePermalink } from '../data/resolve'
import { placeCamera } from '../ocean/CameraRig'
import { startDive } from '../ocean/dive'
import { depthToY, LANDING_DEPTH_M } from '../ocean/world'
import { useOcean } from '../store/oceanStore'

/** How long a cold permalink visit lingers in the shallows before the plunge. */
const BEAT_MS = 900

/**
 * PRD §7.5: `/dive/:owner/:repo` resolves through the same data layer as search,
 * starts the camera in the shallows above the ocean, and auto-plays the same dive.
 */
export function PermalinkDive() {
  const { owner = '', repo = '' } = useParams()

  useEffect(() => {
    const id = `${owner}/${repo}`.toLowerCase()
    const { camera } = useOcean.getState()
    // Search and "Dive to it" navigate here after starting the dive themselves.
    if (camera.targetId === id) return

    let cancelled = false
    const started = performance.now()
    placeCamera(depthToY(LANDING_DEPTH_M))
    resolvePermalink(owner, repo, useOcean.getState().creatures).then((creature) => {
      if (cancelled) return
      const wait = Math.max(0, BEAT_MS - (performance.now() - started))
      setTimeout(() => !cancelled && startDive(creature), wait)
    })
    return () => {
      cancelled = true
    }
  }, [owner, repo])

  useEffect(() => {
    document.title = `${owner}/${repo} · Git Ocean`
    return () => {
      document.title = 'Git Ocean'
    }
  }, [owner, repo])

  return null
}
