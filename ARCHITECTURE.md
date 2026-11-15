# Architecture

Technical rationale for Git Ocean. The PRD (`PRD.md`) owns *what* the product does; this file owns *how* it's built and *why* each structural choice was made. Update it when a real architectural decision is made during the build — day-to-day judgment calls go in `docs/decisions.md` instead.

---

## Rendering strategy

**One `InstancedMesh` per creature "type" (body, netting overlay), not one mesh per repo.** The PRD targets 2,000+ creatures on screen. Individual meshes would mean thousands of draw calls and would blow the <2s TTFR budget (PRD G5) before any data even loads. Per-instance attributes (size, colour, glow phase, netted flag) are written into instanced buffer attributes once per data refresh, not recomputed per frame.

**Motion lives in the vertex shader, not in JS per-frame loops.** Cursor-flee behaviour, drift, and glow-pulse are GPU-side: a uniform `cursorPosition` and `uTime` drive displacement in the vertex shader. This keeps CPU frame time flat regardless of creature count — the alternative (updating thousands of object transforms in a `useFrame` loop) scales linearly with creature count and would cap how many fish the scene can hold.

**Species colour is a per-instance attribute, not per-material.** One shared material per mesh type; colour comes from an `InstanceColor`-style buffer keyed off `primaryLanguage`. Avoids a material (and draw call) per language.

**Netting is a second, smaller instanced mesh layered over only the netted subset**, not a shader branch inside the main creature shader. Keeps the common-path shader simple and avoids paying the netting cost for the ~majority of creatures that aren't netted.

**LOD is deferred to Phase 7 (polish), not built speculatively in Phase 1–2.** Instancing already solves the draw-call problem; don't add LOD complexity until profiling in Phase 7 shows it's actually needed to hit the perf budget.

---

## Data layer

**Browser never talks to GitHub directly.** `frontend/api/github.ts` is a Vercel edge function that holds `GITHUB_TOKEN` and is the only thing that calls GraphQL v4. This is non-negotiable — a client-side token would be exfiltratable from day one.

**One batched GraphQL query per visible set, not one query per repo.** The query in PRD §9 fetches up to 100 repos per call. Batching is what keeps the app inside GitHub's 5,000 points/hour authenticated budget even with concurrent visitors, since the edge function's cache is shared across requests, not per-session.

**Edge-cache by query key, short TTL.** Repo stats (stars, pushedAt, issue counts) don't change fast enough to justify sub-minute freshness, and over-fetching is what burns the rate-limit budget. On a cache miss that then fails (rate-limited or network error), serve the last successful cached batch rather than erroring the whole ocean.

**Fabrication (`data/fabricate.ts`) is deterministic, keyed on the searched string** (e.g. a stable hash → pseudo stats), so searching the same nonexistent name twice produces the same creature. This is what makes PRD §7.2's "search never feels broken" promise actually hold up under a repeat visit, rather than giving a different fake result each time.

**`mapRepoToCreature.ts` is the single place PRD §5's metaphor table becomes code.** Every visual rule (size formula, glow from recency+frequency, colour per language, netting threshold) lives here and nowhere else, so the metaphor table stays the actual source of truth instead of drifting across components.

---

## State management

One Zustand store (`store/oceanStore.ts`). Rough shape:

```ts
interface OceanStore {
  creatures: Creature[]              // current visible set (fixture, live, or fabricated)
  camera: { mode: 'idle' | 'diving'; target: Vector3 | null }
  selection: { repo: string | null; netted: boolean }
  speciesDiscovered: Set<string>     // languages seen so far, for the silent collection panel
  depthMeters: number
}
```

A single store (not one per concern) was chosen because camera mode, selection, and HUD depth are all derived from, or drive, each other on every frame (e.g. selecting a creature changes camera mode *and* depth target simultaneously) — splitting them would mean cross-store synchronization for no real isolation benefit at this scale.

---

## Camera system

- **Idle drift:** slow downward lerp, factor `0.055` (PRD §6, Flow 1 step 1–2).
- **Dive (on search match):** faster ease, factor `0.11`, toward the matched/fabricated creature's position.
- **Depth HUD value:** `depth = max(0, (camera.y + WORLD_R) / 3.2)` (PRD §7.3) — a pure function of camera position, not independently tracked state, so it can never drift out of sync with what's rendered.

---

## Routing & permalinks

`/dive/:owner/:repo` is the growth loop (PRD §7.5) — treat it as a first-class route, not an afterthought query param. On load: resolve `owner/repo` through the same data layer as search (Phase 3), seed the store's selection and camera target directly (skip the idle-drift intro), and auto-play the dive easing. Root `/` is the undirected "Drift" experience (Flow 2).

---

## Deployment

Vercel for both the static frontend build and the `api/github.ts` edge function. Edge functions were chosen over a separate backend service so the API proxy, caching, and token custody live in the same deploy as the frontend — one deploy target, consistent with the PRD's non-goal of avoiding unnecessary backend infrastructure for a V1 with no accounts or writes.

---

## Open architecture questions (resolve during Phase 3, record the call in `docs/decisions.md`)

- Edge function cache: in-memory per-region vs. a shared store (e.g. Vercel KV) if cross-region cache misses turn out to matter in practice.
- Whether `fabricate.ts`'s pseudo-stats should be visually distinguishable from real creatures (PRD doesn't require this, but it affects whether "fake" dives feel like a letdown on reveal).

---

## Build notes (decisions made during the build)

- **CPU mirror of the swim path.** `ocean/motion.ts` repeats `shaders/swim.glsl`'s motion formula so picking (`ocean/input.ts`), the selection ring and the dive camera know where each fish *is* without reading back from the GPU. The two must change together.
- **Edge function in dev.** `vite.config.ts` mounts `api/github.ts` as Vite middleware, so `pnpm dev` runs the real handler (mock or live) without the Vercel CLI.
- **Depth HUD outside React.** The camera rig publishes depth every frame to `liveDepth` listeners; `DepthCompass` writes the number straight to the DOM and only re-renders on zone changes.
- **Open questions resolved:** edge cache is per-isolate memory + CDN `s-maxage` (decisions D-08); fabricated creatures are labelled in the UI (D-07).
