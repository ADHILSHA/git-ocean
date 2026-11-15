# Blockers

Blockers hit during autonomous build runs and how they were worked around.

## B-01 — No GITHUB_TOKEN (Phase 3)
No `.env` exists, so the edge function runs the mock provider (fixture data, `source: "mock"`). Everything goes through the same `api/github.ts` handler and response shapes; setting `GITHUB_TOKEN` in `git-ocean/.env` (dev) or the Vercel project (prod) switches to live GitHub with no code change. The live GraphQL query has **not** been run against GitHub yet (see known-issues).

## B-02 — No Vercel account/CLI for deploy (Phase 7)
The `vercel` CLI isn't installed and no Vercel credentials exist here; deploying would also publish under the owner's account, so it needs them. Everything is ready: import the repo in Vercel with **Root Directory = `git-ocean/frontend`** (framework Vite, build `pnpm build`, output `dist`, both also set in `vercel.json`), add `GITHUB_TOKEN` as an environment variable, deploy. `api/github.ts` deploys as an edge function automatically.
