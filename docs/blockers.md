# Blockers

Blockers hit during autonomous build runs and how they were worked around.

## B-01 — No GITHUB_TOKEN (Phase 3)
No `.env` exists, so the edge function runs the mock provider (fixture data, `source: "mock"`). Everything goes through the same `api/github.ts` handler and response shapes; setting `GITHUB_TOKEN` in `git-ocean/.env` (dev) or the Vercel project (prod) switches to live GitHub with no code change. The live GraphQL query has **not** been run against GitHub yet (see known-issues).
