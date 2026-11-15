import { useOcean } from '../store/oceanStore'

/** Honest footnote when the ocean isn't live GitHub data. Silent when it is. */
export function DataNote() {
  const source = useOcean((s) => s.dataSource)
  if (source === 'mock') return <p className="data-note">Sample ocean: illustrative repos, not live GitHub data.</p>
  if (source === 'stale-cache') return <p className="data-note">GitHub is out of reach; showing the last charted ocean.</p>
  return null
}
