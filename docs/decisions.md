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

## D-07 — Fabricated creatures are labelled, not passed off as real (Phase 3)
Answers ARCHITECTURE.md's open question. A fabricated creature gets deterministic pseudo-stats only so it has a size, colour and depth; the Info Card says it's uncharted and shows no numbers, and its link goes to a GitHub search for the term. Showing invented star counts as fact would break the "data is the art" principle (PRODUCT.md).

## D-08 — Edge cache: per-isolate memory + CDN, no KV (Phase 3)
Answers ARCHITECTURE.md's other open question. In-memory per isolate plus Vercel's CDN cache via `s-maxage` / `stale-while-revalidate`. Revisit with Vercel KV only if cross-region misses show up in rate-limit usage.

## D-09 — Netting query (Phase 3)
PRD §9's sample query doesn't compile (`$names` vs `$q`) and its `staleIssues` filter (`since`) counts recently *updated* issues, not stale ones. Instead each repo fetches its 20 oldest open issues with comment counts, and netting counts those older than 2 years with zero comments. The count is a lower bound when all 20 qualify (`staleUnansweredCapped`, shown as "20+"). Commit frequency comes from default-branch `history(since: 30 days ago)`.

## D-10 — Ocean population (Phase 3)
Five search queries (legends > 40k stars; 4k–40k pushed in 30d; 400–4k pushed in 14d; 40–400 pushed in 7d; new repos < 60d), up to 500 creatures. Skews toward active repos so the shallows aren't empty; change in `batchQueries()`.

## D-11 — Arrival framing is sub-linear in size (Phase 4)
PRD only requires the *whale* to fill 40%+. Framing every creature at the same fill would make a 20-star repo look as big as react on arrival and erase the size encoding. Fill = `0.55 × (size / maxSize)^0.4` of viewport width (0.8 base on portrait): react ≈ 54%, a ~50-star fish ≈ 29%. Change `framingFill()` in `ocean/camera.ts`.

## D-12 — Dive lerp ramp (Phase 4)
A plain 0.11 lerp moves fastest on frame one, so the depth counter would *decelerate*, but PRD Flow 1 shows it accelerating (340 → 1,200 → 4,800 → 9,400). The factor ramps from 0.004 to 0.11 over 1.1s (ease-in), then the lerp eases out. The 0.11 target is unchanged.

## D-13 — Depth zone label (Phase 4)
The Depth Compass shows the real oceanographic zone (sunlight / twilight / midnight / abyssal / hadal) under the metres. It's a reading of the PRD's depth row, not a new encoding. Remove `compass-zone` in `DepthCompass.tsx` if it's judged out of scope.

## D-14 — Navigation input (Phase 4)
Wheel, touch-drag and arrow/PageUp/PageDown keys move the idle depth target. The PRD doesn't specify free navigation, but Flow 2's "dives deeper" and full mobile parity (PRODUCT.md) need it, and it's camera Y only.
