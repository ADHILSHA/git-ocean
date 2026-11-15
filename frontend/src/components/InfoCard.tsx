import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { permalinkFor, startDive } from '../ocean/dive'
import { speciesFor } from '../data/species'
import { useOcean } from '../store/oceanStore'
import type { Creature } from '../types/repo'
import { ArrowRight, CloseIcon, DiveIcon, LinkIcon, NetIcon } from './icons'

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const full = new Intl.NumberFormat('en-US')

/** Issues tab, oldest first: where a rescue starts (PRD Flow 3 step 4). */
export const oldestIssuesUrl = (repoUrl: string) => `${repoUrl}/issues?q=${encodeURIComponent('is:issue is:open sort:created-asc')}`

function Stat({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd title={title}>{value}</dd>
    </div>
  )
}

function CopyLink({ creature }: { creature: Creature }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    const url = `${location.origin}${permalinkFor(creature)}`
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: `${creature.repo.nameWithOwner} in Git Ocean`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* share sheet dismissed or clipboard blocked: the URL bar already holds the link */
    }
  }
  return (
    <button type="button" className="card-btn ghost" onClick={copy}>
      <LinkIcon />
      <span aria-live="polite">{copied ? 'Link copied' : 'Share this dive'}</span>
    </button>
  )
}

/** PRD §7.4: bottom-right glass card that slides up on selection. */
export function InfoCard() {
  const creature = useOcean((s) => s.creatures.find((c) => c.id === s.selectionId) ?? null)
  const camera = useOcean((s) => s.camera)
  const navigate = useNavigate()
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && useOcean.getState().select(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!creature) return null
  const { repo } = creature
  const [owner, name] = repo.nameWithOwner.split('/')
  const species = speciesFor(repo.primaryLanguage)
  const here = camera.targetId === creature.id && camera.mode !== 'idle'

  function dive() {
    startDive(creature!)
    navigate(permalinkFor(creature!))
  }

  if (creature.fabricated) {
    const term = name
    return (
      <section className="card glass" aria-labelledby="card-title" key={creature.id}>
        <header className="card-head">
          <p className="crumb">Uncharted water</p>
          <h2 id="card-title" ref={heading} className="card-title" tabIndex={-1}>
            {term}
          </h2>
          <button type="button" className="card-close" onClick={() => useOcean.getState().select(null)} aria-label="Close card">
            <CloseIcon />
          </button>
        </header>
        <p className="card-body">No public repo matched “{term}”, so the ocean imagined this creature. Its size and colour are invented, not GitHub data.</p>
        <div className="card-actions">
          <a className="card-btn primary" href={repo.url} target="_blank" rel="noreferrer">
            Search GitHub for “{term}” <ArrowRight />
          </a>
        </div>
      </section>
    )
  }

  const stale = repo.staleUnansweredIssues
  const staleText = `${repo.staleUnansweredCapped ? `${stale}+` : stale} ${stale === 1 && !repo.staleUnansweredCapped ? 'issue' : 'issues'} unanswered for 2+ years`
  const githubHref = creature.netted ? oldestIssuesUrl(repo.url) : repo.url

  return (
    <section className={`card glass${creature.netted ? ' is-netted' : ''}`} aria-labelledby="card-title" key={creature.id}>
      <header className="card-head">
        <p className="crumb">
          <span>github.com</span>
          <span aria-hidden="true">/</span>
          <span>{owner}</span>
        </p>
        <h2 id="card-title" ref={heading} className="card-title" tabIndex={-1}>
          {name}
        </h2>
        <button type="button" className="card-close" onClick={() => useOcean.getState().select(null)} aria-label="Close card">
          <CloseIcon />
        </button>
      </header>

      {creature.netted && (
        <div className="net-banner" role="note">
          <NetIcon className="net-icon" />
          <div>
            <p className="net-title">Caught in a net</p>
            <p className="net-text">
              {staleText}.{' '}
              {repo.oldestStaleIssueUrl && (
                <a href={repo.oldestStaleIssueUrl} target="_blank" rel="noreferrer">
                  Oldest unanswered issue
                </a>
              )}
            </p>
          </div>
        </div>
      )}

      {repo.description && <p className="card-body">{repo.description}</p>}

      <dl className="stats">
        <div className="stat">
          <dt>Species</dt>
          <dd>
            <span className="chip" style={{ ['--chip' as string]: species.hex }}>
              {repo.primaryLanguage ?? 'Unknown'}
            </span>
          </dd>
        </div>
        <Stat label="Stars" value={compact.format(repo.stargazerCount)} title={full.format(repo.stargazerCount)} />
        <Stat label="Open issues" value={compact.format(repo.openIssues)} title={full.format(repo.openIssues)} />
        <Stat label="Pulse" value={`${creature.pulse}%`} title="Recent pushes and commits in the last 30 days" />
      </dl>

      <div className="card-actions">
        <a className="card-btn primary" href={githubHref} target="_blank" rel="noreferrer">
          {creature.netted ? 'Go to GitHub, oldest issues first' : 'Go to GitHub'} <ArrowRight />
        </a>
        {here ? (
          <CopyLink creature={creature} />
        ) : (
          <button type="button" className="card-btn ghost" onClick={dive}>
            <DiveIcon /> Dive to it
          </button>
        )}
      </div>
    </section>
  )
}
