import { useEffect, useState } from 'react'
import { OTHER_SPECIES, SPECIES, speciesFor } from '../data/species'
import { liveDepth, useOcean } from '../store/oceanStore'
import type { Creature } from '../types/repo'

const ALL = [...SPECIES, OTHER_SPECIES]
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

function nearby(creatures: Creature[], depth: number, n = 20) {
  return creatures
    .filter((c) => !c.fabricated)
    .map((c) => ({ c, d: Math.abs(c.depthM - depth) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.c)
    .sort((a, b) => a.depthM - b.depthM)
}

function describe(c: Creature) {
  const parts = [c.repo.primaryLanguage ?? 'unknown language', `${compact.format(c.repo.stargazerCount)} stars`, `pulse ${c.pulse}%`, `${Math.round(c.depthM).toLocaleString('en-US')} m deep`]
  if (c.netted) parts.push('caught in a net')
  return parts.join(', ')
}

/**
 * PRD §8 species collection (silent: no toasts, no progress bar) plus the
 * accessible creature list: everything in the canvas, reachable by keyboard
 * and screen reader, with the same select → Info Card path as a click.
 */
export function Logbook() {
  const [open, setOpen] = useState(false)
  const discovered = useOcean((s) => s.speciesDiscovered)
  const last = useOcean((s) => s.lastSpecies)
  const creatures = useOcean((s) => s.creatures)
  const selectionId = useOcean((s) => s.selectionId)
  const [list, setList] = useState<Creature[]>([])

  useEffect(() => {
    if (!open) return
    const refresh = () => setList(nearby(useOcean.getState().creatures, liveDepth.metres))
    refresh()
    const t = setInterval(refresh, 1500)
    return () => clearInterval(t)
  }, [open, creatures])

  function choose(c: Creature) {
    const s = useOcean.getState()
    if (s.camera.mode === 'arrived' && s.camera.targetId !== c.id) s.endDive()
    s.select(c.id)
    requestAnimationFrame(() => document.getElementById('card-title')?.focus())
  }

  const seen = new Set(discovered)
  return (
    <div className={open ? 'logbook is-open' : 'logbook'}>
      <button type="button" className="logbook-toggle glass" aria-expanded={open} aria-controls="logbook-panel" onClick={() => setOpen((o) => !o)}>
        <span className="logbook-dots" aria-hidden="true">
          {ALL.map((sp) => (
            <span key={sp.language} className={seen.has(sp.language) ? 'dot is-seen' : 'dot'} style={{ ['--c' as string]: sp.hex }} />
          ))}
        </span>
        <span>Logbook</span>
        <span className="sr-only">
          , {discovered.length} of {ALL.length} species seen, and a list of nearby creatures
        </span>
      </button>

      {open && (
        <section id="logbook-panel" className="logbook-panel glass" aria-label="Logbook">
          <h2 className="logbook-h">Species seen</h2>
          {discovered.length === 0 ? (
            <p className="logbook-empty">Click a creature to log its species.</p>
          ) : (
            <ul className="species">
              {ALL.filter((sp) => seen.has(sp.language)).map((sp) => (
                <li key={sp.language} className={`is-seen${last === sp.language ? ' is-new' : ''}`} style={{ ['--c' as string]: sp.hex }}>
                  <span className="species-dot" aria-hidden="true" />
                  <span>{sp.label}</span>
                </li>
              ))}
            </ul>
          )}
          {discovered.length < ALL.length && (
            <p className="logbook-empty">
              {ALL.length - discovered.length} species still out there.
            </p>
          )}

          <h2 className="logbook-h">Nearby</h2>
          <ul className="nearby">
            {list.map((c) => (
              <li key={c.id}>
                <button type="button" className={c.id === selectionId ? 'is-current' : ''} aria-current={c.id === selectionId} onClick={() => choose(c)} aria-label={`${c.repo.nameWithOwner}: ${describe(c)}`}>
                  <span className="species-dot" style={{ ['--c' as string]: speciesFor(c.repo.primaryLanguage).hex }} aria-hidden="true" />
                  <span className="nearby-name">{c.repo.nameWithOwner}</span>
                  <span className="nearby-meta" aria-hidden="true">
                    {compact.format(c.repo.stargazerCount)}
                    {c.netted ? ' · net' : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
