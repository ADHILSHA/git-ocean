# Progress

## Status: Phase 5 done

Build in progress. Phases are defined in `CLAUDE.md` under "Build phases." Update this file after every phase (not just at the end) — on resume, read this file first and continue from the first unfinished step.

## Phase 1 — Ocean Canvas ✅
- Vite + React 18 + TS + R3F scaffold in `frontend/` (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`).
- Full-viewport canvas: depth gradient `#0d4a68` → `#00060f` driven by camera depth (`ocean/Water.tsx`), 6 animated god-ray shafts that fade out by ~3,200m, 260 plankton motes drifting upward in a camera-following box, bloom + vignette.
- Idle camera drift downward from 300m (`ocean/CameraRig.tsx`, lerp 0.055).
- Verified: headless Chrome (Playwright, `e2e/shot.mjs`) renders it at 61fps on this Mac, no console errors. Camera maths unit-tested (`ocean/camera.test.ts`).

## Phase 2 — Creature field (mock data) ✅
- 260 fixture repos (`data/fixtures.ts`, illustrative numbers) → `data/mapRepoToCreature.ts` (the only place PRD §5 rules live: log size, activity → glow + speed, species colour, netting = stale *unanswered* issues, depth = inverse fame).
- `ocean/CreatureField.tsx`: one instanced draw for all bodies, one for netting shells over netted creatures only. Motion, tail beat, glow pulse and cursor flee are GPU-side (`shaders/swim.glsl`, shared by both meshes); `ocean/motion.ts` mirrors the swim path on the CPU for picking and the dive camera.
- Flee is driven by pointer *movement* energy, so fish settle back when the pointer rests (lets you click small fish). Flee fades out between 30 and 70 world units of body length.
- Verified: screenshots at 300m and 8,000m show distinct sizes/colours/netting; 61fps in headless Chrome; 11 unit tests on the metaphor table. Flee *feel* needs a human check (see known-issues).

## Phase 3 — GitHub data layer ✅ (mock-verified; live path needs a token)
- `frontend/api/github.ts` edge function: `?` (batch, 5 population queries × 100), `?search=`, `?repo=owner/name`. Per-key memory cache (5 min fresh) + `Cache-Control: s-maxage=300, stale-while-revalidate=1800`; on rate-limit/network failure serves the last good copy (`source: stale-cache`), 503 only if nothing was ever cached.
- No `GITHUB_TOKEN` (or `GITHUB_PROVIDER=mock`) → same shapes from fixtures. Adding a token switches to live data with no code change.
- `pnpm dev` serves the edge function locally through a Vite middleware (`vite.config.ts`), reading `.env` from `git-ocean/` or `frontend/`.
- Client (`data/github.ts`) remembers the last batch in localStorage and falls back to it, then to fixtures. `data/resolve.ts`: local substring match → edge search → `fabricate.ts` (deterministic, flagged `fabricated`).
- Verified: 23 unit tests incl. cache hit, 403 rate-limit and network-failure fallback, 503 with empty cache, netting count, fabrication determinism, search ranking. GitHub is mocked in every test.

## Phase 4 — Search & Dive, Depth Compass ✅
- `components/SearchBox.tsx`: glass search top-centre, `/` focuses it, Enter dives. Resolves local → edge search → fabricate, then navigates to `/dive/owner/repo`.
- `ocean/CameraRig.tsx`: idle 0.055 lerp; dive lerp ramps up to 0.11 over 1.1s so the depth counter accelerates, then eases out; on arrival the camera follows the swimming creature. Wheel, touch-drag and arrow/PageUp/PageDown keys swim up and down.
- Framing: the largest creatures span ~55% of viewport width (80% on portrait); smaller ones fill less, sub-linearly, so scale survives the dive (D-11).
- `components/DepthCompass.tsx`: left-centre (bottom-left on phones), Plex Mono tabular depth written to the DOM per frame, zone name, thin line + glowing dot. `components/Flash.tsx`: the dive flash.
- Creature close-ups: glow concentrates into photophore spots when a fish is large on screen, so the bloom doesn't wash out the hero shot; fish geometry refined (forked tail, fins, eye).
- Verified (`e2e/flow1.mjs`, headless Chrome): search `react` → depth 343 → 412 → 3,234 → 6,170 → 9,002 → arrives ~9,070m in ~2s; whale spans >50% of a 1440×900 viewport and ~67% of a 390×844 one. No console errors.

## Phase 5 — Info Card & Rescue flow ✅
- `components/InfoCard.tsx`: bottom-right glass card (bottom sheet on phones) that slides up on selection: name, `github.com / owner` breadcrumb, species chip in the creature's colour, stars, open issues, pulse %. Escape or × closes it.
- Netted creatures: "Caught in a net" banner with "N issues unanswered for 2+ years" (N+ when capped), link to the oldest unanswered issue, and "Go to GitHub, oldest issues first →" opening `issues?q=is:issue is:open sort:created-asc`.
- Fabricated creatures get an "Uncharted water" card saying the creature is imagined, with no fake stats, linking to a GitHub search (D-07).
- "Dive to it" from any card; once you've dived to it, "Share this dive" copies the permalink (native share sheet on touch devices).
- Click/tap picking against the CPU swim path; `ocean/SelectionRing.tsx` rings the selected creature on screen.
- Verified (`e2e/flow23.mjs`) at 1440×900 (mouse) and 390×844 (touch): Flow 2 clicking an active fish opens its card with the repo link; Flow 3 clicking a netted fish shows the banner and the oldest-first issues URL; Escape closes. No console errors.

## Phase 6 — Shareable permalinks
Not started.

## Phase 7 — Species log, polish, perf, deploy
Not started.
