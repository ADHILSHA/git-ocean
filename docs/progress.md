# Progress

## Status: Phase 1 done

Build in progress. Phases are defined in `CLAUDE.md` under "Build phases." Update this file after every phase (not just at the end) — on resume, read this file first and continue from the first unfinished step.

## Phase 1 — Ocean Canvas ✅
- Vite + React 18 + TS + R3F scaffold in `frontend/` (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`).
- Full-viewport canvas: depth gradient `#0d4a68` → `#00060f` driven by camera depth (`ocean/Water.tsx`), 6 animated god-ray shafts that fade out by ~3,200m, 260 plankton motes drifting upward in a camera-following box, bloom + vignette.
- Idle camera drift downward from 300m (`ocean/CameraRig.tsx`, lerp 0.055).
- Verified: headless Chrome (Playwright, `e2e/shot.mjs`) renders it at 61fps on this Mac, no console errors. Camera maths unit-tested (`ocean/camera.test.ts`).

## Phase 2 — Creature field (mock data)
Not started.

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
