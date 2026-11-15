# Decisions

Judgment calls made when the PRD or `ARCHITECTURE.md` was underspecified or ambiguous, in build order. Each entry: what was decided, why, and what it would take to revisit.

(None yet — build hasn't started.)

## D-01 — Depth axis (Phase 1)
PRD §7.3 writes `depth = max(0, (camera.y + WORLD_R) / 3.2)`, which only increases downward if y points down. Three.js is y-up, so the code uses `depth = max(0, (WORLD_R - camera.y) / 3.2)` with the surface at `y = +WORLD_R` (`ocean/world.ts`). Same formula, flipped axis. `WORLD_R = 15000`, so the abyss bottoms out at ~9,375m, matching the PRD's 9,400m example for `react`.

## D-02 — Visual direction (Phase 1)
The PRD pins the look (gradient colours, god rays, plankton, vignette, glassmorphic HUD), so no separate visual-direction round was run. Unpinned choices: Instrument Sans (UI) and IBM Plex Mono (measurements only: depth, stars, counts), self-hosted via @fontsource. Reverse by swapping the two imports in `main.tsx` and the `--font-*` tokens in `index.css`.
