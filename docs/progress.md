# Progress

## Status: Phase 2 done

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

## Phase 3 — GitHub data layer
Not started.

## Phase 4 — Search & Dive, Depth Compass
Not started.

## Phase 5 — Info Card & Rescue flow
Not started.

## Phase 6 — Shareable permalinks
Not started.

## Phase 7 — Species log, polish, perf, deploy
Not started.
