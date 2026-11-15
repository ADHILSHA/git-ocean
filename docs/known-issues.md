# Known issues

Tests or visual/behavioural checks that were skipped, stubbed, or couldn't be mechanically verified, with what *is* verified instead.

- **Cursor-flee feel (Phase 2).** The flee is in `shaders/swim.glsl`-based vertex shaders and renders without errors, but "small fish scatter, large ones ignore it" is a motion judgment that headless screenshots can't confirm. Needs a human to sweep the pointer across a shoal at ~300m.
- **Frame rate.** 60–62fps is measured with Playwright driving the installed Chrome on the build machine (Apple GPU). Not measured on a mid-range Windows laptop.
- **Live GitHub path unexercised.** No token was available, so the GraphQL query in `api/github.ts` has only run against mocks. Risks to check with a token: query cost/timeouts for `search(first: 100)` with nested `history`, and GitHub's search syntax for the population queries.
- **Per-repo link previews.** Shared `/dive/…` links unfurl with the generic "Git Ocean" title and description, because the SPA can't set meta tags for crawlers. A Vercel routing middleware that rewrites `<title>`/`og:*` per repo would fix it; not built (outside the Phase 6 acceptance check).
- **Not deployed.** See blockers B-02. TTFR was measured on `vite preview` with a 4× CPU throttle; on Vercel, add the edge function's response time (cached batches should be ~100–300ms) before creatures appear.
- **`pnpm preview` has no `/api`.** The edge function runs in `pnpm dev` (Vite middleware) and on Vercel only; `preview` falls back to the sample ocean.
- **Visual checks were automated, not human.** All flows were driven in Google Chrome (headless, real GPU) via Playwright scripts in `frontend/e2e/`, with screenshots reviewed. A human pass on a real mid-range laptop and a real phone is still needed for motion feel, flee, and touch drag.
- **Fish facing the camera.** At the ends of their swim loop, fish briefly turn head-on to the camera and read as ovals. Expected from the loop path; tune the loop's z-amplitude in `swim.glsl` / `motion.ts` if it bothers.
