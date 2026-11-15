# PRD — Git Ocean

**Version:** 1.0
**Status:** Draft
**Owner:** Adhil Sha
**Last updated:** 2026-11-15

---

## 1. Vision

GitHub is functionally excellent but emotionally flat. This project turns the entire GitHub ecosystem into a **living, navigable ocean** — repos are creatures, stars determine size, recent activity determines glow and motion, and neglected issues appear as creatures trapped in fishing nets. Users dive, drift, and discover.

**One-line pitch:** *"GitHub is an ocean. Dive in."*

---

## 2. Problem Statement

Developers cannot *feel* the scale or health of the open-source ecosystem through GitHub's list-based UI. A 200K-star project and a 200-star project look structurally identical — a row with a number. Context is invisible:

- How does a tiny new repo compare to a decades-old giant?
- Which projects are *alive right now* vs. slowly dying?
- Which projects are drowning in stale, unanswered issues?

The ocean metaphor makes all three questions answerable **at a glance**, before reading a single number.

---

## 3. Goals & Non-Goals

### Goals
| # | Goal | Metric |
|---|---|---|
| G1 | Viral acquisition | 10K unique visitors within 7 days of launch post |
| G2 | Aha moment | 60% of visitors click a creature within 10 seconds |
| G3 | Retention | 20%+ return within 7 days |
| G4 | GitHub stars on this repo | 2K+ within 30 days |
| G5 | Performance | Time-to-first-render < 2s on mid-tier laptop |

### Non-Goals (V1)
- No user accounts or authentication
- No social features (follows, profiles, comments)
- No write/mutation actions to GitHub
- No native mobile app (responsive web only)
- No real-time websocket updates (polling is sufficient for V1)

---

## 4. Target Users

**Primary — The Curious Developer**
Wants to discover interesting projects but is bored by GitHub Trending. Opens the site during a break, dives around, shares a cool find.

**Secondary — The Recruiter / Learner**
Wants a visual sense of "what's big and what's hot" in open source without reading changelogs.

**Tertiary — The Contributor**
Wants to find neglected projects that need help. Uses the "Rescue" view to find repos with stale issues.

---

## 5. The Metaphor — Encoding Rules

This table is the **single source of truth** for every visual decision. If a feature doesn't map to this table, it doesn't ship in V1.

| Ocean element | Data source | Visual rule |
|---|---|---|
| **Creature size** | `stargazerCount` | Log scale: `size = 3 + (log10(stars+1)/5.4)^1.5 × 95` px at zoom 1 |
| **Glow / bioluminescence** | `pushedAt` recency + commit frequency (last 30d) | Recent activity = bright pulse; stale = dim, slow |
| **Swim speed** | Same as glow | Active repos dart; dormant repos drift |
| **Species / colour** | `primaryLanguage` | Python = blue, Rust = peach, Go = cyan, JS = yellow, TS = blue-2, C = grey, C++ = navy, Ruby = red, Java = bronze |
| **Netting** | Old *unanswered* issues (open > 2 years, zero comments) | Diagonal mesh overlay, clipped to body |
| **Depth (camera Y)** | Inverse of fame | Shallow = new/small repos; abyss = legends |
| **Sunken wrecks** | `isArchived = true` | Silhouette on seafloor, no motion (V2) |
| **Live ripple** | A commit landing while page is open | Surface ripple across top of screen (V2) |

**Explicitly rejected:** "Many open issues = caught in net." High issue count often means an *active* community, not distress. Netting = **stale, unanswered** issues only.

---

## 6. Core User Flows

### Flow 1 — The Dive (primary)
1. User lands on the page. Camera drifts slowly downward through shallow water.
2. Small fish swim past. Depth counter reads `~300m`.
3. User types a repo name into the search box (`react`).
4. Presses Enter.
5. **Flash.** Camera plunges. Depth counter accelerates (`340m → 1,200m → 4,800m → 9,400m`).
6. A colossal whale emerges from darkness. Info card slides in: name, language, stars, issues, pulse %.
7. User shares the permalink `/dive/facebook/react`.

**Aha moment:** step 6. The whale must fill 40%+ of the viewport.

### Flow 2 — The Drift (exploration)
1. User arrives without searching.
2. Ocean idles. Fish drift. Glowing fish (recently active repos) pulse and dart.
3. Cursor movement scatters small fish; big creatures ignore it.
4. User clicks a glowing fish → info card appears → user clicks through to GitHub or dives deeper.

### Flow 3 — The Rescue (contribution funnel)
1. User notices a creature wrapped in netting.
2. Clicks it.
3. Card shows: repo name, "N issues unanswered for 2+ years", oldest unresolved issue link.
4. CTA: "Go to GitHub →" opens the issues tab sorted by oldest.

---

## 7. Feature Spec

### 7.1 The Ocean Canvas
- Full-viewport WebGL canvas.
- Layered depth gradient: `#0d4a68` (surface) → `#00060f` (abyss).
- Volumetric god rays from the top, animated, 5–7 shafts.
- 200–300 plankton particles drifting upward, twinkling.
- Vignette overlay.

### 7.2 The Search & Dive
- Floating search box, top-center, glassmorphic (blur + border glow).
- Matches by repo name substring. If no match, fabricates a creature deep in the world (graceful fallback so search *never* feels broken).
- On match: flash → cinematic camera ease (0.11 lerp factor vs 0.055 idle) → info card.

### 7.3 The Depth Compass (HUD)
- Left-center vertical indicator.
- Big tabular-nums number = current depth in metres.
- Depth = `max(0, (camera.y + WORLD_R) / 3.2)`.
- Thin vertical line with a glowing dot at the top.

### 7.4 Info Card
- Bottom-right, glassmorphic, slides up on selection.
- Fields: repo name, URL breadcrumb, language chip (coloured per species), stars, open issues, pulse %.
- Netting warning banner if `netted === true`.
- "Go to GitHub →" link.

### 7.5 Shareable Permalinks
- Route: `/dive/:owner/:repo`
- On load: fetch repo, place camera above it, auto-play the dive.
- This is the **growth loop**. Every shared link is a distribution node.

### 7.6 Live Pulse (V2)
- Poll GitHub API every 60s for recent push events on visible repos.
- When a push is detected: creature flashes, trail appears, surface ripples.
- Makes the ocean feel alive; drives the 7-day return rate.

---

## 8. Gamification Design

Gamification is embedded in the **core loop**, not layered on as badges or progress bars. Research shows the median onboarding-checklist completion rate is ~10%, and progress bars can *decrease* completion when early progress feels slow. So we game the *feel* of the ocean itself, not a meta-system.

| Layer | Mechanic | Why it works |
|---|---|---|
| **Species collection** | Each language is a distinct species. Discovering a new one logs a silent entry in a side panel. | Collection without a collection screen. |
| **Depth descent** | Descending feels like progress because the counter rises. | Turns navigation into a goal. |
| **Live pulse** | Commit-while-viewing = fish darts + ripple. | Micro-reward for attention. |
| **Rescue loop** | Freeing a netted whale = real contribution. | Maps game action to real-world consequence. |
| **Shareable dive** | Every dive is a shareable moment. | Distribution *is* the reward. |

**Explicitly avoided:** streaks, points, levels, badges, daily check-ins. These create pressure, not wonder — and they contradict the "calm ambient discovery" feel.

---

## 9. Technical Architecture

### Stack
- **Framework:** Vite + React 18
- **Rendering:** Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Post-processing:** `@react-three/postprocessing` (bloom, god rays, vignette)
- **State:** Zustand (camera, selection, HUD)
- **Data:** GitHub GraphQL API v4
- **Deploy:** Vercel (edge functions for API proxy + caching)

### Rendering Strategy
- **InstancedMesh** for all creature bodies (2,000+ instances, one draw call).
- Fish motion via vertex shader reading a uniform `cursorPosition` (GPU-side flee).
- Species colour via per-instance attribute.
- Netting rendered as a secondary instanced mesh over netted creatures only.

### GitHub Data Layer
**Single GraphQL query per repo batch:**
```graphql
query($names: [String!]!) {
  repos: search(query: $q, type: REPOSITORY, first: 100) {
    nodes {
      ... on Repository {
        nameWithOwner
        stargazerCount
        primaryLanguage { name }
        pushedAt
        openIssues: issues(states: OPEN) { totalCount }
        staleIssues: issues(states: OPEN, filterBy: { since: "2024-01-01T00:00:00Z" }) { totalCount }
        isArchived
      }
    }
  }
}
```

### Caching & Rate Limits
- GitHub GraphQL v4 authenticated budget: 5,000 points/hour. Batch searches (100 repos/query) to stay well inside this even under launch-day traffic.
- All GitHub calls go through a Vercel edge function (never call GitHub directly from the browser — keeps the token server-side).
- Edge-cache responses per query key with a short TTL (minutes, not seconds — repo stats don't change fast enough to justify sub-minute freshness).
- On rate-limit or network failure, serve the last cached batch if present; only fabricate a creature (§7.2) when a specific *search* has no match, not when the batch fetch itself fails.