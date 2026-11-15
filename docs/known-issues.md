# Known issues

Tests or visual/behavioural checks that were skipped, stubbed, or couldn't be mechanically verified, with what *is* verified instead.

- **Cursor-flee feel (Phase 2).** The flee is in `shaders/swim.glsl`-based vertex shaders and renders without errors, but "small fish scatter, large ones ignore it" is a motion judgment that headless screenshots can't confirm. Needs a human to sweep the pointer across a shoal at ~300m.
- **Frame rate.** 60–62fps is measured with Playwright driving the installed Chrome on the build machine (Apple GPU). Not measured on a mid-range Windows laptop.
- **Live GitHub path unexercised.** No token was available, so the GraphQL query in `api/github.ts` has only run against mocks. Risks to check with a token: query cost/timeouts for `search(first: 100)` with nested `history`, and GitHub's search syntax for the population queries.
- **Per-repo link previews.** Shared `/dive/…` links unfurl with the generic "Git Ocean" title and description, because the SPA can't set meta tags for crawlers. A Vercel routing middleware that rewrites `<title>`/`og:*` per repo would fix it; not built (outside the Phase 6 acceptance check).
