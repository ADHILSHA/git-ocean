# Decisions

Judgment calls made when the PRD or `ARCHITECTURE.md` was underspecified or ambiguous, in build order. Each entry: what was decided, why, and what it would take to revisit.

(None yet — build hasn't started.)

## D-01 — Depth axis (Phase 1)
PRD §7.3 writes `depth = max(0, (camera.y + WORLD_R) / 3.2)`, which only increases downward if y points down. Three.js is y-up, so the code uses `depth = max(0, (WORLD_R - camera.y) / 3.2)` with the surface at `y = +WORLD_R` (`ocean/world.ts`). Same formula, flipped axis. `WORLD_R = 15000`, so the abyss bottoms out at ~9,375m, matching the PRD's 9,400m example for `react`.

## D-02 — Visual direction (Phase 1)
The PRD pins the look (gradient colours, god rays, plankton, vignette, glassmorphic HUD), so no separate visual-direction round was run. Unpinned choices: Instrument Sans (UI) and IBM Plex Mono (measurements only: depth, stars, counts), self-hosted via @fontsource. Reverse by swapping the two imports in `main.tsx` and the `--font-*` tokens in `index.css`.

## D-03 — Species colours outside / at the edge of the table (Phase 2)
Languages not in PRD §5 (Kotlin, Shell, Swift, none…) share one muted sea-green "Other species" colour rather than inventing new species. "Navy" (C++) and "grey" (C) are lifted in luminance (`#5268c9`, `#9aa6b2`) so they remain visible against `#00060f`. Change in `data/species.ts`.

## D-04 — Depth and placement mapping (Phase 2)
PRD says depth is the inverse of fame but gives no formula. Depth = `150 + fame^2.2 × 9250` m, with fame = `log10(stars+1)/5.4` (same axis as size) and ±4% deterministic jitter. The exponent packs small repos into the shallows (where idle drift happens) and puts 200K-star legends near 9,300m. Horizontal placement is a stable hash of `owner/name`. Change in `data/mapRepoToCreature.ts`.

## D-05 — Activity score (Phase 2)
`activity = 0.55 × exp(-daysSincePush/45) + 0.45 × min(1, log10(commits30d+1)/2.3)`, archived = 0. Pulse % shown in the Info Card is `round(activity × 100)`. Same score drives glow and swim speed, per the PRD row "same as glow".

## D-06 — World scale (Phase 2)
PRD sizes are "px at zoom 1"; world length = px × 1.5 (`WORLD_UNITS_PER_PX`). Only affects how big fish read in idle drift; the dive frames each creature by its own size.
