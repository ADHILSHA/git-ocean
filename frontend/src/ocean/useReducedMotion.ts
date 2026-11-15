import { useEffect } from 'react'
import { useOcean } from '../store/oceanStore'

/** prefers-reduced-motion: the ocean holds still, dives cut instead of plunging, all flows still work. */
export function useReducedMotion() {
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => useOcean.getState().setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
}
