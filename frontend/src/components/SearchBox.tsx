import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { resolveSearch } from '../data/resolve'
import { permalinkFor, startDive } from '../ocean/dive'
import { useOcean } from '../store/oceanStore'
import { SonarIcon } from './icons'

/** PRD §7.2: floating glass search, top-centre. Enter dives; it never dead-ends. */
export function SearchBox() {
  const [term, setTerm] = useState('')
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== input.current) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const q = term.trim()
    if (!q || busy) return
    setBusy(true)
    try {
      const creature = await resolveSearch(q, useOcean.getState().creatures)
      startDive(creature)
      navigate(permalinkFor(creature))
      input.current?.blur()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="search glass" role="search" onSubmit={submit} aria-busy={busy}>
      <SonarIcon className={busy ? 'search-icon is-pinging' : 'search-icon'} />
      <label htmlFor="repo-search" className="sr-only">
        Find a repo by name
      </label>
      <input
        id="repo-search"
        ref={input}
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Find a repo: react, tokio…"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
      />
      <button type="submit" className="search-go" disabled={!term.trim() || busy}>
        {busy ? 'Sounding…' : 'Dive'}
      </button>
    </form>
  )
}
