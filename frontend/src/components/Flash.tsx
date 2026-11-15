import { useOcean } from '../store/oceanStore'

/** The "Flash." beat that starts every dive (PRD Flow 1 step 5). Skipped under reduced motion. */
export function Flash() {
  const key = useOcean((s) => s.flashKey)
  const reduced = useOcean((s) => s.reducedMotion)
  if (!key || reduced) return null
  return <div key={key} className="flash" aria-hidden="true" />
}
