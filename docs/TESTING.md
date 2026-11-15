# Testing Git Ocean

## Run everything

```bash
cd git-ocean
pnpm -C frontend install
pnpm dev            # http://localhost:5173 — app + the /api/github edge function (via Vite middleware)
```

Other commands (all from `git-ocean/`): `pnpm test` (Vitest, 23 tests), `pnpm lint`, `pnpm build`, `pnpm preview` (production build, no `/api`, so it shows the sample ocean).

## Mock vs. real GitHub data

With no token, the edge function serves the **sample ocean** (`frontend/src/data/fixtures.ts`) and the app says so in a footnote at the bottom-left.

For real data, create `git-ocean/.env`:

```
GITHUB_TOKEN=ghp_…   # a classic or fine-grained token; public read access is enough
```

Restart `pnpm dev`; the footnote disappears and the ocean fills with up to 500 live repos. `GITHUB_PROVIDER=mock` forces fixtures even with a token. On Vercel, set `GITHUB_TOKEN` in the project's environment variables. The token never reaches the browser. Tests never call GitHub.

## Automated browser checks

Needs `pnpm dev` running and Google Chrome installed (scripts use Playwright's `channel: 'chrome'`). Each prints JSON and writes screenshots to the given folder.

```bash
cd frontend
node e2e/flow1.mjs /tmp react            # Flow 1: search → dive → arrival
node e2e/flow23.mjs /tmp                 # Flows 2 + 3 with a mouse (add `390 844` for phone + touch)
node e2e/flow6.mjs /tmp /dive/facebook/react   # cold permalink replays the dive
node e2e/a11y.mjs /tmp                   # reduced motion + keyboard only + axe-core
node e2e/perf.mjs http://localhost:4173/ 4     # TTFR on `pnpm preview`, 4× CPU throttle
```

`?depth=6000` on any URL starts the visit at that depth (handy for checking deep creatures).

## Manual test script

Use a desktop browser first, then repeat 1–3 on a phone.

**Flow 1: The Dive**
1. Open `/`. You're in light blue water at ~300m; light shafts sway, plankton drifts up, the depth counter creeps up as the camera sinks.
2. Small fish of various colours swim past.
3. Type `react` in the search box (or press `/` to focus it) and press Enter.
4. ✅ Flash, then the camera plunges; the counter accelerates through thousands of metres and settles near 9,000m.
5. ✅ A large yellow (JavaScript) creature fills about half the screen; the Info Card slides up (react, stars, issues, pulse %). The URL is now `/dive/facebook/react`.
6. Press "Share this dive" and open the copied link in a private window. ✅ It plays the same dive and ends on the same creature and card.
7. Search for something nonsense (`zzqq-nothing`). ✅ It still dives, to an "Uncharted water" creature whose card says it's imagined.

**Flow 2: The Drift**
1. Open `/` and don't search. Bright, pulsing fish are recently active repos; dim, slow ones are dormant.
2. Sweep the mouse quickly through a group of small fish. ✅ They scatter, then drift back when the mouse rests. Large creatures ignore it. On a phone, drag to swim up and down.
3. Scroll the wheel (or use arrow keys) to swim deeper.
4. Click (or tap) a glowing fish. ✅ A ring marks it and its Info Card opens. "Go to GitHub →" opens the repo; "Dive to it" plunges to it.

**Flow 3: The Rescue**
1. Find a creature wrapped in a criss-cross net (common in the shallows of the sample ocean; also via Logbook → Nearby, marked "net").
2. Click it. ✅ The card shows "Caught in a net: N issues unanswered for 2+ years" and a link to the oldest unanswered issue.
3. ✅ "Go to GitHub, oldest issues first →" opens `…/issues?q=is:issue is:open sort:created-asc`.

**Accessibility**
- Turn on the OS's "reduce motion" setting and reload. ✅ The ocean holds still; search still dives (as a cut); clicking still opens cards.
- Keyboard only: `/` → type → Enter dives. Tab to "Logbook" → Enter → Tab through Nearby → Enter opens a card with focus on its title; Escape closes it.

## Known issues

See `docs/known-issues.md`. In short: not deployed yet (no Vercel credentials), the live GitHub query hasn't run against GitHub (no token), and motion/flee feel needs a human check on real hardware.

## Re-recording the README demo GIF

With `pnpm dev` running and Chrome installed:

```bash
cd frontend
node e2e/demo.mjs /tmp/ocean-frames      # ~10s of timed frames via Chrome's screencast
cd /tmp/ocean-frames
ffmpeg -f concat -i list.ffconcat -filter_complex "
[0:v]fps=14,scale=640:-1:flags=lanczos,split[s1][s2];
[s1]trim=end=5.3,setpts=PTS-STARTPTS,split[a1][b1];[a1]palettegen=max_colors=128:stats_mode=diff[p1];[b1][p1]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle[o1];
[s2]trim=start=5.3,setpts=PTS-STARTPTS,split[a2][b2];[a2]palettegen=max_colors=128:stats_mode=diff[p2];[b2][p2]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle[o2];
[o1][o2]concat=n=2:v=1[out]" -map "[out]" -loop 0 ~/Desktop/projects/git-ocean/docs/demo.gif
```

The shallows and the abyss each get their own palette (split at 5.3s, just after Enter); a single palette leaves blotches in the water gradient. VHS can't be used here: it records terminals, not WebGL pages.
