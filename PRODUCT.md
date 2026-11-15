# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Set by the project brief (CLAUDE.md / ARCHITECTURE.md), not by this record: Vite + React 18 + TypeScript, Three.js via React Three Fiber (`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`), Zustand, React Router, GitHub GraphQL v4 behind a Vercel edge function, pnpm, Vitest. No application code exists yet (as of 2026-11-15).

## Users

- **Primary: the curious developer.** Bored by GitHub Trending, opens the site on a break, dives around, and shares a find. Often arrives on a phone from a shared `/dive/:owner/:repo` link posted to X or Slack.
- **Secondary: the recruiter or learner.** Wants a visual sense of what is big and what is active in open source without reading changelogs.
- **Tertiary: the contributor.** Looks for neglected projects to help, through the Rescue flow (creatures in netting = stale, unanswered issues).

## Product Purpose

Git Ocean renders GitHub's ecosystem as a living, navigable ocean so that scale, liveliness and neglect can be felt at a glance, before a single number is read. A 200K-star project and a 200-star project stop looking like identical rows.

Success (PRD §3): 60% of visitors click a creature within 10 seconds; time-to-first-render under 2s on a mid-tier laptop; growth through shared dive permalinks (10K visitors in the first week, 20%+ 7-day return, 2K+ stars on the repo in 30 days).

## Positioning

A strict data-to-metaphor encoding, not decoration: every visual property is driven by one row of the PRD §5 metaphor table (size from stars on a log scale, glow and swim speed from recent activity, species colour from primary language, depth inverse to fame, netting only for issues open more than two years with zero comments). If something doesn't map to a row, it doesn't ship. Every dive is a shareable permalink, and the permalink is the growth loop.

## Operating Context

- Three core flows (PRD §6): **The Dive** (search, flash, camera plunges, the creature fills 40%+ of the viewport, share the permalink), **The Drift** (idle exploration, click a glowing fish), **The Rescue** (click a netted creature, go to its oldest unanswered issues on GitHub).
- Casual, short sessions; there is no account, no sign-in and no persistent profile.
- Shared links are opened cold on phones and desktops alike.

## Capabilities and Constraints

- Read-only view of GitHub. No accounts, social features, write actions, native app or websockets in V1.
- All GitHub calls go through the edge function; the token never reaches the client. Responses are edge-cached for minutes; if the batch fetch fails, the last cached batch is served. A search with no match fabricates a deterministic creature deep in the world, so search never looks broken.
- **Mobile: full parity.** All three flows must work by touch on phones, and permalink dives must be tuned for mobile, since that is where shares land. Cursor-flee needs a touch equivalent.
- Performance: 60fps target; creatures are instanced (one draw call per mesh type).
- Terminology: creature, species (= language), netting / netted, dive, drift, rescue, depth, pulse %, Depth Compass, Info Card, species log.
- Out of scope for this build: Live Pulse (live commit ripples) and sunken wrecks for archived repos (V2).
- Gamification is limited to the PRD §8 layers (silent species log, depth descent, rescue, shareable dive). Streaks, points, levels, badges and daily check-ins are explicitly ruled out.

## Brand Commitments

- **Name: "Git Ocean"** (confirmed 2026-11-15; formerly "GitHub Ocean"). Repo directory: `git-ocean`.
- Pitch line from the PRD: *"GitHub is an ocean. Dive in."*
- Voice (from the PRD, not separately confirmed): calm, ambient, wonder-first discovery, never pressure or hype.
- No logo or other brand assets exist yet.

## Evidence on Hand

- `PRD.md`, `ARCHITECTURE.md`, `CLAUDE.md`: spec, metaphor table, flows, build phases.
- Real data comes from the GitHub API at runtime. There are no testimonials, users, press or metrics yet; future work must not invent any.

## Product Principles

1. **The data is the art.** Every visual signal encodes a real repo property via the metaphor table; nothing is ornamental noise that could be misread as data.
2. **Feel first, numbers second.** Scale and health should read before any text is read; the Info Card confirms what the ocean already showed.
3. **The dive is the share.** Protect, in order: the canvas rendering correctly, the dive flow, permalinks. Everything else is secondary.
4. **Wonder, not pressure.** Rewards are ambient (discovery, depth, rescue), never meta-systems.
5. **Never broken.** Search always lands somewhere; failures fall back gracefully.

## Accessibility & Inclusion

- `prefers-reduced-motion`: a non-animated fallback that still supports all three flows.
- WCAG 2.2 AA for the HTML layer: search box, Info Card, Depth Compass, species log, including contrast over the dark ocean.
- Creatures must be reachable without sight or a pointer: a keyboard- and screen-reader-accessible list fallback exposing the same repo data and actions (select, open the Info Card, go to GitHub).
- Touch is a first-class input (see Mobile above).
