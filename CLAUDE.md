# CLAUDE.md — Git Ocean

## What we're building

GitHub's ecosystem, rendered as a living ocean. Repos are creatures — size from stars, glow/speed from recent activity, species/colour from language, netting over creatures with stale unanswered issues. Users dive, drift, and discover. The full product spec, metaphor table, user flows, and feature spec live in **`PRD.md`** — read it before starting any phase. This file is the *how to build it* companion to that *what to build* doc.

**One-line pitch:** *"GitHub is an ocean. Dive in."*

The growth loop (`/dive/:owner/:repo` permalinks) is the point of the project. When trading off scope under time pressure, protect: the ocean canvas rendering correctly, the dive flow, and permalinks — in that order. Gamification layers (species log, rescue flow, live pulse) are real but secondary.

See `ARCHITECTURE.md` for technical rationale and system design (rendering strategy, data layer, state shape, camera system).

---

## Tech stack

- **Framework:** Vite + React 18 + TypeScript
- **Rendering:** Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Post-processing:** `@react-three/postprocessing` (bloom, god rays, vignette)
- **State:** Zustand (camera, selection, HUD, species-discovered log)
- **Routing:** React Router (`/`, `/dive/:owner/:repo`)
- **Data:** GitHub GraphQL API v4, proxied through a Vercel edge function
- **Deploy:** Vercel (edge function for API proxy + caching)
- **Package management:** `pnpm`
- **Testing:** Vitest (logic/state), Playwright or manual (visual/3D — see `docs/TESTING.md`)

---

## Repository layout

```
git-ocean/
├── CLAUDE.md
├── ARCHITECTURE.md
├── PRD.md
├── .env.example
├── docs/
│   ├── progress.md       # build status, updated continuously
│   ├── decisions.md       # judgment calls made when blocked or underspecified
│   ├── known-issues.md    # skipped/stubbed tests or features, with a reason
│   ├── blockers.md        # blockers hit during autonomous runs + how they were resolved
│   └── TESTING.md         # how to run everything + manual test script (written at finish line)
└── frontend/
    ├── vite.config.ts
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx                  # router root
    │   ├── ocean/
    │   │   ├── OceanCanvas.tsx      # R3F <Canvas>, lighting, postprocessing
    │   │   ├── CreatureField.tsx    # InstancedMesh fish population
    │   │   ├── shaders/             # cursor-flee vertex shader, netting overlay
    │   │   └── camera.ts            # idle drift vs. dive lerp logic
    │   ├── components/
    │   │   ├── SearchBox.tsx
    │   │   ├── DepthCompass.tsx
    │   │   └── InfoCard.tsx
    │   ├── data/
    │   │   ├── github.ts            # typed client for the edge function
    │   │   ├── mapRepoToCreature.ts # stars/pushedAt/language -> visual attributes
    │   │   └── fabricate.ts         # deterministic fallback creature for no-match search
    │   ├── store/
    │   │   └── oceanStore.ts        # Zustand store
    │   └── types/
    │       └── repo.ts
    └── api/
        └── github.ts                 # Vercel edge function: GraphQL proxy + cache
```

---

## Build phases (do these in order. Don't start a phase until the previous one passes its acceptance check)

**Phase 1: Ocean Canvas.**
Vite + React + R3F scaffold. Full-viewport canvas, depth gradient (`#0d4a68` → `#00060f`), 5–7 animated god ray shafts, 200–300 drifting plankton particles, vignette (PRD §7.1).
✅ Acceptance: canvas renders at 60fps idle on a mid-range laptop, matches the described look, no creatures yet.

**Phase 2: Creature field (mock data).**
`InstancedMesh` fish population driven by static fixture data (not live GitHub data yet). Size from `stargazerCount` (log-scale formula, PRD §5), glow/speed from activity, species colour from `primaryLanguage`, cursor-flee vertex shader, netting as a secondary instanced mesh over netted creatures only.
✅ Acceptance: 200+ creatures render in one draw call per mesh type, sizes/colours/netting visibly differ per fixture entry, small fish scatter from the cursor, large ones ignore it.

**Phase 3: GitHub data layer.**
Vercel edge function proxying the GraphQL v4 batch query from PRD §9, with caching per the Caching & Rate Limits note. `mapRepoToCreature.ts` replaces the fixture data from Phase 2. `fabricate.ts` deterministic fallback for unmatched searches.
✅ Acceptance: real repo data populates the ocean; a search for a nonexistent repo fabricates a creature instead of erroring; a simulated rate-limit/network failure falls back to last cached batch.

**Phase 4: Search & Dive, Depth Compass.**
Floating glassmorphic search box (PRD §7.2), cinematic camera ease on match (0.11 lerp vs. 0.055 idle), Depth Compass HUD (PRD §7.3).
✅ Acceptance: Flow 1 ("The Dive") works end to end — type a known repo, flash, camera plunges, depth counter accelerates, matching creature fills 40%+ of viewport on arrival.

**Phase 5: Info Card & Rescue flow.**
Info card (PRD §7.4) sliding in on selection, netting warning banner, "Go to GitHub →" link sorted by oldest issue for netted repos.
✅ Acceptance: Flow 2 ("The Drift") and Flow 3 ("The Rescue") both work end to end.

**Phase 6: Shareable permalinks.**
`/dive/:owner/:repo` route. On load: fetch the repo, place the camera above it, auto-play the dive.
✅ Acceptance: a shared permalink reproduces the same dive a fresh visitor would get from searching that repo manually (Flow 1, step 7).

**Phase 7: Species log, polish, perf, deploy.**
Silent species-discovery side panel (PRD §8), `prefers-reduced-motion` fallback, perf pass to hit G5 (<2s time-to-first-render), Vercel deploy.
✅ Acceptance: fresh visit hits TTFR < 2s on a mid-tier laptop; reduced-motion users get a non-animated fallback that still supports all 3 flows.

**Out of scope for this build (PRD §7.6, §5 "V2" rows) — do not build unless explicitly asked:**
Live Pulse (polling for live commits, ripple/flash-on-push), sunken wreck silhouettes for archived repos.

---

## Conventions

- Type everything. `types/repo.ts` is the single shape all layers (data, store, components) agree on.
- All GitHub API calls go through `api/github.ts` (the edge function) — never call the GitHub GraphQL endpoint directly from the browser; the token must never reach the client.
- Visual rules are governed entirely by the PRD §5 metaphor table. If a feature doesn't map to a row in that table, it doesn't ship in this build — raise it as a PRD question instead of improvising.
- Keep shaders in `ocean/shaders/*.glsl`, not inlined as JS strings.
- One Zustand store (`store/oceanStore.ts`) for camera/selection/HUD/species-log state — don't introduce a second state manager.
- Full detail only where the PRD calls for it; batch/instance everything else. Target 60fps, not just "renders."

---

## Environment variables (`.env.example`)
```
GITHUB_TOKEN=
```

---

## Autonomous workflow: follow this without being asked

For each phase, in order (1 → 2 → 3 → 4 → 5 → 6 → 7):

1. **Implement** exactly what the phase description above (and the relevant PRD section) says.
2. **Verify.** Run the app, confirm the phase's acceptance check. Run `pnpm lint` / `pnpm build` / Vitest where applicable; fix failures.
3. **Commit** with a message like `phase-<n>: <summary>`.
4. **Update `docs/progress.md`** (what works, what's stubbed, open questions) before moving on.
5. **Continue** straight to the next phase.

### Fully autonomous mode: never stop, never ask

You may be running headless with no human watching. Handle every blocker yourself:

- **Missing `GITHUB_TOKEN`:** build against fixture data behind the same `data/` interface Phase 3 defines (`GITHUB_PROVIDER=mock`). Real data must work as soon as a token is added, with no code change. Log it in `docs/blockers.md`.
- **A design question the PRD's metaphor table (§5) doesn't answer:** choose the option that's cheapest to reverse, record the call in `docs/decisions.md`, and continue.
- **Tests or a visual check you can't verify in your sandbox (no GPU/browser):** mark it clearly in `docs/known-issues.md` with what *is* mechanically verified vs. what still needs a human to confirm in a real browser. Never delete a check to make a run look green.
- **Never** call the real GitHub API in tests — mock it.

### Context and resumption
You may be restarted many times.
- At the start of every run, read `docs/progress.md` and continue from the first unfinished step.
- Update `docs/progress.md` after every phase, not just at the end, so a restart loses nothing.
- Commit often, scoped to `git-ocean/...` paths (this directory may sit inside a larger personal git repo with many unrelated projects — never `git add -A`).

### Finish line
When all 7 phases are done:
1. Write `docs/TESTING.md`: the exact command to run everything (`pnpm dev` preferred), how to switch from mock to real GitHub data, a manual test script covering Flows 1–3, and current known issues.
2. Confirm `pnpm dev` brings the app up and all three flows work in a real browser.
3. Create an empty `docs/BUILD_COMPLETE` file.

General: if something here conflicts with a better technical choice you discover mid-build, record the change and reasoning in `docs/decisions.md` and proceed — don't silently diverge.
