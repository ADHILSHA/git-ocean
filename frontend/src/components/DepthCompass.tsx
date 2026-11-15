import { useEffect, useRef, useState } from 'react'
import { liveDepth } from '../store/oceanStore'

const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** Ocean zones by depth: names for the PRD's depth row, nothing more. */
export function zoneFor(m: number) {
  if (m < 200) return 'Sunlight zone'
  if (m < 1000) return 'Twilight zone'
  if (m < 4000) return 'Midnight zone'
  if (m < 6000) return 'Abyssal zone'
  return 'Hadal zone'
}

/** PRD §7.3: left-centre, big tabular depth in metres, thin line with a glowing dot at the top. */
export function DepthCompass() {
  const num = useRef<HTMLSpanElement>(null)
  const [zone, setZone] = useState(() => zoneFor(liveDepth.metres))
  const [spoken, setSpoken] = useState(0)

  useEffect(() => {
    const fn = (m: number) => {
      // Written straight to the DOM every frame; React only hears about zone changes.
      if (num.current) num.current.textContent = fmt.format(m)
      setZone(zoneFor(m))
      setSpoken((prev) => (Math.abs(prev - m) >= 250 ? Math.round(m / 50) * 50 : prev))
    }
    liveDepth.listeners.add(fn)
    return () => {
      liveDepth.listeners.delete(fn)
    }
  }, [])

  return (
    <aside className="compass" aria-label={`Depth about ${fmt.format(spoken)} metres, ${zone}`}>
      <div className="compass-line" aria-hidden="true">
        <span className="compass-dot" />
      </div>
      <div className="compass-read" aria-hidden="true">
        <span className="compass-num" ref={num}>
          {fmt.format(liveDepth.metres)}
        </span>
        <span className="compass-unit">m</span>
        <span className="compass-zone">{zone}</span>
      </div>
    </aside>
  )
}
