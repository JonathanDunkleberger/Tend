# scripts/ — browser-verification QA harness (added shift 9)

The mission's last open DoD items were gated on **browser verification** — nothing could be
*seen* rendered in a real browser. Shift 9 built a way to do that offline.

## The hard environmental finding

**Chromium in the night-train sandbox has zero HTTP network egress** — both loopback
(`127.0.0.1`) and external requests fail with `ERR_NAME_NOT_RESOLVED` / interrupted navigation,
even though the Bash/PowerShell tools themselves can reach the local server via `curl` /
`Invoke-WebRequest`. So the obvious approach — `next start` + Playwright screenshot the live
site — **cannot work in this environment**. Verified: `data:` and `file://` URLs render fine;
every `http(s)://` navigation fails.

**Consequence:** the fully-interactive in-app flows (client components that need their JS
bundles served over HTTP to hydrate/switch views) can only be eyeballed on a machine with real
network — i.e. **Jonny's machine**. But we can still verify a lot offline, because:

## What we CAN verify (the file:// pipeline)

1. **`next build` + `next start -p 3200`** in the **host** context (PowerShell, not the Bash
   sandbox — the server must share the host loopback).
2. **`scripts/build-static-html.ps1`** fetches each route's server-rendered HTML via
   `Invoke-WebRequest` (host network works), inlines the CSS, rewrites `/_next` + `/sprites`
   asset paths to `file://` local paths, strips JS, and writes a self-contained
   `scripts/rendered/<name>.html`.
3. **`node scripts/render-shot.mjs`** opens those files in headless Chromium at a 390px phone
   viewport and writes `scripts/shots/<name>-{fold,full}.png`, reporting console errors +
   failed asset requests.

- **Server components render fully** this way. The **landing page** (`app/page.tsx`, zero client
  JS) is faithfully reproduced — shift 9 eyeballed it end-to-end at phone width and signed it off
  (see `shots/landing-fold.png`). All CSS, fonts, and sprites resolved; **zero failed requests**.
- **Client components render their pre-hydration markup only.** `/preview`'s default **dragon
  gallery** (all 36 species, real sprites, `Creature` hero) renders and was verified
  (`shots/preview-fold.png`) — but its tab-switching, animations, and the other showcases
  (onboarding/wellness/wrapped/you/nav) need hydration JS and so need a networked browser.

## Reusing it (on a machine with a normal browser)

The same scripts also work the *simple* way anywhere Chromium has network: just point Playwright
at `http://localhost:3200/preview` directly (see the git history's `preview-shot.mjs`) and walk
the tabs. The file:// dance is only needed because *this* sandbox firewalls the browser.

`scripts/shots/` and `scripts/rendered/` generated output is gitignored except the two committed
`*-fold.png` proof shots.
