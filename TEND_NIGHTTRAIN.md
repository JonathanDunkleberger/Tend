# 🐉 TEND — NIGHT-TRAIN MISSION & LIVING FRONTIER

> This is the brain of the night train. Every unattended shift reads this file FIRST, works the
> **CURRENT FRONTIER** queue, and rewrites this file as it goes. Keep it truthful and current — a
> successor shift only knows what this doc tells it. Newest thinking wins; prune stale notes.

---

## 0. THE ONE-LINE PITCH

**Tend** — *"Forest, but cooler."* A warm, gamified habit-building app where your habits are **dragon
eggs** that hatch and evolve as you tend them daily. It assumes the best in you, celebrates streaks,
and turns self-improvement into a calm little garden you nurture. Cute, encouraging, beautiful,
mobile-first — something people would genuinely pay for and love opening every morning.

## 1. THE SOUL (NEVER LOSE THIS)

The name **Tend** is the brand-soul cue: *tend your garden, tend your dragon hatchlings, tend your
habits, tend your health and well-being.* Nurturing, gentle, caring, growth. It is the **opposite of a
cold productivity tracker.** It should feel like a calm, encouraging little garden you tend daily.

Preserve these pillars — they are the reason Tend exists:
- **Habits are dragon eggs** 🥚 → they hatch and evolve as you build good habits / break bad ones. We
  own beautiful dragon/egg/evolution art (36 dragon frames + egg frames in `public/sprites/dragons/`).
  Showcase them gorgeously — they are the emotional payoff.
- **Assumes the best in you.** Each day defaults to *"you did well."* You only tell it when you
  slipped — and a slip breaks the streak and gently delays the egg's hatch/evolution. Never shaming.
- **Positive, encouraging, uplifting.** Quote of the day, motivation, warmth everywhere.
- **Gamified & cute.** Streaks, coins, milestone rewards (24h / 48h / week / month milestones).
- **Habit stacking + tracking.** Anchor new habits to existing routines.
- **"Spotify Wrapped"-style summaries** of how you're doing over time.

## 2. RAISED AMBITION — GO BIG (this is a showcase; zero users, zero stakes)

Beyond the soul, lean HARD into these. This is the creative mandate:
- **DEEP, BEAUTIFUL ANALYTICS** that actually help people understand and improve — insightful, visual,
  motivating, not just a heatmap. Real *"here's how you're doing and here's what's working"* depth:
  best/worst days, momentum trends, correlations ("you journal more on days you sleep well"), streak
  histories, per-habit consistency, a genuinely delightful Wrapped.
- **GENUINELY HELPFUL WELLNESS TOOLS.** It already has a breathing exercise — expand that spirit.
  Calming, supportive, growth-oriented tools that lift people up, especially those breaking bad-habit
  loops or in a rough spot. Uplifting, never clinical or shaming.
- **DELIGHTFUL GAMIFICATION + the dragon art**, showcased beautifully.
- **PREMIUM POLISH & MICRO-INTERACTIONS** — haptic-feeling taps, spring animations, satisfying
  check-offs, confetti, sound-optional. Make it feel alive and native-quality.

## 3. MOBILE-FIRST IS NON-NEGOTIABLE

This is used on a **PHONE**. It must look and feel gorgeous, snappy, and native-quality on mobile
browsers — touch-first, thumb-friendly, beautiful on a small screen. **Design mobile-first**, make
desktop work too, but the phone experience IS the product. Think: bottom nav, thumb-reachable primary
actions, large tap targets, safe-area insets, 60fps transitions, install-as-PWA.

## 4. GUARDRAILS (only two hard rules — everything else is yours)

1. **BRANCH ISOLATION.** All work happens on the `night-train` branch. Commit freely and often, but
   **NEVER `git push`, NEVER deploy, NEVER touch `origin/main`.** The live Vercel site stays as-is
   until Jonny reviews this branch and merges it himself in the morning.
2. **NEVER LEAK SECRETS.** `.env*` stays gitignored. Never print, log, or commit the real
   Stripe / Clerk / Supabase keys. Reference `process.env.*` by NAME only. Keep Stripe + Clerk working
   (there are no real users, so you have latitude to refactor around them — just don't break the build
   or expose keys).

Everything else — UI, UX, layout, copy, features, pricing, structure — is **full creative rein.** If
something is bad, say so in DECISIONS and rebuild it.

## 5. WORKING AGREEMENT (how each shift behaves)

- **VERIFY, don't assert.** Run `npm run build` (and lint) and confirm green before claiming done.
- **Web-research / best-practices first** on anything design- or conversion-related. No blind spinning.
- **Commit per fix.** Small, titled commits are your proof of life.
- **Frontier-first discipline.** Update this doc's CURRENT FRONTIER + SHIFT LOG + DECISIONS +
  SURPRISE-ME IDEAS + NEEDS EYES *continuously*, not just at close. Rewrite the frontier BEFORE a long
  task so a successor can resume even if you die at the context wall.
- **Close each shift** by appending one line to `TEND_NIGHTTRAIN_LOG.md`.
- **Never** write `NIGHT-TRAIN COMPLETE` (line 1 of the log) until EVERY Definition-of-Done item is
  built AND build-verified. This is a large mission — expect many shifts.

---

## 6. RECON SNAPSHOT (as of setup, pre-shift-1 — VERIFY & EXPAND in shift 1)

**Stack:** Next.js 16.1 (App Router) · React 19 · Tailwind v4 · TypeScript · Clerk (auth) ·
Supabase (Postgres/data) · Stripe (payments) · lucide-react icons · deployed on Vercel (`origin/main`).

**Repo is named `tend`** (package.json). Brand = **Tend**. Was ~a weekend project; more is built than
"35%" suggests. It appears to have drifted toward a **quit-bad-habits** framing (urge support, relapse,
healing timeline, quit-progress) layered on top of the dragon-egg core.

**What exists (`src/`):**
- **Routes:** `app/(app)/garden`, `/pricing`, `/settings`; landing `app/page.tsx`; Clerk `sign-in`/`sign-up`.
- **API routes:** `checkout`, `coins`, `habits` (+ `[id]`, `[id]/log`, `[id]/relapse`), `inventory`,
  `portal`, `preferences`, `pro-status`, `quit-progress`, `urge-entries`, `verify-subscription`,
  `webhooks/clerk`, `webhooks/stripe`.
- **Components (~30):** `tend-app`, `terrarium-scene`, `creature`, `egg-picker`,
  `creature-naming-modal`, `shop`, `gallery`, `onboarding`, `morning-checkin`, `welcome-back`,
  `relapse-modal`, `urge-support`, `urge-trend`, `breathing-timer`, `healing-timeline`, `heatmap`,
  `multi-habit-heatmap`, `constellation`, `milestone-coin`, `share-card`, `confetti`, `toast`,
  `planet-items`, `reason-editor`, `tend-plus-screen`, `settings-client`.
- **Lib:** `api`, `constants`, `sprites`, `animation-tiers`, `ensure-profile`, `migrate-local-data`,
  `stripe`, `supabase/{client,server}`, `utils`. Hook: `useReducedMotion`.
- **Types:** `src/types/index.ts`. **DB:** `schema.sql` + migrations 003–007.
- **Assets:** 36 `dragon_XX.png` + egg frames in `public/sprites/dragons/`; PWA manifest + SVG icons.

### 6a. BUILD BASELINE (shift 1 — VERIFIED)

- **`npm install`**: the tree was corrupt on arrival (two overlapping installs raced → missing
  `.bin` shims + missing `next/dist/server/require-hook`). Fixed with a clean `rm -rf node_modules`
  + `npm ci`. If a successor sees "`next` is not recognized" or "Cannot find module require-hook",
  that's the tell — reinstall clean.
- **`npm run build`**: ✅ GREEN (Next 16.1.6 / Turbopack). Two blockers fixed in commit `00cb4bc`:
  1. `src/lib/stripe.ts` instantiated `new Stripe(process.env.STRIPE_SECRET_KEY!)` at *module scope*
     → threw during page-data collection when env absent. Now lazy via `getStripe()`.
  2. Clerk's `<ClerkProvider>` needs a publishable key to prerender `/_not-found`. Provided via a
     **gitignored `.env.local`** of DUMMY build-only placeholders (Clerk pub key is public anyway).
     See NEEDS EYES.
- **`npm run lint`**: ✅ 0 errors (was 4). 33 warnings remain (unused eslint-disable directives +
  a couple unused vars) — non-blocking; clean these opportunistically.

### 6b. HONEST AUDIT (shift 1)

**The core tension: brand drift toward "quit tracker."** The soul is dragon-eggs + "tend your garden,"
but the built app leads hard with **quit-bad-habits / recovery** framing (onboarding opens with
"Quit the habits holding you back"; healing timelines for cannabis/nicotine/alcohol/porn; urge logging;
relapse modal; money-saved counters). That's a real, valuable mode — but it currently *dominates* and
buries the warm dragon-garden identity. **Decision (see §10): keep quitting as a first-class MODE, but
re-center the product on the dragon-egg garden and the assumes-best daily tend.**

- **Landing (`app/page.tsx`)** — ❌ OFF-BRAND + thin. Says "grow habits, evolve creatures / your
  terrarium" — generic, no dragons, no eggs, a grey SVG blob for a hero, 4 tiny feature cards, one CTA.
  Doesn't sell the dream or show the art. **Priority-1 rebuild (Phase 1).**
- **`tend-app.tsx`** — 2808-line client monolith holding ALL state + every view
  (main/detail/add/gallery/constellation/social/shop). Feature-rich and works, but a maintainability
  wall. Don't rewrite wholesale yet; carve views out incrementally as we polish each.
- **Dragon art system (`lib/sprites.ts`)** — ✅ GREAT. 36 species w/ elements+rarity, egg↔dragon
  sprites. Underused in marketing/onboarding (onboarding shows a colored `Creature` blob on a tiny
  planet, not the gorgeous dragons). Showcase it.
- **Onboarding** — decent 4-step flow but quit-first framing + doesn't hatch/showcase a real dragon.
  Rebuild around "hatch your first egg" (Phase 1).
- **Pricing** — Free (3 habits) vs Tend+ ($4.99/mo, $39.99/yr). Toggle says "Save 33%" while copy
  says "Save $20/year" (39.99 vs 59.88 = 33% ≈ $20 — internally consistent but double-stated). Fine
  for now; revisit in Phase 5 with a real cost model + benchmark.
- **Infra** — Clerk auth, Supabase (service-role, Clerk-gated, no RLS — queries filter by user_id),
  Stripe with webhook + a webhook-independent verify fallback (robust). Seasons, dark theme (THEME
  map), shop economy, milestone coins, breathing timer all present.
- **Mobile** — inline-style heavy, no bottom nav (uses a slide-out menu + in-component page state).
  Safe-area helper exists but sparsely applied. Needs a real thumb-first nav + safe-area pass (Phase 6).

---

## 7. THE PLAN (phased — reorder/rewrite as you learn)

**PHASE 0 — Baseline & Recon** *(shift 1)*
- `npm install`, `npm run build`, `npm run lint`. Record exact status here. Fix anything red.
- Walk every screen (read the code; run `next dev` if useful). Write the honest audit into §6:
  what works, what's half-done, what's stale, what's beautiful, what's embarrassing.
- Decide the product spine: is Tend "build good habits" first with quitting as a mode, or both equally?
  Propose the information architecture (screens + bottom nav) in DECISIONS.

**PHASE 1 — The Front Door (conversion)** *(Figma-level landing + onboarding)*
- Rebuild the marketing landing (`app/page.tsx`) into a gorgeous, mobile-first, conversion-optimized
  page: hero with living dragon, the emotional promise, social proof scaffolding, crisp pricing, strong
  CTA. This is what makes someone pay.
- Rebuild onboarding into a delightful 60-second "hatch your first egg" flow.

**PHASE 2 — Core Loop Polish** *(the daily habit)*
- The daily check-in / garden home: make tending feel *great*. Assumes-best default, one-tap "all good,"
  gentle slip reporting, satisfying micro-interactions, streak + coin feedback, egg progress toward hatch.
- Showcase the dragon evolution art at every milestone with real animation.

**PHASE 3 — Deep Analytics + Wrapped**
- A genuinely insightful analytics screen (trends, best days, consistency, correlations, momentum).
- A shareable "Tend Wrapped" summary.

**PHASE 4 — Wellness Suite**
- Expand beyond breathing: grounding, reframing, urge-surf timer, gratitude/journal, calm mode —
  uplifting tools, never clinical.

**PHASE 5 — Economics & Monetization**
- Model costs (Supabase/Clerk/Stripe/Vercel free-tier reality). Propose free vs Pro split + price that
  could actually convert (benchmark Forest/Finch/Fabulous/Duolingo). Wire it cleanly through Stripe.

**PHASE 6 — Premium Polish Pass**
- Sound (optional), haptic-feel, empty states, error states, loading shimmer, PWA install, dark mode,
  accessibility, 60fps everywhere. The "how is this a web app" pass.

---

## 8. DEFINITION OF DONE (refine as the vision sharpens — do NOT declare COMPLETE until all true)

- [x] `npm run build` + `npm run lint` pass clean on the `night-train` branch. *(green every shift;
      re-verified shift 6 — build ✅, lint 0 errors / **5 warnings** (down from 27, all intentional).
      **shift 11: added a real test runner + suite** — `npm test` (vitest) now runs green,
      covering the pure core-loop math (streak/grace/best-streak) + dragon-evolution stage thresholds +
      quit-day math. The repo had ZERO tests before; this is the first automated regression net.
      **shift 12: extended the net to the reward + analytics math** — extracted `lib/progress.ts`
      (`computeConsistency` / `selectNewMilestones` / `selectNewCoinTiers` / `computeSynergies`) out of
      constellation + the tend-app monolith and added 24 more cases, so `npm test` is now **54/54 green**
      covering consistency %, milestone coin+grace-token grants, AA coin-tier unlocks, and synergy grading.
      **shift 13: locked the LAST untested reward cluster — the quit-mode economy + relapse-evolution
      math** — extracted `lib/quit.ts` (`computeCleanDays` / `computeMoneySaved` / `computeTotalSaved` /
      `computeQuitBest` / `applyStageDrop` / `computeQuitStage`) out of the monolith + delegated, adding
      24 more cases → `npm test` **78/78 green**. Every user-facing dollar figure AND the gentle
      dragon-regresses-one-stage-on-slip math is now regression-locked, not trusted by cold-read.)*
- [x] A stunning, mobile-first, conversion-optimized **landing page** that sells the dream. *(shift 1:
      new `app/page.tsx`, on-brand, verified 200. **shift 9: BROWSER-VERIFIED** — rendered the real
      page in headless Chromium at a 390px phone viewport and eyeballed it end-to-end (Fraunces serif
      hero + green-gradient headline, dragon+eggs hero art, "assumes the best" pill, readable subtitle
      [shift-7 contrast holds], daily-loop steps, feature bento, dark collection strip, never-shaming
      quote, $0/$4.99 pricing, sticky mobile CTA). CSS/fonts/sprites all resolved, **zero failed
      requests**. Proof: `scripts/shots/landing-fold.png`. See §14 for how [file:// pipeline].
      **shift 52: added an evolution-journey strip** that SHOWS the dragon growing through all 5 real
      stages (Egg→Elder, Day 1→30) — the #1 emotional payoff was previously only described in words;
      browser-verified, all 5 stages fit in view on a phone. Proof: `scripts/shots/evo-journey.png`.)*
- [x] A delightful **onboarding** that hatches the first egg in under a minute. *(shift 1: rebuilt
      grow-first twilight-garden flow. NOT yet browser-verified — auth-gated.)*
- [ ] The **daily core loop** feels great on a phone: assumes-best check-in, streaks, coins, egg
      progress, dragon evolution art showcased with animation. *(shift 2: one-tap assumes-best check-in.
      shift 5: ambient egg-warming progress bar per garden row. Left: browser-verify on a real phone.)*
- [x] A **deep analytics** screen that genuinely helps + a shareable **Wrapped**. *(shift 3: Insights
      page = heatmap + Tend Wrapped + overview + weekly trend + per-habit consistency + day-of-week +
      synergies + streak records + calm advice. Build-verified; not yet browser-verified — auth-gated.)*
- [x] An expanded **wellness suite** (breathing + at least 2–3 more uplifting tools). *(shift 2:
      4 tools — Breathe + grounding + urge-surf + gratitude. shift 6: gratitude now persists
      server-side + surfaces in Insights, and a 5th tool — a "Wind down" calm/night mode — shipped.
      All wellness leftovers now banked.)*
- [x] A coherent **pricing/monetization** model (costs modeled, free/Pro split, Stripe wired). *(shift 4:
      §13 PRICING MODEL — costs modeled, competitor benchmark, free/Tend+ split + price recommendation.
      Stripe already wired. Executing the recommended price tweak is an optional follow-up.)*
- [ ] **Premium polish**: micro-interactions, dark mode, PWA install, accessibility, safe-area insets.
      *(shift 4: PWA install prompt + on-brand manifest. shift 5: reduced-motion guard, `:focus-visible`
      ring, accessible role="checkbox" check-off, warm empty-garden state, `syncError` save-fail toasts,
      egg-warming viz. **shift 61: a real error boundary** — `(app)/garden/error.tsx` turns a transient
      Supabase read failure from a false-empty/streaks-0 garden into a warm, reassuring, one-tap-retry
      state (the app had NO error boundary anywhere before). shift 6: `clickable()` a11y helper made the
      garden's primary tap targets keyboard-operable (roles + Enter/Space + aria-labels). shift 7:
      **WCAG contrast pass across all three surfaces** (THEME map both themes + landing + /pricing), each pair verified via computed
      luminance ratios — no browser needed; light-theme subtext went from ~1.5–2:1 (near-invisible) to
      ≥4.5:1 AA. Remaining: optional per-view skeletons + service worker (SW deliberately skipped until
      browser-verifiable) — all minor. The real gate here is a real-device eyeball.)*
- [ ] Everything **branding-consistent as "Tend"** with the warm garden aesthetic. *(shift 5: README
      rebranded off the stale recovery-first framing → dragon-garden identity + correct pricing/stages.
      Landing/onboarding/manifest already on-brand. **shift 60 swept the remaining recovery-first drift**:
      the `/settings` route ("all recovery features" → "all wellness tools", + indigo→green + fixed its
      broken `className="card"`), the Tend+ paywall ("matters to your recovery" / "free recovery tools" →
      garden/wellness framing), welcome-back ("coins for recovery" → "for showing up"). The old
      "pricing route uses terrarium labels" note was STALE — grep-verified "terrarium" now appears only
      in internal identifiers (component name/comments), never user-facing copy; /pricing reads "All
      garden décor & themes". Quit-mode "recovery" copy (healing timelines, relapse modal) is correctly
      left in-context. Remaining: a real-device eyeball of the full in-app copy.)*
- [ ] This doc + DECISIONS reflect the final state so Jonny can review and merge with confidence.

---

## 9. CURRENT FRONTIER (the live work queue — top item is next)

> NEXT SHIFT — shift 61 aimed hunters at the surfaces shift 60 named as still-unswept (settings-client,
> onboarding→save handoff, webhook edge cases) AND fixed the shift-60-documented garden error-swallowing
> with a real error boundary. It PAID OFF: **6 genuine reasoning-verified bugs FIXED (#0av, 5 fix
> commits), several on the money/auth path.** (1) **garden had NO error boundary anywhere** — a transient
> Supabase read failure silently rendered a false-empty garden / streaks-0; now the critical reads throw
> to a new warm `garden/error.tsx` ("Your garden needs a moment", reassures data is safe, one-tap retry).
> (2) **both webhooks swallowed every DB error + always 200** → Stripe/svix never retried → a transient
> blip on checkout stranded a paying user on free forever; now a failed write throws → 500 → provider
> retries (guarded against the profiles.email NOT-NULL poison-retry via UPDATE-first/INSERT-with-""-
> fallback, without reintroducing the shift-53 email-clobber). (3) **Stripe subscription.updated
> downgraded to free on the first `past_due`** (mid-dunning, still recoverable) → now keeps Pro through
> dunning, only terminal states drop to free. (4) **Clerk stored email_addresses[0], not the primary** →
> now resolves via primary_email_address_id. (5) **onboarding committed its done-flag even when the
> starter-habit POSTs failed** → empty garden + onboarding permanently suppressed + silent data loss; now
> gates the flag on real success (addHabit returns ok), adds a re-entrancy guard + disabled button
> (double-tap duplicates), drops the destructive absolute {coins:250} POST. (6) **preferences PUT
> blind-replaced append-only jsonb** (earned_milestone_coins/gratitude) → a stale 2nd-device snapshot
> wiped entries; now server-side merges (union). build GREEN, lint 0/5, **test 107/107**. **The honest
> read for the successor:** shifts 57/60/61 each proved "cold-read vein exhausted" was SURFACE-scoped —
> every freshly-enumerated unswept file set has held real bugs. But the webhook + server-hydration +
> onboarding + settings + preferences surfaces are NOW swept. Genuinely-unswept territory left is thin:
> the deeper tend-app monolith effect wiring beyond what shift 59 touched, the quit/relapse/urge client
> internals, or the remaining API routes (coins/inventory internals already atomic). Expect thin returns.
> **Still Jonny-only (unchanged):** run `migration-009` + `-008` in Supabase; §13/#16 Stripe price change
> (keyed); verify-subscription 10-session fallback (real Stripe volume); bounce-back ramp fires for ALL
> users not just after a lapse (product call); the real-device eyeball of the auth-gated app (§14). The
> meaningful un-checked DoD items still hinge on Jonny's browser, not new code.

> PRIOR POINTER — shift 60 stopped reflexively re-hunting the client/API surfaces (11 shifts deep, thin)
> and instead aimed a fresh hunter at the ONE genuinely-never-swept surface: the SERVER data-hydration
> path (garden/page.tsx → props → TendApp). It PAID OFF with a real, high-value CONFIRMED bug plus a
> branding sweep (#0au, 5 commits). **THE BIG ONE — build dragons silently de-evolved to eggs.**
> `garden/page.tsx` ships only the last 90 days of `habit_logs` (correct for heatmaps/streaks), but the
> client's `getTotal` for a build habit returned `h.logs.length` — that SAME windowed array — and
> `getStageForId` derives the dragon stage from `getStage(getTotal)`. So (a) "total days" was capped at
> ~90 everywhere it shows (gallery, detail, Wrapped, constellation), and (b) a build habit whose logs are
> ALL older than 90 days (active months, then away >90 days) → getTotal 0 → **a fully-grown stage-4
> dragon rendered as a stage-0 EGG** — the #1 emotional pillar, destroyed on return. FIX: server now
> computes the TRUE lifetime count per habit via an exact count query (head:true, avoids Supabase's
> 1000-row select cap; falls back to the windowed count on a transient error so a total is never
> spuriously 0); client folds in the immutable pre-window remainder (`preWindowTotals[id] =
> initial.totalDays − initial.logs.length`, memoized from the mount snapshot) so `getTotal = live
> logs.length + offset` — lifetime totals + stage are correct AND still track today's optimistic
> check/uncheck (today is strictly in the window, never double-counted; new mid-session habits get offset
> 0). Also this shift: **branding sweep** — the standalone `/settings` route (reached from the You screen)
> had cards using `className="card"` (a class that DOESN'T EXIST → fully unstyled/broken) + "all recovery
> features" copy + off-palette indigo accent → fixed to real card styling + "all wellness tools" + garden
> green; the **Tend+ paywall** (shown to ALL users) said "matters to your recovery" / "free recovery
> tools" → garden/wellness framing; welcome-back "coins for recovery" → "for showing up". Also new users
> now get the real current season (was hardcoded "summer" even in December). build GREEN, lint 0/5,
> **test 107/107**. **Hunter findings NOT fixed (documented, low/transient):** every query in
> garden/page.tsx swallows its Supabase error (destructures only `{data}`), so a TRANSIENT failure on the
> habits query renders a false empty garden / on logs renders streaks 0 — alarming but self-healing on
> reload, no data loss; the proper fix is an error-state UX (needs browser design), so left per the
> don't-half-fix discipline (see §12). **Still Jonny-only (unchanged):** run `migration-009` + `-008` in
> Supabase; §13/#16 Stripe price change (keyed); verify-subscription 10-session fallback (real Stripe
> volume); bounce-back ramp fires for ALL users not just after a lapse (product call); the real-device
> eyeball of the auth-gated app (§14). **Honest read for the successor:** the server-hydration surface is
> now swept too. The remaining hunt territory is genuinely thin — a future hunter's best untouched angle
> is the settings-client / onboarding→save handoff internals, or the API webhook edge cases — but expect
> thin returns. The meaningful un-checked DoD items still hinge on Jonny's browser, not new code.

> PRIOR POINTER — shift 58 CLOSED BOTH of shift 57's found-but-deferred bugs (they were more
> reasoning-verifiable than the deferral implied), then ran a fresh hunter on the least-swept surfaces
> and fixed 2 more nits. Banked (#0as, 3 fix commits): (1) **log-route milestone keying** — now keys on
> the RAW consecutive streak (`computeStreakForDate`, tested) instead of total-days-logged, killing the
> phantom-`streak:N` false-suppression while preserving the perfect-streak cross-device badge (§10 design
> call). (2) **reduced-motion SMIL** — added an `ambientPulse` tier flag gating the moon + planet-shadow
> pulses, and fixed the `constellation.tsx` synergy-line twin (no reduced-motion awareness at all). (3) a
> fresh hunter on habits-CRUD/quit/pro/verify/checkout/portal routes + 11 unswept components found only
> LOW-sev: `urge-entries ?limit` had no NaN/range guard (`?limit=abc` → `.limit(NaN)` → 500) and
> `healing-timeline` showed "tomorrow" next to a "2h" sub-day step — both fixed. build GREEN, lint 0/5,
> **test 99→107**. The hunter CONFIRMED the rest of those surfaces are clean (habits PATCH allowlist,
> pro-status, checkout, portal, morning-checkin, breathing-timer, urge-trend bucketing, multi-heatmap
> quit fill all traced correct). **The §12 deferred bug list is now empty of code-fixable items.**
> **Still Jonny-only (unchanged):** run `migration-009` + `-008` in Supabase; §13/#16 Stripe price change
> (keyed); the verify-subscription 10-session fallback (needs real Stripe volume to fix right — the only
> remaining known gap); the bounce-back ramp fires for ALL users not just after a lapse (product call);
> the real-device eyeball of the auth-gated app (§14). The `next/font` conversion stays rejected. Honest
> read: the cold-read vein across API routes + component internals is now genuinely well-swept (shifts
> 49–58); a future hunter should aim at anything still untouched (e.g. the tend-app monolith's deeper
> effect wiring) but expect thin returns. Remaining un-checked DoD items hinge on Jonny's browser.

> PRIOR POINTER — shift 57 REOPENED the cold-read bug vein that shifts 49–53 had declared "exhausted" and
> found it was NOT: prior hunts concentrated on reward/celebration/optimistic-update/analytics + the
> coins/inventory/stripe/urge API routes, but several surfaces had NEVER been deeply swept — the
> data-lifecycle helpers (`migrate-local-data`, `ensure-profile`), the log/relapse/preferences/clerk-
> webhook routes' date+integrity handling, and a batch of component internals. Two focused fan-out
> hunters over that fresh territory surfaced **5 genuine, cold-verifiable bugs, all FIXED (#0ar):**
> (1) both heatmaps dropped today's cell every morning before local noon (noon-anchored timestamp vs the
> clock); (2) the one-shot localStorage→Supabase migration swallowed server 4xx/5xx (fetch doesn't
> reject on them) and still set its done-flag → permanent silent data loss; (3) a transient `.single()`
> read error in `ensureProfile` fell through to an upsert that reset a Pro user to free / wiped coins;
> (4) the Clerk `user.updated` webhook could clobber a stored email with `""` (same class as shift-53's
> Stripe fix); (5) the relapse route had an unguarded body parse + no intensity/note validation. build
> GREEN, lint 0/5, test 99/99, 3 commits. **LESSON (see §10): "cold-read vein exhausted" was surface-
> scoped, not codebase-wide — a successor CAN still hunt, but must aim at explicitly-unswept files, not
> re-run the same surfaces.** **Two found-but-DEFERRED (see §12):** (a) the `habits/[id]/log` route
> awards "streak" milestones off *total-days-logged*, not consecutive streak, and rehydrates into the
> client's celebration-dedup — a real missed-celebration bug, but the correct fix needs server-side
> streak logic that can't even match the client's grace-token-aware streak → design + DB verification
> required (documented, not half-fixed). (b) the terrarium moon/planet-shadow SVG **SMIL** `<animate>`
> nodes aren't gated by reduced-motion (CSS media query doesn't stop SMIL) — minor/subtle. **Still
> Jonny-only:** run `migration-009` + `-008` in Supabase; §13/#16 Stripe price change (keyed); the
> bounce-back ramp fires for ALL users not just after a lapse (product call); the real-device eyeball of
> the auth-gated app (§14). The `next/font` conversion stays rejected (113 literal font refs → invasive +
> visually unverifiable here). Remaining un-checked DoD items still hinge on Jonny's browser, not new code.

> PRIOR POINTER (shift 56) — shipped `/robots.txt` + `/sitemap.xml` (#0aq), completing the site's
> technical SEO (structured-data + OG + robots + sitemap). At the time the honest read was "no further
> sandbox-verifiable improvement remains / branch is mature" — shift 57 corrected that re: the bug vein
> (see above); the SEO/landing conclusion still holds (that surface IS complete).

> PRIOR POINTER (shift 53) — re-triaged the §12 "for Jonny" list and banked the two that were actually
> reasoning-verifiable guards (urge-entries habit-ownership check + Stripe email-clobber, #0an). Lesson
> recorded in §10: when a bug is parked "needs a live service," check whether the *fix* needs the service
> or just the *repro* — a guard/validation fix is usually cold-verifiable. Shift 54 applied the same
> lesson to the atomicity race. The cold-read bug vein (reward/celebration/optimistic-update/stale-
> snapshot/analytics-derivation classes) is genuinely exhausted across shifts 49–53; the file://-
> verifiable landing levers (copy/FAQ/OG/pricing/promise/showcase/evolution-payoff) are all done.

0av. ✅ **[SHIFT 61] Swept the surfaces shift 60 named as unswept (settings-client, onboarding→save,
   webhook edge cases) + fixed the documented garden error-swallowing — 6 real bugs FIXED, several on
   the money/auth path (reasoning-verified, no DB/browser).** Two fan-out hunters + a direct fix of the
   §12-documented issue. **(1) [garden] NO error boundary existed anywhere in the app.** garden/page.tsx
   destructured only `{data}` on every Supabase read, so a transient failure on the habits query rendered
   a false "zero habits" garden and a failure on logs rendered every streak at 0 — the emotional core
   looking wiped. Now the two critical reads THROW on error, caught by a new `(app)/garden/error.tsx`
   boundary: a warm, on-brand "Your garden needs a moment" screen that reassures dragons/streaks/coins are
   safe and offers a one-tap retry (`reset()` re-runs the server component, self-healing the transient
   failure). Advances the "premium polish: error states" DoD sub-item. **(2) [webhooks] Both Stripe +
   Clerk webhooks swallowed every DB write error and always returned 200** → Stripe/svix marked the event
   delivered and NEVER retried, so a transient blip during `checkout.session.completed` permanently
   stranded a paying user on `tier:free`. Now a failed write throws → 500 → the provider retries. Making
   writes fail-loud exposed the `profiles.email NOT NULL` trap (a fresh INSERT lacking email would
   poison-retry against the constraint forever) → handled with UPDATE-first (email omitted → never
   clobbers a real address, preserving the shift-53 fix), INSERT only if missing with `email || ""` (the
   ensureProfile placeholder); Clerk falls back to "" only on `user.created`, still omits on `user.updated`.
   **(3) [stripe] `subscription.updated` downgraded to free on the first `past_due`** — mid-dunning, while
   Stripe is still retrying a recoverable renewal charge; now keeps Pro through active/trialing/past_due,
   only terminal states (+ subscription.deleted) drop to free. **(4) [clerk] stored `email_addresses[0]`,
   not the primary** (array order isn't guaranteed) → now resolves via `primary_email_address_id`, so
   receipts/billing go to the right address. **(5) [onboarding] committed the done-flag even when the
   starter-habit POSTs failed.** `handleOnboardingComplete` awaited `addHabit` (which toasts + returns,
   never throws) then UNCONDITIONALLY set `tend_onboarding_complete` + closed the overlay → a transient
   failure left an empty garden AND permanently suppressed onboarding (flag re-reads true forever), losing
   the chosen starter habit silently. Now `addHabit` returns `result.ok`; the flag/prefs-PUT/close only run
   on real success (else returns false so the user can retry); a re-entrancy ref + disabled "Entering…"
   button kill double-tap duplicates (the habits route has no dedup); dropped the destructive absolute
   `{coins:250}` POST (coins already default to 250 via ensureProfile — no-op on happy path, a reset on
   re-entry). **(6) [preferences] PUT blind-replaced the append-only jsonb** (`earned_milestone_coins`,
   `gratitude_entries`) → a stale second-device snapshot would WIPE entries this device never saw; now the
   route reads + MERGES (coins: union arrays per key; gratitude: union by date, newest 60), so a write can
   at worst momentarily miss a concurrent add (self-heals) rather than delete. Also fixed the GET default's
   hardcoded `season:"summer"` → `getSeason()` (same class shift 60 fixed). build GREEN, lint 0/5, **test
   107/107**, 5 fix commits. **Hunter CONFIRMED clean (traced, not skipped):** `settings-client.tsx` (a
   24-line portal button, no data/dates); the onboarding field-mapping, buildPick-always-present invariant,
   quit dailyCost persistence, and quitDate UTC-timestamp (fine — quit math uses timestamp diffs, not
   local-date keying); preferences auth checks + partial-upsert-preserves-unlisted-columns + column names +
   checkout↔webhook metadata key match + both signature verifications.

0au. ✅ **[SHIFT 60] Hunted the never-swept SERVER data-hydration path — FIXED a high-value dragon
   de-evolution bug + a branding sweep (reasoning-verified, no DB/browser).** Prior hunts (49–59) swept
   the client monolith + API routes; the server components that fetch from Supabase and assemble TendApp's
   props had NEVER been a hunt focus. A fan-out hunter there found one CONFIRMED, high-value defect.
   **(1) Build dragons silently de-evolved to eggs / lifetime totals undercounted.** `garden/page.tsx`
   ships only the last 90 days of `habit_logs` (correct for heatmaps/streaks), but the client's `getTotal`
   for a build habit returned `h.logs.length` — the same windowed array — and `getStageForId` derives the
   evolution stage from `getStage(getTotal)`. So "total days" was capped ~90 in the gallery/detail/Wrapped/
   constellation, and — worse — a build habit whose completions are ALL older than 90 days (active months,
   then away >90 days) got `getTotal` 0 → `getStage(0)` → a fully-grown **stage-4 dragon rendered as a
   stage-0 egg** (build totals are cumulative and must never shrink — this is the emotional payoff
   collapsing on return). FIX: server computes the TRUE lifetime count per habit via an exact count query
   (`{count:"exact", head:true}` per habit — avoids Supabase's 1000-row select cap; falls back to the
   windowed count on a transient error so a total is never spuriously 0); client folds in the immutable
   pre-window remainder (`preWindowTotals[id] = initial.totalDays − initial.logs.length`, memoized from the
   mount snapshot) → `getTotal = live logs.length + offset`, which stays correct AND tracks today's
   optimistic check/uncheck (today is strictly in-window → never double-counted; a habit added mid-session
   has no offset → 0, correct). **(2) Branding sweep** (the "branding-consistent as Tend" DoD item): the
   standalone `/settings` route (reached from the You screen via `router.push("/settings")`) had its two
   cards on `className="card"` — a class that does NOT exist in globals.css (the app uses `.cd`) → they
   rendered fully unstyled (no bg/border/shadow, looking broken); replaced with a real inline CARD style.
   Its copy "Free: 3 habits, all recovery features" → "3 habit eggs, all wellness tools"; off-palette
   indigo `#6366f1` accent → garden green `#2e7d32`. The **Tend+ paywall** (shown to ALL users, not just
   quitters) said "Track everything that matters to your recovery" + "free recovery tools for everyone" →
   garden/wellness framing; welcome-back "bonus coins for recovery!" → "for showing up!". **(3)** New users
   now get the real current season (`getSeason()`) instead of a hardcoded `"summer"` that masked the
   client's month-based auto-detect (a December signup saw a summer terrarium). build GREEN, lint 0/5,
   **test 107/107**, 5 commits. **Hunter findings NOT fixed (documented, see §12):** every Supabase query
   in `garden/page.tsx` swallows its error (destructures only `{data}`) → a TRANSIENT failure renders a
   false empty garden (habits query) or streaks-0 (logs query); alarming but self-healing on reload, no
   data loss — the right fix is an error-state UX (needs browser design), left per the don't-half-fix rule.
   The quit-mode "recovery" copy (healing timelines, relapse modal) is CORRECTLY left — that's the
   first-class quit mode, in-context.

0at. ✅ **[SHIFT 59] Swept the two surfaces shift 58 flagged as still-unswept — FIXED 6 real bugs
   (reasoning-verified, no DB/browser).** Shift 58 said the monolith's deeper effect wiring + any
   untouched components were the last productive vein; two fan-out hunters confirmed it. **Monolith
   effect wiring (never swept):** (1) **`syncError` was a silent no-op.** It set a "Couldn't save —
   bringing you back in sync" toast then called `router.refresh()`, but EVERY server value is held in
   `useState(initial…)` seeded once at mount with no props→state reconciliation anywhere (grep-confirmed:
   `initialHabits` is only read by the `useState` init + a `.length` mount check; there is no
   `setHabits(initialHabits)`; TendApp is mounted with no `key`). A soft server re-render therefore
   passes fresh props that React silently drops → the FAILED optimistic state stays on screen (inflated
   totals/streak, a possible false all-done celebration) until a manual reload. Switched to
   `window.location.reload()` — the only thing that actually restores truth, and it matches the toast's
   own promise. (2) **Hatch-naming re-nag.** The stage 0→1 detector re-popped the "Name your creature"
   modal every time a build habit's total dipped below the stage-1 threshold (uncheck → total 3→2) and
   re-crossed it (re-check → 2→3) IF naming had been skipped (`onSkip` persists no name), so a dismissed
   ceremony nagged on every uncheck/recheck cycle. Added a session-level `namingOfferedRef` set so the
   ceremony is offered once per habit. (3) **Pausing an unfinished habit fired the all-done celebration
   + banked the daily +10.** `allDone` excludes paused habits from the denominator, so pausing the last
   undone habit flipped `allDone` false→true → confetti/shooting-star/banner + the once-daily +10 grant,
   letting a user claim "all done" by pausing rather than finishing. Added a `pauseToggledRef` (set in
   `togglePause`) + a small reconcile effect defined BEFORE the celebration effect that consumes the flag
   and adopts the new `allDone` as baseline without celebrating (keyed on `[pausedHabits, allDone]` so
   the flag is always consumed, never lingering to suppress a later genuine flip). **Smaller components
   (never swept):** (4) **confetti ignored reduced-motion** — the celebration burst runs via canvas
   `requestAnimationFrame`, which the global `prefers-reduced-motion` CSS rule does NOT stop (same class
   as shift 58's SMIL gaps); now reads `useReducedMotion` and renders nothing / skips the rAF loop.
   (5) **urge-support crisis copy was wrong** — the "Breathe" card promised "5-minute guided breathing"
   but the session is 5 cycles × (4+4+6)=14s = ~70s; corrected to "One minute of guided breathing" so a
   user in a rough spot isn't misled. (6) **the Tend+ "Restore purchase" button was completely inert**
   (no `onClick`, no restore prop — also an App Store review requirement); wired an OPTIONAL `onRestore`
   prop (optional so `/preview` + mock callers don't break) to re-run the app's existing idempotent
   `/api/verify-subscription` regardless of current tier → restores Pro + closes the paywall on success,
   or a gentle "No active subscription found" toast otherwise. build GREEN, lint 0/5, **test 107/107**,
   3 fix commits. **Deliberately NOT fixed (benign / load-bearing):** the milestone-coin + toast
   auto-dismiss timers reset on every parent re-render (safe today because the only fast re-render source
   — the 10s `liveNow` tick — is slower than the 2.5–5s timers; the components hunter warned the toast's
   unstable-callback identity is what keeps rapid message-replace resetting the timer correctly, so
   touching it risks a truncated undo window). Also re-confirmed shift 58's terrarium reduced-motion fix
   is complete (every SMIL cluster gated `false` in the minimal tier). See §10 shift-59 decision.

0as. ✅ **[SHIFT 58] Closed BOTH shift-57 deferred bugs + 2 more nits (reasoning-verified, no DB/browser).**
   Shift 57 parked two bugs as "needs design/browser"; on a fresh read both were more cold-fixable than the
   deferral implied (shift-53's lesson: check whether the *fix* needs the service, or just the *repro*).
   (1) **[api] Log-route milestones keyed on total-days-logged, not consecutive streak** (deferred #5). The
   route inserted `milestone_type:"streak", value: count(habit_logs)` — total distinct days EVER logged —
   which rehydrates into the client's `earned` map (dedups celebrations + lights the detail badge grid), so
   a sporadic logger reaching 7 *total* days (never a run) got a phantom `streak:7` row that SUPPRESSED the
   real 7-day-streak celebration. The server can't see the client's grace tokens, so it now records the
   best RAW consecutive streak it can derive from the log dates via a new tested pure helper
   `computeStreakForDate` (lib/streak.ts → delegates to the tested `computeStreak` over a tz-independent
   UTC-noon date walk). Kills the false-suppression while preserving the perfect-streak case (streak ==
   total → still persists cross-device); grace-bridged milestones fall back to the client's localStorage
   `granted` dedup. +8 unit cases. (2) **[a11y] Ambient SVG SMIL ignored reduced-motion** (deferred #6).
   The global `@media (prefers-reduced-motion)` CSS rule doesn't stop SVG SMIL `<animate>`; the moon
   r/opacity pulses + the planet-shadow ry pulse were ungated (every other terrarium SMIL node already gated
   by a `tc.*` flag). Added an `ambientPulse` tier flag (full+reduced true, minimal false) + gated the
   three — restoring the tier system's own "minimal = static scene" contract. **Found + fixed the twin:**
   `constellation.tsx`'s synergy-line pulse was the lone SMIL node there with NO reduced-motion awareness →
   added `useReducedMotion` + gated it. (3) **Fresh hunter on the least-swept surfaces** (habits-CRUD/quit/
   pro/verify/checkout/portal routes + 11 components) found only LOW-sev: `urge-entries ?limit` had no
   NaN/range guard (`?limit=abc` → `parseInt`=NaN → `.limit(NaN)` → malformed query/500; now clamped 1..500)
   and `healing-timeline` rendered "tomorrow" beside a "2h" sub-day step (`Math.ceil(0.08)=1`; sub-day steps
   now count down in hours) — both fixed. The hunter CONFIRMED the rest clean (habits PATCH allowlist,
   pro-status, checkout, portal, morning-checkin, breathing-timer, urge-trend bucketing, multi-heatmap quit
   fill). build GREEN, lint 0/5, **test 99→107**, 3 fix commits. §12 code-fixable deferred list now EMPTY;
   the only remaining known API gap (verify-subscription 10-session fallback) genuinely needs real Stripe
   volume. See §10 shift-58 decision for the milestone-keying design call.

0ar. ✅ **[SHIFT 57] Fresh cold-read bug hunt on the NEVER-swept surfaces — FIXED 5 real bugs
   (reasoning-verified, no DB/browser).** Shifts 49–53 declared the cold-read vein "exhausted," but that
   was scoped to the surfaces THEY swept (reward/celebration/optimistic-update/analytics + coins/
   inventory/stripe/urge routes). Two fan-out hunters aimed at genuinely-unswept territory — the data-
   lifecycle helpers, the log/relapse/preferences/clerk-webhook routes, and 10 component internals —
   found 5 genuine defects, each traced + verified before fixing. (1) **[insights] Both heatmaps dropped
   today's cell before local noon.** `heatmap.tsx` + `multi-habit-heatmap.tsx` guarded future days with
   `new Date(date+"T12:00:00") > new Date()` — the cell was anchored to NOON but compared to the actual
   clock, so today counted as "future" any time the app opened before 12:00 (heatmap skipped it entirely;
   multi-habit rendered it transparent), reappearing only after noon. Now compares LOCAL date strings vs
   `today()` (never true for `daysAgo(i>=0)`). (2) **[data] One-shot migration swallowed server errors →
   permanent data loss.** `migrate-local-data` `await`ed every fetch but ignored the response; fetch only
   rejects on NETWORK errors, not 4xx/5xx, so a server failure was swallowed and `tend_data_migrated`
   was still set — losing the user's quit dates / owned items forever (the file's own comment promised
   "retry next load", which never fired). Routed through a `putJson()` helper that throws on `!res.ok`.
   (3) **[data] `ensureProfile` could reset a Pro user to free / wipe coins.** The initial `.single()`
   SELECT error was discarded; a transient read failure while the row exists made `existing` null →
   fell through to an `onConflict: clerk_id` upsert of `{tier:"free", coins:250, streak_freezes:{}}` that
   UPDATEs the live row. Now distinguishes PGRST116 (no rows → create) from a real error (return a
   transient default WITHOUT writing). (4) **[api] Clerk `user.updated` email-clobber** — email fell back
   to `""` and upserted over a real address (same class as shift-53's Stripe fix); now only written when
   Clerk provides one. (5) **[api] Relapse route hardening** — unguarded `req.json()` (empty body → 500)
   now try/caught; `intensity` clamped to 1–10, `note` capped at 500 chars. build GREEN, lint 0/5, test
   99/99, 3 commits. **DEFERRED (documented, not half-fixed — see §12 #5/#6):** the log-route milestone
   uses total-days-logged not consecutive-streak (real, but the fix needs server-side grace-aware streak
   logic + DB verification), and the terrarium SMIL `<animate>` nodes ignore reduced-motion (minor).

0aq. ✅ **[SHIFT 56] robots.txt + sitemap.xml — the last missing technical-SEO surface.** The landing
   carried structured data (JSON-LD #0ap) and an OG card (#0ab), but the site had NO `robots.txt` and NO
   `sitemap.xml` — so a crawler had zero index directives and nothing pointing it at the JSON-LD-rich
   landing (crawl-budget + discoverability left on the floor). Added two Next metadata routes:
   **`app/robots.ts`** (`allow: /`; `disallow` the auth-gated app + `/preview` QA harness — all would
   only 302 to sign-in or expose a mock-data page → wasted budget/thin results; `sitemap:` pointer) and
   **`app/sitemap.ts`** (a single canonical public URL `/` with `lastModified`/`changeFrequency`/
   `priority` — every other route is auth-gated so deliberately excluded). Both read the same
   `NEXT_PUBLIC_APP_URL || "https://tendhabit.com"` as `layout.tsx`'s `metadataBase`. **middleware.ts:**
   added `/robots.txt` + `/sitemap.xml` to the PUBLIC route matcher — their extensions aren't in the
   static-asset skip list, so without this Clerk's `auth.protect()` would 302 crawlers to sign-in
   (exactly the gotcha `/opengraph-image` hit in shift 10). Both render statically (○), zero client JS.
   **Verified end-to-end against `next start`** (not just cold-read): both fetched **HTTP 200** (proving
   the public-matcher works — not auth-redirected), correct content-types (`text/plain` / `application/
   xml`), valid sitemap `urlset` schema, robots allow/disallow correct. (The dev output showed
   `localhost:3000` — that's only the gitignored `.env.local` build placeholder inlining the
   `NEXT_PUBLIC_` var; the committed fallback is the real domain.) build GREEN, lint 0/5, test 99/99,
   1 commit. **This completes the site's technical SEO** (structured-data + OG + robots + sitemap).

0ap. ✅ **[SHIFT 55] Landing structured data (schema.org JSON-LD) — the search-rich-results lever.**
   The landing (the one file://-verifiable, conversion-critical surface) had ZERO structured data, so
   Google couldn't render a SoftwareApplication rich-card and — despite shift 10 building a real FAQ
   accordion — couldn't surface those Q&As as an FAQ rich snippet. A free SEO/conversion lever left on
   the floor. Added two server-rendered `<script type="application/ld+json">` blocks to `app/page.tsx`
   (right after the `<style>` inject, before the auth-null render path): (1) **SoftwareApplication**
   (name/`applicationCategory: HealthApplication`/OS/url + two `Offer`s — Free $0 and Tend+ $4.99,
   matching the on-page pricing card); (2) **FAQPage** built by mapping the existing `FAQS` array →
   Question/acceptedAnswer, with the inline `<b>`/`<i>` markup **stripped to plain text** so the JSON-LD
   mirrors the visible copy (Google's requirement) and carries no leaked HTML. Zero client JS (stays a
   static server component); `<` escaped to `<` so a future `</script>` in copy can't break out of
   the tag. **Verified end-to-end against `next start`** (not just cold-read): fetched the landing HTML,
   both blocks present, both parse as valid JSON, offers read Free=$0 / Tend+=$4.99, FAQPage has all 6
   questions with plain-text answers (`htmlInText: false`). build GREEN, lint 0/5, test 99/99, 1 commit.
   **This closes the last genuinely-verifiable landing lever** — the file:// surface is now conversion +
   SEO complete. (Rejected this shift: a `next/font` conversion of the Google-Fonts `<link>` — 94 literal
   `'Fraunces'`/`'DM Sans'` usages make it invasive + visually unverifiable here → deferred to a
   browser-capable shift, see NEXT SHIFT note.)

0ao. ✅ **[SHIFT 54] Atomic coin mutations — killed the non-atomic coins/inventory read-then-write
   lost-update race (§12 deferred #1).** This was parked for months as "needs a running DB → for
   Jonny," but (per shift 53's re-triage lesson) the DB was only needed to *observe* the race, not to
   *express the fix*. Both `/api/coins` (delta path) and `/api/inventory` (purchase) did
   `read balance → compute → write balance` in two round-trips, so two concurrent requests could read
   the same balance and clobber each other → a lost grant (coins vanish) or a lost spend (free item).
   Fix = do the mutation in a **single UPDATE statement**, which Postgres runs under a row lock and
   re-evaluates the WHERE against the freshest committed tuple, so writers serialize instead of racing.
   **`migration-009-atomic-coins.sql`** adds two SQL functions: `tend_increment_coins(clerk_id, delta)`
   (bounded `coins = greatest(0, coins + delta)`, the delta already clamped in the tested
   `lib/economy.ts`) and `tend_deduct_coins_if_afford(clerk_id, price)` (conditional
   `... - price WHERE coins >= price`, returns the new balance or NULL when unaffordable). Both routes
   call the RPC via `supabase.rpc()` and **GRACEFULLY FALL BACK to the existing read-then-write path if
   the function is absent** (RPC returns a Postgres error → fallback), so the app keeps working
   before/without the migration — exactly the migration-008 pattern (a SQL file Jonny runs). Coins
   response is fire-and-forget on the client (`apiSync`), inventory still returns `{coins}` on 201 — no
   contract change. Reasoning-verifiable (standard atomic SQL + fallback preserves current behaviour);
   build GREEN, lint 0/5, test 99/99, 1 commit. **§12 now down to ONE Jonny-only item** (the
   verify-subscription 10-session Stripe fallback — needs real volume). **NEW NEEDS EYES: run
   `migration-009` in Supabase to activate atomicity** (harmless until run; the app falls back).

0an. ✅ **[SHIFT 53] Two reasoning-verifiable API guards from the §12 deferred list — habit-ownership
   check on `urge-entries` + Stripe email-clobber stopped.** The frontier's remaining bug list was
   mostly "for Jonny (needs DB/Stripe)", but on a fresh read two of them were actually cold-readable
   guards — the *logic* is verifiable without a live DB, exactly like shift 14's inventory error-capture
   fix (which also touched a DB route but was reasoning-verified). (1) **IDOR-adjacent:** `urge-entries`
   POST inserted `{user_id: me, habit_id}` with `habit_id` straight from the request body and no
   ownership check → a client could log urge rows referencing another user's habit. Added the same
   ownership SELECT the `habits/[id]` route already uses (`.eq("id", habit_id).eq("user_id", userId)`)
   before the insert, returning 404 when the habit isn't the caller's. (2) **Data integrity:** the Stripe
   `checkout.session.completed` upsert set `email: "" ` when `customer_details.email` was absent — and
   since it upserts `onConflict: clerk_id`, that overwrote a real stored email with an empty string on
   any returning-customer checkout. Now `email` is only spread into the payload when Stripe actually
   provides one. build GREEN, lint 0/5, test 99/99, 1 commit. **§12 deferred list now down to the two
   that genuinely need a live DB/Stripe** (non-atomic coins/inventory race → Postgres RPC; the
   verify-subscription 10-session fallback) — left for Jonny/a keyed shift.

0am. ✅ **[SHIFT 52] Landing "evolution-journey" strip — SHOWS the #1 pillar (dragon art payoff),
   browser-verified via the file:// harness.** Executed the shift-51 pivot away from bug-hunting to the
   one sandbox-verifiable, conversion-critical surface. The landing already *told* the emotional payoff
   ("watch it evolve through five gorgeous stages") in words but never *showed* the dragon art growing
   up — the reason someone opens Tend every morning was invisible on the page that has to sell it. Added
   a new **"The payoff · Watch your dragon grow up"** section to `app/page.tsx` (between "How it works"
   and the feature bento): one species (id 16, Ancient Verdant — a nature legendary, on-brand green)
   rendered across ALL FIVE real stages — Egg → Hatchling → Whelp → Drake → Elder — with sizes growing
   left-to-right on a green→gold "growth path" line, each stage tagged with its **truthful day threshold**
   from `STAGE_THRESHOLDS [0,3,7,14,30]` → Day 1/3/7/14/30 (so the timeline is an honest promise, not
   marketing fiction), the Elder stage getting a golden legendary glow as the climax, and a never-shaming
   footer ("Slip a day? The journey just pauses — your dragon waits for you, it never resets to zero").
   **Pure CSS, zero client JS** (native `<img>` + keyframes) so the landing stays a static server
   component AND stays file://-verifiable; reduced-motion guarded. **Browser-verified**: rendered the
   real SSR page in headless Chromium at a 390px phone viewport — the section reads faithfully, **all
   five stages incl. the Elder climax fit in view** (first cut sized the row into a horizontal scroll
   that hid the payoff dragon → shrank sprites 40/50/62/74/92px so the whole journey is visible on a
   phone, scroll retained only as a safety net for sub-360px screens), zero console errors / zero failed
   requests. Proof: `scripts/shots/evo-journey.png`. build GREEN, lint 0/5, test 99/99, 1 commit.

0al. ✅ **[SHIFT 51] Cold-read bug hunt on the untouched analytics surfaces — FIXED 3 real client bugs
   (reasoning-verified, no DB/browser).** A fan-out hunter aimed at the surfaces prior shifts hadn't swept
   (constellation/Wrapped derivations, shop, gallery, onboarding→save handoff, settings persistence)
   found three genuine defects and cleared the rest. (1) **[mod] Insights "Completion by Day" counted
   days BEFORE a habit existed as misses.** `dayOfWeekData` iterated a fixed 30-day window and did
   `dayTotals[dayIdx]++` unconditionally per build habit — but the sibling consistency % right above it
   (`computeConsistency`) explicitly caps by habit age "so young habits aren't punished." A 3-day-old
   habit completed all 3 days read ~0% on every weekday (the ~27 pre-creation days were fake misses), and
   the Pro insight card then asserted "You tend to slip on **Tuesdays** — plan ahead" from pure noise.
   (2) **[mod] Insights (30-day) and Wrapped (60-day) disagreed on "best day of week."** Same concept,
   same rate formula, different windows → the two surfaces could confidently name contradictory best days
   for the same person. (3) **[low] Wrapped could render an `undefined` card and crash.** The card reel is
   dynamic (streak/hero/bestday/clean cards are conditional on stats); `idx` was clamped only inside `go`
   at tap time, so if the set shrank while open, `cards[idx]` was undefined → `current.bg` threw. **Fix:**
   extracted a single tested kernel `computeDayOfWeekRates` (lib/progress.ts) with the pre-creation guard
   baked in; constellation + Wrapped both delegate to it over the SAME 30-day window (resolves 1 + 2, one
   source of truth); added a defensive `Math.min(idx, cards.length-1)` clamp in Wrapped (3). 5 new kernel
   tests → `npm test` **94→99 green**, build GREEN, lint 0/5, 1 commit. **Cleared, not skipped** (hunter
   traced fully): onboarding→`handleOnboardingComplete` never drops `buildPick` + the 250-coin absolute
   write persists correctly; `settings-client` has no persistence logic (it lives in tend-app, hydration-
   guarded); shop lock/afford/owned + Pro-downgrade survival correct; gallery stage indexing consistent
   with Wrapped; progress/utils kernels internally consistent.

0aj. ✅ **[SHIFT 50] Cold-read bug hunt — FIXED 3 more real client-side bugs (reasoning-verified, no
   DB/browser).** A fan-out bug-hunter agent + hand-trace surfaced three genuine defects. (1) **Quit
   detail hero showed the wrong evolution stage.** The 140px hero creature used a raw
   `Math.min(4, Math.floor(cleanD/7))` while its own "Quitting · <label>" caption AND every other quit
   surface (garden row, gallery, share card) use `getStageForId` (STAGE_THRESHOLDS 0/3/7/14/30 + the
   self-healing `computeQuitStage` floor). At cleanD=3 the hero rendered an Egg while the label said
   Hatchling; at 7, Hatchling vs Whelp; and it ignored the post-relapse one-tier floor. Now delegates to
   `getStageForId` — the lone disagreeing surface is fixed. (2) **Simultaneous grace-milestone crossings
   dropped a gifted token, durably.** In `markAllGood`, each target habit's `checkMilestones()` fires in
   its own `setTimeout` closing over the SAME stale `streakFreezes` render snapshot, and the grant did a
   non-functional `setStreakFreezes({...streakFreezes,[id]:n})` → two build habits both crossing 7/21/60
   in one "all good" tap clobbered each other (last-write-wins), and `syncCoins` POSTs the full map to a
   route that REPLACES `streak_freezes` wholesale → the loss survived reload. Added a `streakFreezesRef`
   mirror + a `setGraceTokens()` merge helper; both write sites (checkMilestones, buyFreeze) now merge
   against the freshest map. (3) **Bounce-back banner promised coins it wouldn't deliver.** Welcome-back
   hardcoded `setBounceBackDay(1)` independent of the persisted `bb_day` ramp that actually drives the
   grant → a returning mid-ramp/completed user saw "Day 1 · +3 coins today" that never matched reality
   (or granted nothing). Now seeds the banner from `bb_day` (shows storedBB+1 = the day the grant effect
   reaches; -1 = done → no banner), and the "+N coins today" suffix renders only on real reward days (no
   more "+0 coins today" on interim days). build GREEN, lint 0/5, test 94/94, 1 commit.

0ak. ✅ **[SHIFT 50] Cold-read bug hunt, PASS 2 — FIXED 3 more real client-side bugs.** A second
   fan-out hunter (pointed at the celebration / milestone-coin / optimistic add-delete / relapse paths)
   surfaced three more. (1) **Delete "Undo" couldn't undo → permanent data loss** (med-high). `removeHabit`
   fired `DELETE /api/habits/{id}` immediately + unconditionally, while the Undo button only restored
   client React state — so after the server row (and its cascaded logs / quit_progress) was gone, tapping
   Undo re-showed the habit with its old id but no backing row, which then vanished for good on the next
   reload or log attempt (404 → syncError → router.refresh). Fixed: the destructive DELETE is now deferred
   past the 5s undo window via a per-id timer map (`pendingDeletesRef`); Undo clears the timer so the row
   is never touched, and letting the toast expire runs the delete normally. (2) **All-done celebration
   replayed on every reload + auto-fired for quit-only users** (low-med). `prevAllDoneRef` init'd to
   `false`, so any app opening ALREADY all-done (notably a pure-quit user — quit habits read "done" every
   day) was treated as a fresh false→true flip → confetti/shooting-star/banner on every reload, and the
   +10 grant fired with zero engagement (coins were day-gated but the FX weren't). The effect now adopts
   the initial `allDone` as its baseline on the first run and only celebrates genuine in-session flips.
   (3) **Parallel milestone grants clobbered each other's earned badges** (low). `checkMilestones` did
   `setEarned(ne)` with `ne = {...earned}` (a stale snapshot + whole-object write), so two habits crossing
   a milestone in the same tick (the passive quit loop, or `markAllGood`'s shared-snapshot timeouts) lost
   one habit's newly-earned keys. Now a functional merge of only the newly-earned keys, mirroring the
   coins/grace fixes. build GREEN, lint 0/5, test 94/94, 1 commit. (Traced clean + NOT reported: `addHabit`
   is server-first not optimistic; `buyItem`/`buyFreeze`/relapse `resetQuit` rollbacks are correct.)

0ai. ✅ **[SHIFT 49] Recovered + banked shift 16's orphaned timezone fix.** Shift 16 ran 8 min, made 4
   uncommitted edits, then died (0 commits); shifts 17–48 then all fast-failed on a monthly spend limit,
   so the work sat in the working tree. It's a real, complete bug fix: several client surfaces derived
   "today" from `new Date().toISOString().slice(0,10)` (a UTC date) while the whole app keys completions
   by the LOCAL date via `today()`/`daysAgo()`. West of UTC, the UTC key rolls to tomorrow every evening,
   so the app looked up a day with no completions — constellation's "on track today" count (0-of-N false
   negative), the morning check-in (re-showed the same evening; its dismiss persists last_checkin_date as
   the LOCAL date, which the UTC key never matched), and gratitude entries (stamped tomorrow). All now use
   `today()`; the server log route already accepts the client's local date (verified). Also a
   tap-to-dismiss backdrop + re-entrancy guard on the morning check-in. I restored the wellness affirmation
   to its lint-clean lazy initializer (shift 16's effect rewrite tripped `react-hooks/set-state-in-effect`
   to guard a hydration mismatch that can't occur — the hub only mounts client-side, never in SSR; that
   lint error is almost certainly why shift 16 never committed). build GREEN, lint 0/5, test 94/94.

0ah. ✅ **[SHIFT 49] Cold-read bug hunt — FIXED 4 real client-side bugs (no DB/browser needed).**
   (1) **Bounce-back coin faucet.** `bounceBackDay` was session React state (never persisted) while its
   date-gate `bb_date` was persistent → every reload reset the counter to 0 and the day-1 (+3) reward
   re-granted EVERY day forever (unbounded faucet), while the day-3 (+10)/day-7 (+25) tiers (needing one
   session alive across midnights) were unreachable. Persisted the counter + a "-1 = done, never again"
   sentinel in localStorage (same durable-reward-gate pattern shift 14 used) → advances once/day, pays out
   once ever. (2) **Quit habit read "not done" on its start/reset day.** `isHappy` compared the quitDate
   ISO timestamp to date-only `todayStr` with `quitDate <= todayStr`; an ISO string is lexically > its own
   date prefix, so the start day was excluded from the header count, blocked the all-done celebration, and
   rendered an unhappy creature on a clean day. Now compares date-only. (3) **Grace tokens gifted to quit
   habits** (7/21/60) were invisible + unusable (quit streaks never consume freezes; shield UI is
   build-only) → `checkMilestones` now takes `giftGrace`, false for quit. (4) **"All activity" heatmap**
   counted quit habits in its denominator, but they never log completions → intensity was permanently
   capped <100% for anyone with a quit habit; now build-habits only. build GREEN, lint 0/5, test 94/94,
   1 commit.

0ag. ✅ **[SHIFT 15] Cold-read bug hunt — FIXED the anti-soul relapse-penalty bug (§12 #2).** The quit
   dragon's stage was `getStage(best-ever) − stageDrops`, where `stageDrops` incremented on every relapse
   and was NEVER reset — so after ~4 slips the dragon pinned at Egg (stage 0) forever, even with a long
   current clean run + big best streak. The app punished a *struggling* user hardest: the exact opposite
   of Tend's "assumes the best in you / never shaming" soul. Made the product call (single-tier nudge that
   recovers, per the soul) and rebuilt `computeQuitStage` = `max(stage(current clean run), stage(best) − 1)`
   — a slip zeroes the current run so the dragon drops exactly one tier the instant you slip, heals back to
   peak as it rebuilds, and is never worse than one tier below best no matter how many slips. Deleted the
   `stageDrops` counter entirely (state/persistence/hydration; `stage_drops` column left dormant — GET/PUT
   already treat it optional → no migration). Unit-tested heal-back + idempotence: `npm test` 92→94, build
   GREEN, lint unchanged (0 errors / 5 intentional). See §10 decision. 1 feature commit.

0af. ✅ **[SHIFT 14] Cold-read bug hunt — FIXED a deterministic coin-loss bug + a silent-purchase-
   failure bug.** Two fan-out bug-hunter agents (API routes + monolith) plus a hand cold-read surfaced
   real defects. **Fixed this shift (both fully reasoning-verifiable, no DB/browser needed):**
   (1) **Milestone rewards were being silently truncated.** `/api/coins` clamps every delta to a max of
   `+100`, but the 60-day milestone grants **+200** and the 90-day grants **+500** (and coin-tiers reuse
   those values). So on a big milestone the client optimistically added the full 200/500 while the server
   only credited 100 → on the next reload (coins hydrate from server) the user **lost 100–400 coins**,
   right at the emotional-payoff moment. Root cause: the anti-abuse clamp was set below the largest
   legitimate single grant. Fixed by raising the positive bound above the max legit grant and extracting
   the clamp into a tiny pure `lib/economy.ts` (`clampCoinDelta` / `clampCoinTotal`) that the route
   delegates to, **unit-tested** so the 200/500 milestones can never be truncated again.
   (2) **Inventory purchase could hand out a free item.** `/api/inventory` POST discarded the result of
   the coin-deduction UPDATE — if that write failed, execution still inserted the item and returned 201
   `{coins: newCoins}`, so the user got the item, coins were never decremented, and the response reported
   success. Fixed: capture the deduction error and abort (500) before inserting.
   **Left for Jonny (can't DB-verify here, documented in §12 NEEDS EYES):** the coins + inventory
   read-then-write paths are still not atomic (concurrent requests can lose an update) — the real fix is
   a Postgres atomic-increment RPC + migration, deferred so we don't ship unrunnable SQL. Also low-sev:
   `urge-entries` POST doesn't verify habit ownership; Stripe webhook can overwrite email with `""`;
   `verify-subscription` fallback lists only 10 global sessions. Build GREEN, lint unchanged, `npm test`
   grew by the economy suite.

0ae. ✅ **[SHIFT 13] Locked the LAST untested reward/gameplay cluster — the quit-mode economy + the
   relapse-evolution math.** Shifts 11–12 regression-locked the streak/grace kernel + the
   consistency/milestone/coin-tier/synergy math, but left one corner: the **quit-a-bad-habit MODE's**
   numbers — the dollars a user has saved (a headline figure shown on the garden, in habit detail, and
   in the 7-day celebration) and how far their **dragon regresses when they slip** (the emotional
   gentle-not-shaming payoff). Both were buried inline in the 3000-line monolith and trusted only by
   cold-read (auth-gated → un-eyeballable here). Same extract-delegate-test pattern: new pure kernel
   **`src/lib/quit.ts`** (`computeCleanDays` / `computeMoneySaved` [cent-rounded] / `computeTotalSaved` /
   `computeQuitBest` [best-run preserved across a relapse] / `applyStageDrop` [penalty floored at the
   egg, shared by build + quit] / `computeQuitStage` [dragon stage off the *best-ever* clean run minus
   drops]); the monolith's `getCleanDays` / `totalSaved` / `resetQuit` / `getStageForId` (both branches)
   / the 7-day-celebration money now **delegate** to it (behaviour byte-identical, build-verified;
   removed the now-unused `daysBetween` import). **`src/lib/quit.test.ts` adds 24 cases**: clean-day
   counting incl. ISO-timestamp + future-date + same-day; cent rounding + FP-crumb + missing-cost NaN
   guards; total summing across skipped/started habits; best-preservation post-relapse; drop floored at
   the egg; best-vs-current stage selection + a heavy penalty knocking a grown dragon back to an egg.
   `npm test` **54 → 78 green**, build GREEN, lint unchanged (0 errors / 5 intentional), 1 feature commit.

0ad. ✅ **[SHIFT 12] Extended the regression net to the REWARD + ANALYTICS math (the other logic that
   can't be browser-verified here).** Shift 11 locked the streak/grace/best-streak kernel; shift 12
   applied the identical extract-delegate-test pattern to the three remaining progress-derived numbers
   that were buried inline and trusted only by cold-read: **per-habit consistency %** (was inline in
   `constellation.tsx`), **streak-milestone coin + free-grace-token grants** (`checkMilestones` in the
   monolith — this MUTATES coins + grace tokens, so correctness matters), and the **AA-style coin-tier
   unlocks** (`checkMilestoneCoins`). Also lifted the **habit-synergy** analytics rule (pairing +
   ≥3-day threshold + 0–1 strength ramp). New pure kernel **`src/lib/progress.ts`**
   (`computeConsistency` / `selectNewMilestones` / `selectNewCoinTiers` / `computeSynergies`,
   framework-free — callers pass their own milestone/tier lists + predicates), both components now
   **delegate** to it (behaviour identical, build-verified), and **`src/lib/progress.test.ts` adds 24
   cases**: young-habit fair-window consistency + cap + rounding; milestone coin summing + grace gifting
   at 7/21/60 + already-earned filtering; coin-tier build-vs-quit thresholds (sub-day tiers ignored for
   build, hours for quit) + highest-for-celebration; synergy pair enumeration + threshold + strength cap.
   `npm test` **30 → 54 green**, build GREEN, lint 0 errors / 5 intentional warnings, 2 commits. Same
   rationale as shift 11: this is the exact reward/analytics logic that can't be eyeballed in this
   sandbox — a high-value, browser-free correctness lever, and another safe step of the monolith
   decomposition.

0ac. ✅ **[SHIFT 11] First automated test suite — the core-loop math is now regression-locked.** The
   daily-loop math (consecutive streaks, "one slip never stings" grace-token bridging, historical best
   streak) is Tend's emotional core, yet it lives buried in the 3000-line `tend-app.tsx` monolith and has
   NEVER been browser-verifiable in this sandbox (auth-gated) — it was trusted purely by cold-read. Fixed
   the verifiable way: **extracted the pure math into `src/lib/streak.ts`** (`computeStreak` /
   `computeGraceActive` / `computeBestStreak`, decoupled from React + date formatting via an `isDone(n)`
   predicate, with a defensive lookback cap so corrupt data can't spin forever), had the monolith
   **delegate** its `getStreak`/`isGraceProtected`/`getBestStreak` to them (single tested source of truth;
   ~40 lines of inline logic deleted, behavior identical), and added a **vitest suite** (`src/lib/
   streak.test.ts` + `utils.test.ts`, **30 cases, all green**): clean runs, today-not-yet-done (no
   mid-day break), single/multi-gap grace bridging, never-bridge-today, grace-active detection,
   best-streak with dupes/gaps/month-boundaries, the Egg→Hatchling→Whelp→Drake→Elder `getStage`
   thresholds (the dragon-evolution payoff), and `daysBetween` quit-day math. Added `npm test` +
   vitest devDep (repo had ZERO tests before — this is the first regression net). Build GREEN, lint
   0 errors / 5 intentional warnings, `npm test` **30/30**. This is a rare high-value lever that needs
   no browser: it verifies correctness of the exact logic that can't be eyeballed here.

0aa. ✅ **[SHIFT 10] Landing conversion polish — added an objection-handling FAQ + fixed pricing-copy
   drift.** The landing is the one surface verifiable in this sandbox (server component → `file://`), and
   it's literally "what makes someone pay," so shift 10 strengthened it. **New FAQ section** (`app/page.tsx`,
   between Pricing and Final CTA): 6 warm, on-brand objection-handlers ("what if I miss a day?" → grace
   tokens/never-shaming, "is it really free?", "will it feel good on my phone?", "why is this different
   from apps I abandoned?" → dragons/emotional payoff, "what happens to my data?", "can I cancel
   anytime?"), built as a **pure-CSS `<details>`/`<summary>` accordion** (zero client JS — keeps the
   landing a static server component AND makes it `file://`-verifiable; accessible + `:focus-visible`
   ring by default; animated +/− mark). Research-backed (2026 SaaS/mobile conversion playbooks: 6–8
   concise FAQs, accordion on mobile, acknowledge-then-mitigate risk). Also **fixed the pricing double-
   statement**: `/pricing` card said "Save $20/year" while its toggle already said "Save 33%" (redundant
   + drifting phrasing) → card now shows the effective monthly "Just $3.33/mo, billed yearly" (a stronger
   annual nudge, no redundancy). Numbers left at $4.99/$39.99 (Stripe-tied; §13's $5.99 change still
   needs new Stripe price IDs → out of safe scope). Build GREEN, **browser-verified via the shift-9
   `file://` harness** (FAQ renders faithfully closed + expanded at 390px, animated +/− marks, zero
   console errors / zero failed requests — `scripts/shots/faq-open.png`).

0ab. ✅ **[SHIFT 10] OpenGraph/Twitter share card — the link now previews richly everywhere.** Sharing
   `tendhabit.com` in iMessage/Slack/Twitter/WhatsApp produced **no rich preview at all** (no OG tags) —
   a free sharing/conversion lever left on the floor. Fixed: (a) `layout.tsx` now exports `openGraph` +
   `twitter` (`summary_large_image`) metadata w/ `metadataBase`/siteName/locale + a shared TITLE/DESC;
   (b) new `app/opengraph-image.tsx` — a **dynamic 1200×630 card rendered by `next/og` (satori)**, which
   needs NO browser so it generates in this sandbox; runs on the Node runtime to read the hero dragon
   sprite (`dragon_33.png`) off disk + inline it as a data URI (warm cream garden, wordmark, "Grow
   habits. Hatch dragons." headline, tagline, never-shaming pill, dragon hero); (c) `middleware.ts` —
   added `/opengraph-image` to the PUBLIC route matcher (social crawlers fetch it unauthenticated → it
   was 404ing under Clerk's `auth.protect()`). **Browser-verified**: fetched the generated PNG from
   `next start` (200, image/png, 262KB) + eyeballed it — renders faithfully (`scripts/shots/og-card.png`).

0. ✅ **[SHIFT 9] Actually BROWSER-VERIFIED the app via a headless-Chromium `file://` pipeline —
   and pinned down the hard limit of what can be verified in this sandbox.** The prize this shift:
   **the real landing page has now been rendered in a browser and eyeballed** (see DoD "landing" ✅
   above + `scripts/shots/landing-fold.png`) — a DoD gate open since shift 1. **HARD FINDING (see §14 +
   §10): Chromium in this sandbox has ZERO HTTP egress** — loopback *and* external navigations fail
   (`ERR_NAME_NOT_RESOLVED`), though Bash/PowerShell can `curl`/`Invoke-WebRequest` the local server
   fine. So `next start` + Playwright-screenshot-the-live-site **is impossible here**; only `data:` /
   `file://` render. Workaround built (`scripts/`): fetch a route's SSR HTML via host `Invoke-WebRequest`,
   inline CSS + rewrite `/_next`+`/sprites` to `file://`, strip JS, screenshot offline. **Server
   components (the landing) reproduce FAITHFULLY** → landing signed off. **Client components render
   only pre-hydration markup** → verified `/preview`'s default **dragon gallery** (all 36 species, real
   sprites, `Creature` hero — the #1 pillar — `scripts/shots/preview-fold.png`), but tab-switching /
   animations / the other showcases need hydration JS → still need a networked browser (Jonny's machine).
   Also **verified all 72 dragon/egg sprite files exist** on disk (0 missing). Committed a reusable
   harness: `scripts/build-static-html.ps1` + `scripts/render-shot.mjs` + `scripts/README.md`.

0b. ✅ **[SHIFT 8] Public `/preview` showcase route — the browser-verification blocker now has a path.**
   DONE (commit `60923d9`). A **public, auth-free `/preview` page** mounts the real feature components
   with mock props + THEME so Jonny (or any successor, no Clerk keys needed) can eyeball the whole UI in
   a browser at `/preview` and finally sign off the 3 remaining DoD items. Showcases (a top tab switcher
   + light/dark toggle): dragon-art gallery (all 36 species, egg↔dragon toggle, real `Creature` hero),
   Onboarding reel, Wellness hub (+ its tools incl. Wind-down), Tend Wrapped story, You screen, Bottom
   nav, Breathing timer. **Verified by actually serving it** (`next start`): `/preview` → 200 with all
   36 dragon sprites, `/garden` → 404 (still correctly protected for a signed-out request). Reviewers:
   it's a dev/QA harness — imports no secrets, renders only fabricated state; ship behind the branch or
   delete before merge, nothing depends on it. **Also fixed a real footgun (see §10):** the repo had TWO
   Clerk middleware files; consolidated to one.

1. ✅ **[PHASE 0] Baseline green.** DONE (shift 1, commit `00cb4bc`): build + lint pass. See §6a.
2. ✅ **[PHASE 0] Honest audit.** DONE (shift 1). See §6b.
3. ✅ **[PHASE 0] Product spine + IA decided.** DONE (shift 1). See §10 (dragon-garden re-center;
   quitting stays a mode) and §10 IA proposal (mobile bottom nav: Garden · Insights · Wellness · You).
4. ✅ **[PHASE 1] Landing page rebuilt.** DONE (shift 1). New `app/page.tsx`: mobile-first, on-brand
   (dragon/egg/garden), living-dragon hero w/ real sprites, how-it-works, feature bento, dark dragon
   showcase strip, never-shaming promise, Free/Tend+ pricing, repeated CTAs + mobile sticky bar,
   safe-area + reduced-motion. Server component, zero client JS, CSS-only motion. Verified 200 + all
   content + sprites serve. Also fixed the missing Clerk middleware (see §10 / NEEDS EYES).
5. ✅ **[PHASE 1] Onboarding rebuilt.** DONE (shift 1, commit `bd0d761`). Grow-first, quitting
   optional, twilight-garden aesthetic, REAL egg/dragon sprites, staged plant+reveal. Kept the
   `onComplete(quitPick, buildPick)` contract so tend-app is untouched. **NOT yet visually verified in
   a browser** (it renders only behind Clerk auth, which needs real keys) — a successor with keys, or
   a temporary throwaway preview route, should eyeball the 4 steps + the reveal beat once.
6. ✅ **[PHASE 2] Mobile bottom-nav shell + Wellness/You screens.** DONE (shift 2, commit `bfb3b5c`).
   New `bottom-nav.tsx` (🌱 Garden · 📊 Insights · 🧘 Wellness · 🐉 You), thumb-first, safe-area,
   spring active states, haptic taps. Retired the slide-out hamburger menu + `menuOpen` state; its
   contents now live in the new **`you-screen.tsx`** (identity, stats, Tend+ upgrade/manage, Collection/
   Shop/Settings rows, dark toggle, season picker, sign out). New **`wellness-hub.tsx`** surfaces
   Breathe (shared timer) + 3 self-contained tools (5-4-3-2-1 grounding, 90s urge-surf wave, three-
   good-things gratitude) — also advances Phase 4. FAB lifted above nav. Build green, lint 0 errors.
   **NOT browser-verified** (renders behind Clerk auth) — a successor with keys should eyeball the nav +
   the 3 wellness tools + You screen once.
7. ✅ **[PHASE 2] Assumes-best one-tap check-in.** DONE (shift 2, commit `0481ef3`). Garden now shows a
   warm "Everything went well today" button that marks every remaining active build habit done in one
   tap (success haptic + press pulse); flipping all-done reuses the existing celebration (confetti,
   shooting star, banner, +10 coins). Copy assumes the best. Per-habit checkboxes stay for reporting a
   slip. *(Remaining core-loop polish to pick up: richer egg-progress-toward-hatch visualization on the
   garden, and the gentle time-of-day nudge is now slightly redundant with the one-tap button — consider
   suppressing it when the button shows.)*
8. ✅ **[PHASE 3] Deep analytics + Wrapped.** DONE (shift 3). (a) New `tend-wrapped.tsx` (commit
   `4ad21aa`): full-screen, tap-to-advance **Tend Wrapped** story (cover · total days · longest streak ·
   hero-dragon showcase · best day · clean-days/money-saved · dragons+coins · a persona identity moment ·
   final share card), Web Share + clipboard fallback, safe-area, haptics, zero-shame copy, graceful for
   new users. Launcher = an ✨ "Your Tend Story" banner atop the Insights tab. (b) Per-habit **30-day
   consistency bars** added to the Constellation scoreboard (commit `bb555be`, color-graded, fair
   window). The Insights page now covers heatmap + Wrapped + overview + weekly trend + consistency +
   day-of-week + synergies(correlations) + streak records + calm advice — genuinely deep. **NOT
   browser-verified** (auth-gated) — a successor with keys should eyeball the Wrapped reel + share once.
9. **[PHASE 4] Wellness suite — mostly banked (shift 2).** Breathe + grounding + urge-surf + gratitude
   now live in `wellness-hub.tsx`. Remaining: persist gratitude server-side (currently localStorage
   `tend_gratitude`) + surface it in Insights; consider a "calm/night mode" starlit terrarium.
10. ✅ **[PHASE 5] Grace token / "one slip never stings" UX.** DONE (shift 4, commits `859b099` +
    `9b4b501`). Found on cold read: streak-math existed (`getStreak` bridges gaps via `streakFreezes`)
    AND a `buyFreeze(hId)` fn (50 coins) existed — but `buyFreeze` was NEVER CALLED and the `hasFz` row
    var was computed but NEVER RENDERED. Fully dead. Now real: (a) `isGraceProtected(hId)` helper
    (streak-with-freeze > raw consecutive streak → a token is actively bridging a gap); (b) shield badge
    w/ count on the garden habit row (glows green + shadow when actively protecting); (c) a "Streak
    shield" card in the habit detail (see tokens, spend 50 coins, capped at 3, gentle "🛡️ a grace day
    is protecting your streak right now" moment); (d) buyFreeze capped at 3 + success haptic + "Grace
    token earned" copy; (e) **free** grace token gifted at 7-/21-/60-day streak milestones via
    `checkMilestones` (GRACE_MILESTONE_DAYS) so the landing's "milestone rewards → a grace token"
    promise is honest for non-payers. Build + lint green. NOT browser-verified (auth-gated).
12. ✅ **[PHASE 5] Pricing/monetization model doc.** DONE (shift 4). Wrote **§13 PRICING & MONETIZATION
    MODEL**: cost model (infra ≈$45/mo at 10k users → cost is a non-constraint; price for conversion),
    competitor benchmark table (Finch/Duolingo/Fabulous/Habitica/Streaks/Productive), recommended
    free/Tend+ split, and a price recommendation (monthly $5.99, annual $39.99 "save 44%", $79.99
    lifetime, 7-day annual trial). DoD "pricing modeled + documented" item satisfied. Executing the
    price change (new Stripe price IDs + lifetime/trial flow) is parked as an OPTIONAL follow-up below.
13. ✅ **[PHASE 6] PWA install prompt + on-brand manifest.** DONE (shift 4, commit `8751184`). New
    `install-prompt.tsx` — a gentle "Install Tend" card in the You screen: captures `beforeinstallprompt`
    (Android/Chrome → native install) and shows Share → Add-to-Home-Screen steps on iOS Safari; renders
    nothing when already standalone or dismissed. Fixed the off-brand `manifest.json` (was "Habit &
    Recovery Tracker / Quit bad habits") to the dragon-garden identity + maskable icons + categories.
14. **[PHASE 6 — IN PROGRESS] Remaining premium-polish pass.** Shift-6 advanced the a11y sub-item:
    ✅ (a) **keyboard-accessible tap targets** — new reusable `clickable()` helper in `lib/utils.ts`
    (role/tabIndex/aria-label/aria-checked + Enter+Space activation, spread alongside the existing
    onClick so mouse behaviour is untouched). Applied across the garden monolith's primary daily-loop
    surfaces: coin/shop pill, egg-callout dismiss, habit-row open-detail, streak-at-risk protect rows,
    colour-swatch pickers (`role="radio"` + aria-checked), paywall colour cards (commit `1642b05`).
    Verified you-screen/wellness-hub/bottom-nav already use real `<button>`s; paywall CTAs too (the
    remaining div-onClicks in tend-plus-screen/urge-support are modal backdrops — correct as-is).
    ✅ (b) **CONTRAST CHECK — DONE (shift 7)**, done rigorously *without* a browser by computing WCAG
    luminance ratios for every text/bg pair. Three commits: (1) `constants.ts` THEME map — light-theme
    subtext was near-invisible (`textSub` 1.98:1, `textMuted`/`label` 1.52:1); raised alphas so
    textSub/label ≥4.5:1 (AA) and textMuted ≥3:1 (AA-large) in **both** themes, both bg+card (~161
    subtext usages fixed in one change). (2) `app/page.tsx` landing — 10 failing colors incl. the hero
    subtitle (4.23:1) + final-CTA subtitle (3.48:1) → all ≥4.5:1 (kept the soft hierarchy; decorative
    footer wordmark left, logos are WCAG-exempt). (3) `/pricing` route — `text-slate-400` (2.56:1) on
    toggle labels + plan period → slate-500; `text-green-600` savings badge (3.30:1) → green-700;
    disabled button left (inactive controls exempt). All verified via a luminance script; build+lint
    green. STILL OPEN in this bucket (all optional/minor): per-view Insights skeletons + a minimal
    service worker (deliberately SKIPPED — a fetch-intercepting SW can't be safely shipped untested and
    the frontier itself marks it not-required-for-install; leave for a shift that can browser-verify).
15. ✅ **[PHASE 4] Wellness leftovers — DONE (shift 6).** (a) **Gratitude now persists server-side**
    (commit `be566c1`): migration-008 + schema add a `gratitude_entries` JSONB column on
    user_preferences; `/api/preferences` GET/PUT read+accept it; garden/page hydrates it into
    initialPreferences; tend-app holds `gratitudeLog` + a `saveGratitude()` (dedupes by day, caches to
    localStorage, syncs to server); wellness-hub Gratitude calls the parent handler (localStorage-only
    fallback preserved). **Surfaced in Insights** — a warm "Things you were grateful for" card in
    Constellation shows the 3 most-recent entries + days-logged. (b) **Calm/night "Wind down" mode**
    (commit `4cb39f1`): a 5th wellness tool — full-screen starlit evening space, a breathing moon-orb
    on a 12s in-hold-out-rest cadence (JS-synced phase text), deterministic twinkling starfield,
    rotating gentle lines, safe-area + aria-label + X/"Rest well" exits.
16. **[PHASE 5 — OPTIONAL] Execute the §13 price change.** Only if desired: new Stripe price IDs
    ($5.99/mo, $79.99 one-time lifetime), a 7-day trial on the annual price, and a `lifetime` entitlement
    branch alongside the existing sub check. NOT required for the DoD (model is documented in §13).
17. ✅ **[ongoing] Lint hygiene — 27 → 5 warnings (shift 6, commit `bf7dc9d`).** Removed dead code by
    hand (not `--fix`, which mangles the monolith's whitespace): unused imports, write-only dead state
    (`celebrationActive`, `creatureBounce`, urge-support `method`), unused destructured props, and two
    stale eslint-disable directives. Remaining 5 are intentional: 3 exhaustive-deps suppressions, a
    legacy-compat param (`_hexColor`), and Next's `no-page-custom-font` notice (would need a next/font
    refactor of the Fraunces/Nunito loads in `app/layout.tsx` — optional polish).

> HANDOFF TL;DR for the next shift: build is GREEN, **lint 0-errors / 5 warnings** (down from 27; the
> 5 left are intentional — see #17). DONE: front door (landing + onboarding), bottom-nav shell,
> Wellness + You screens, assumes-best one-tap check-in, **Phase 3 deep Insights + Tend Wrapped**
> (shift 3), grace-token UX + pricing model §13 + PWA install (shift 4), Phase 6 polish + branding
> audit (shift 5), **shift 6 = keyboard-a11y + wellness leftovers + lint** (a reusable `clickable()`
> helper made the garden's primary tap targets keyboard-operable (#14a), **gratitude now persists
> server-side + shows in Insights** (migration-008), a **"Wind down" calm/night mode** as a 5th
> wellness tool (#15 done), lint dead-code cleared (#17)), and **shift 7 = a full WCAG CONTRAST PASS**
> across all three surfaces — the THEME map (both themes), the landing, and /pricing — every text/bg
> pair fixed to ≥4.5:1 AA and *verified by computing luminance ratios, so no browser was needed*
> (light-theme subtext had been a near-invisible ~1.5–2:1). That closes the last meaningful pure-code
> polish lever (#14b). **§8 DoD now shows only 3 items un-checked**, and ALL THREE hinge on
> **browser-verification** rather than new code. **NEW in shift 8 (#0): a public `/preview` route now
> UNBLOCKS that** — it renders all the key UI (dragon gallery of 36 species, onboarding, wellness hub,
> Tend Wrapped, You screen, bottom nav, breathing timer) with mock props and NO Clerk auth, so the whole
> app can finally be eyeballed in a browser without keys. **NEXT SHIFT / JONNY: open `/preview`** (run
> `npm run build && npx next start`, or `next dev`, then visit `/preview`) and eyeball each tab on a
> phone viewport — that's the last real gate. The auth-gated *in-app* flows (real streaks/coins, grace
> badge, one-tap, egg-warming bars, gratitude Insights card) still want a real-keys pass eventually, but
> `/preview` covers the pure presentational verification. Shift 8 also **consolidated a duplicate Clerk
> middleware** (root vs `src/`) — see §10; shift 1's "missing middleware / prod-auth-broken" alarm was a
> FALSE ALARM and is now stood down. **Still open NEEDS EYES: migration-008 must be run in Supabase**
> before gratitude persists (localStorage fallback until then). Remaining pure-code levers are all
> minor/optional (per-view skeletons, a service worker [skip until browser-verifiable], the §13 price
> change). Read §6b audit + §10 decisions + §13 pricing first. `.env.local` note in NEEDS EYES still stands.
> **NEW in shift 10 (#0aa/#0ab): landing conversion polish, both browser-verified via the file:// harness.**
> (1) An **objection-handling FAQ** on the landing (6 warm Q&As: miss-a-day→grace tokens, really-free?,
> phone feel, why-different, data, cancel) built as a **pure-CSS `<details>` accordion** (zero JS → stays
> a static server component AND stays `file://`-verifiable). (2) **OpenGraph/Twitter share card** — the
> link had NO rich preview anywhere; now `layout.tsx` has full OG/twitter metadata + a **dynamic 1200×630
> `app/opengraph-image.tsx`** (next/og, renders with no browser, hero dragon inlined from disk), and
> `/opengraph-image` was added to the **public middleware matcher** (crawlers fetch it unauthenticated).
> (3) Fixed `/pricing` savings double-statement → effective-monthly nudge. Proof shots:
> `scripts/shots/faq-open.png` + `scripts/shots/og-card.png`. The landing (the one sandbox-verifiable
> surface) is now conversion-complete; remaining DoD gates are still the auth-gated in-app eyeball on
> Jonny's machine. Note: shift 10 `npm install playwright --no-save`'d to screenshot — it's NOT in
> package.json (browser binary is cached from shift 9's `npx playwright install chromium`).
> **NEW in shift 12 (#0ad): extended the regression net to the reward + analytics math.** Same
> extract-delegate-test pattern as shift 11, now applied to the logic that MUTATES coins + grace tokens
> (which cold-reading can't verify): new pure `src/lib/progress.ts` (`computeConsistency` /
> `selectNewMilestones` / `selectNewCoinTiers` / `computeSynergies`), constellation + the tend-app
> monolith delegate to it, and `progress.test.ts` adds 24 cases → **`npm test` 30 → 54 green**. Build
> GREEN, lint unchanged (0 errors / 5 intentional). Remaining pure-code levers are now genuinely thin
> (per-view skeletons, garden night re-theme, the §13/#16 Stripe price change) — the meaningful
> un-checked DoD items all still hinge on a real-device / networked-browser eyeball on Jonny's machine
> (see §14 for why that can't happen in this sandbox).

> Keep this queue to ~3–6 concrete next actions. When you finish one, replace it with what you learned
> should come next. Always leave the queue actionable for a cold-start successor.

---

## 10. DECISIONS (append-only log of real choices + rationale)

- *(setup)* **Name is Tend, not Grove.** Brand-soul = "tend your garden / dragons / habits / health."
  Warm, nurturing, the anti-productivity-tracker. Everything inherits this tone.
- *(setup)* **Branch isolation over staging-only.** Kira was staging-only (real users). Tend has zero
  users, so we relax to: work on `night-train`, never push/deploy; Jonny merges to main to ship.
- *(setup)* **Ambition = maximum.** Deep analytics, real wellness tools, premium mobile polish are
  first-class deliverables, not nice-to-haves.
- *(shift 1)* **Re-center on the dragon-egg garden; keep quitting as a first-class MODE.** The app had
  drifted into a quit/recovery tracker that buries the warm soul. Rationale: the dragon art + assumes-
  best daily tend are the emotional differentiator and the reason someone opens it every morning and
  pays; quit-support is a powerful *use case within* that garden (a "break a bad loop" egg), not the
  headline. Every new surface leads with tend/grow/hatch warmth; recovery tools live inside it.
- *(shift 1)* **Proposed IA / mobile bottom nav (4 tabs, thumb-first):**
  **🌱 Garden** (home: your eggs/dragons, today's assumes-best check-in, streaks/coins) ·
  **📊 Insights** (deep analytics + Wrapped) · **🧘 Wellness** (breathing + grounding/reframe/urge-surf/
  gratitude/calm) · **🐉 You** (profile, collection/gallery, shop, settings, Tend+). Replaces the
  current slide-out-menu + in-component page state. Build the nav shell in Phase 2; don't block Phase 1
  landing on it. *(Revisit tab set as features land.)*
- *(shift 1)* **CRITICAL FIX — added the missing Clerk middleware (`src/middleware.ts`).** The repo
  had NO middleware/proxy file anywhere (not in tree or git history). Clerk v6 App Router *requires*
  `clerkMiddleware()` — without it every server-side `auth()` throws "clerkMiddleware() was not run"
  and every page 500s. Verified: landing was 500 → 200 after adding it. This almost certainly means
  the **live site's auth was broken too** (or main has a middleware that never made it here). FLAGGED
  in NEEDS EYES. Public routes: `/`, sign-in, sign-up, webhooks; everything else `auth.protect()`.
- *(shift 1)* **Build without real secrets via a gitignored `.env.local` of dummy placeholders.**
  Clerk needs a publishable key (public) to prerender; Stripe/Supabase get obvious placeholders and are
  lazy so never hit at build. Keeps `npm run build` green for every successor shift without any real
  secret ever entering the tree. Real keys stay in Vercel. See NEEDS EYES.
- *(shift 1)* **Landing = warm light garden; onboarding = warm twilight garden.** Researched 2026
  app-landing conversion + Finch/Forest/Fabulous. Principles applied: lead with the *character/art*
  (dragons are the emotional hook), hero answers "why care?" in one line, CTAs repeated + a mobile
  thumb-zone sticky bar, and — since Tend has ZERO users — **no fabricated testimonials**; trust is
  built with honest signals ("no shame, ever / your data is yours / beautiful on mobile") and the
  never-shaming promise near the pricing. Landing is a **server component (zero client JS, CSS-only
  motion)** for fast mobile LCP. If a successor adds interactivity, keep the static-first spirit.
- *(shift 1)* **Grace token / "one slip never stings" is now a public promise** (stated on the landing
  + onboarding). There's already `streak_freezes` in the schema/profile — Phase 2/5 should make the
  grace-token UX real and tie it to coins so we don't over-promise. (Promoted from SURPRISE-ME.)
- *(shift 2)* **Bottom nav is now the primary navigation; slide-out hamburger menu retired.** Built
  `bottom-nav.tsx` (Garden/Insights/Wellness/You) + moved all menu contents into a real `you-screen.tsx`.
  Rationale: a thumb-first bottom bar is the mobile-native pattern (the product IS a phone app); a
  slide-out menu buried nav and wasted the thumb zone. The nav is presentational + THEME-driven so it's
  reusable as we decompose the monolith. Two new `page` values (`wellness`, `you`) added to the existing
  in-component page state — deliberately did NOT rip out the page-state machine yet (too risky in one
  shift); the nav rides on top of it. Gallery + Shop map under the "You" tab; detail maps under Garden.
- *(shift 2)* **Wellness is a real hub, not just breathing.** `wellness-hub.tsx` ships 4 tools: Breathe
  (reuses the shared `BreathingTimer`), 90s urge-surf "ride the wave" timer, 5-4-3-2-1 grounding, and a
  three-good-things gratitude ritual (saved to localStorage `tend_gratitude`). All self-contained,
  uplifting, non-clinical — banks a big chunk of Phase 4 early while giving the Wellness tab real
  substance from day one. Future: persist gratitude server-side + surface it in Insights.
- *(shift 2)* **Assumes-best = an ADD, not a data-model inversion.** The soul says "each day defaults to
  you did well; you only report slips." The built model is opt-in (tap each habit). Fully inverting to
  default-done-unless-slip is deep + risky (streaks, milestones, quit logic all assume explicit logs), so
  instead we added a one-tap "Everything went well today" button that batch-marks all remaining build
  habits done. It delivers the assumes-best *feeling* and the one-tap convenience without touching the
  logging model or the server contract. A future shift can revisit a true default-done model if desired.
- *(shift 3)* **Tend Wrapped is a self-contained overlay, computed client-side from existing helpers.**
  `tend-wrapped.tsx` takes the same helper props Constellation already uses (`isDone/getBestStreak/
  getTotal/getCleanDays/getStage` + `coins`/`totalSaved`) and derives the whole story reel in one
  `useMemo` — no new API, no schema change, no server round-trip. Rationale: keep it additive + low-risk
  on top of the monolith, works offline, and every stat is already trusted app state. Researched Spotify
  Wrapped 2025 first (story cards, big personal numbers, an identity/"club" moment, a share-optimized
  final card) and mirrored that shape in a warm garden aesthetic. Deliberately titled "Your Tend Story"
  (not "2026 Wrapped") so it works with ANY amount of history, and every card degrades gracefully for a
  brand-new user (encouraging copy instead of empty zeros). The dragon art is the emotional centerpiece:
  the most-tended habit's real `Creature` sprite is the hero on the cover, showcase, and share card.
- *(shift 3)* **Consistency % = a fair, capped-window rate, not lifetime.** The scoreboard bar uses
  completions over `min(30, habitAgeInDays)` so a 3-day-old habit at 3/3 reads 100%, not 10% — avoids
  punishing young habits with a fixed 30-day denominator. Color-graded (green ≥70 / amber ≥40 / red).
- *(shift 6)* **A11y via a `clickable()` helper, not a wholesale button rewrite.** The monolith is
  inline-style + div-onClick heavy; converting every tap div to a real `<button>` would fight the
  layout and risk regressions. Instead a small `clickable(onActivate, opts)` util returns the a11y
  props (role/tabIndex/aria-label/aria-checked + Enter/Space) to spread *alongside* the existing
  onClick — mouse behaviour untouched, keyboard/SR support added. Applied to primary daily-loop
  surfaces only; deliberately left redundant duplicate tab stops (status icon + sprite that also open
  detail) mouse-only so keyboard users get one clean stop per row (the labelled name div).
- *(shift 6)* **Gratitude persists via the existing `user_preferences` row, not a new table.** Added a
  `gratitude_entries` JSONB column (migration-008) rather than a `gratitude` table — it's small,
  per-user, append-only, capped to 60, and rides the preferences GET/PUT + hydration path already in
  place. tend-app owns the state + sync (dedupe-by-day) and passes a `saveGratitude` handler down;
  wellness-hub keeps a localStorage-only fallback when no handler is wired, so it degrades gracefully
  offline and before the migration is run. Surfaced read-only in Insights (Constellation card).
- *(shift 8)* **Consolidated the duplicate Clerk middleware; shift 1's "missing middleware" alarm was
  a FALSE ALARM.** Discovered while making `/preview` public that the repo had TWO middleware files: the
  original **repo-root `middleware.ts`** (present since the very first commit `24c72b9`) and a redundant
  **`src/middleware.ts`** that shift 1 added believing none existed. Next 16 uses the ROOT file (it even
  labels it `proxy.ts` in dev logs) and ignores the `src/` one — so shift 1's edit path was silently
  dead (proven: adding `/preview` to `src/middleware.ts` had zero runtime effect; Clerk still ran
  `auth.protect()` and 404'd it). Fix: made the root file the single documented source of truth (added
  `/preview` to its public matcher), **deleted `src/middleware.ts`**. **Corollary for NEEDS EYES:**
  production auth was NEVER broken for lack of middleware — the root middleware shipped in commit 1 and
  is almost certainly what `origin/main`/Vercel runs. The shift-1 alarm can be stood down.
- *(shift 9)* **Browser verification is possible here ONLY via `file://` for server-rendered
  surfaces; the live interactive app cannot be auto-screenshotted in this sandbox.** Established
  empirically (§14): headless Chromium has no HTTP egress in the night-train environment — every
  `http(s)://` navigation fails (`ERR_NAME_NOT_RESOLVED`), including `127.0.0.1`, even though the shell
  tools reach the local server fine; only `data:`/`file://` render. So the shift-8 plan ("open `/preview`
  in a browser to sign off") can't be executed *inside a shift* — but a successor need not keep trying:
  the correct move is (a) verify server-component surfaces (the landing) via the committed `file://`
  pipeline, done this shift, and (b) leave the interactive in-app eyeball to Jonny on a networked machine.
  Rationale for keeping the harness anyway: it's the honest, reproducible way to verify what CAN be
  verified offline, and it runs the *simple* way (point Playwright at the live URL) on any normal machine.
- *(shift 8)* **`/preview` is a QA harness, not a product surface.** Built it as a single client page
  that switches between showcases with mock props rather than threading real app state, so it stays
  decoupled from the monolith and can't leak data. It's public (in the middleware matcher) purely so it
  renders without Clerk keys. Ship-behind-branch or delete-before-merge — reviewer's call.
- *(shift 6)* **Calm/night mode = a self-contained wellness tool, not a global palette shift.** Rather
  than re-theming the whole garden into a starlit terrarium (deep + risky in the monolith), "Wind
  down" is a full-screen overlay launched from the Wellness hub — a breathing moon-orb + starfield +
  gentle lines, all client-only/CSS/JS-timer, no DB, no theme surgery. Delivers the calm-evening
  feeling with near-zero blast radius. A future shift can still theme the garden itself if desired.
- *(shift 10)* **The landing FAQ is a pure-CSS `<details>` accordion, not a JS component.** The landing
  is deliberately a zero-client-JS server component (fast LCP + `file://`-verifiable in this sandbox).
  A normal React accordion would break both, so the FAQ uses native `<details>`/`<summary>` with a
  CSS-animated +/− mark — accessible + keyboard-operable by default, no hydration. Keeps the whole
  landing static and lets shift 10 actually *see* it render offline (both closed and expanded states).
- *(shift 10)* **OG share card is a dynamic `next/og` (satori) image, rendered server-side — chosen
  precisely because it needs NO browser** (so it generates fine in this HTTP-egress-firewalled sandbox,
  unlike a screenshot-based card). It runs on the **Node runtime** so it can `fs.readFile` the hero
  dragon sprite and inline it as a base64 data URI (satori can't fetch `/public` over HTTP). Uses
  satori's default font (no custom-font fetch → no network dependency → robust). Verified by fetching
  the generated PNG from `next start` and eyeballing it. **Corollary:** `/opengraph-image` had to be
  added to the **public** middleware matcher — social crawlers (Twitter/Facebook/Slack bots) fetch OG
  images unauthenticated, so leaving it under `auth.protect()` 404'd the card (confirmed empirically).
- *(shift 10)* **Displayed prices left at $4.99/$39.99 (NOT bumped to §13's $5.99).** The numbers are
  tied to real Stripe price IDs; changing the copy ahead of creating new Stripe prices would mislead
  buyers and break checkout parity. §13's price change stays an explicit Stripe-config follow-up (#16).
  Shift 10 only removed the *drift* (the `/pricing` card double-stated "Save 33%" + "Save $20/year" →
  now shows the effective monthly "$3.33/mo, billed yearly", a stronger, non-redundant annual nudge).
- *(shift 11)* **Test the core-loop math by extraction, not by mocking React.** The streak/grace/
  best-streak logic was inline `useCallback`s closing over component state — untestable without a
  browser or a heavy render harness, and it's the ONE part of the daily loop that can't be eyeballed in
  this sandbox (auth-gated). Chose to lift the *pure* kernel into `src/lib/streak.ts` behind an
  `isDone(n)` predicate (no React, no `Date` coupling) and have the monolith delegate to it, rather than
  trying to unit-test the component. Rationale: (a) it makes the emotional core verifiable *here*, with
  no browser — a rare high-value lever this late in the mission; (b) it's a first, safe step of the
  long-planned monolith decomposition (behavior is byte-identical, build-verified); (c) it gives Jonny a
  green `npm test` as concrete proof the streak/grace/dragon-evolution math is correct, which no amount
  of cold-reading could. Kept the `Math.max(historical, currentStreak)` composition and all quit-habit
  branches in the component (they need live state) — only the pure kernel moved. Added vitest as the
  runner (zero-config, TS-native); the repo had no test tooling at all before.

- *(shift 12)* **`lib/progress.ts` is framework-free by passing lists + predicates, not importing them.**
  The reward/analytics kernels deliberately do NOT `import { MILESTONES }` / `MILESTONE_COINS` (which live
  in a client component) — callers pass their milestone/tier arrays + an `isDone(n)`/`coCountOf(i,j)`
  predicate. Rationale: keeps `progress.ts` pure + import-cycle-free + testable with tiny fixture data
  (the tests mirror the real MILESTONES/COIN_TIERS locally), exactly like `streak.ts`'s `isDone`
  predicate. The delegation is behaviour-identical — the components still own all side effects (toasts,
  haptics, `setCoins`/`setStreakFreezes`, celebration); only the pure "which/how-much" decision moved.
- *(shift 13)* **The pure-code test lever is now exhausted; stop extracting math for coverage's sake.**
  `lib/quit.ts` closed the last untested reward/gameplay cluster (quit-economy + relapse-evolution). With
  streak/grace/best (shift 11) + consistency/milestone/coin-tier/synergy (shift 12) + quit (shift 13) all
  regression-locked at 78 green, there is no remaining *high-value* buried-math target — further extraction
  would be shuffling already-simple glue (formatters, state setters) for a green-number vanity metric, not
  correctness insurance. A future shift's better moves: a fresh cold read to find + FIX a real latent bug
  (not just cover one), or a server-component/`file://`-verifiable UX improvement. Recorded here so a
  successor doesn't reflexively continue the pattern past its point of value.
- *(shift 15)* **Relapse penalty = a gentle, self-healing one-tier dip, NOT an accumulating counter.**
  Made the product call that §12 bug #2 flagged (permanent-cumulative vs recovering). Chose recovering,
  because the soul is explicit: assumes-best, never-shaming, "gently delays the egg's hatch." The old
  model subtracted an ever-growing `stageDrops` from the stage and never reset it → the dragon pinned at
  Egg forever after ~4 slips (the app literally punished a struggling user hardest — the exact opposite
  of the brand). New model needs no mutable state: `computeQuitStage = max(stage(current clean run),
  stage(best-ever) − 1)`. A slip zeroes the current run (via `resetQuit`) so the dragon drops exactly one
  tier the instant you slip; it heals back to peak as the run rebuilds; and it's never worse than one
  tier below your best no matter how many times you slip. Deleted the `stageDrops` state/persistence/
  hydration entirely (the `stage_drops` DB column is left dormant — GET/PUT already treat it as optional,
  so no migration is needed and old data simply stops being read). Unit-tested the heal-back + idempotence
  in `quit.test.ts` (92→94). This also proves shift 13's "pure-code test lever exhausted" note was about
  *coverage-for-coverage's-sake* — extracting math to FIX a real behavioural bug is still high-value.

- *(shift 57)* **"Cold-read vein exhausted" was surface-scoped, not codebase-wide — a successor CAN
  still hunt, just aim at explicitly-unswept files.** Shifts 49–53 concluded the bug hunt was done, and
  shifts 54–56 respected that and pivoted to SEO. But those hunts had only swept the reward/celebration/
  optimistic-update/analytics client code + the coins/inventory/stripe/urge routes. Shift 57 pointed two
  hunters at the never-touched surfaces — `migrate-local-data`, `ensure-profile`, the log/relapse/clerk-
  webhook routes, and 10 component internals — and found 5 genuine bugs (heatmap noon-cell, migration
  silent-data-loss, ensureProfile Pro-clobber, clerk email-clobber, relapse validation) plus 2 real
  deferred ones. LESSON for successors: before declaring a codebase clean, list which FILES were actually
  read; "exhausted" claims inherited from a prior shift are only as broad as that shift's file set. The
  honest move when the landing/SEO levers are done is a fresh hunt on unswept files — NOT manufacturing
  churn, but also NOT rubber-stamping "mature" on the strength of someone else's partial sweep.
- *(shift 53)* **Not every "deferred" bug is actually DB-gated — re-triage before punting.** Shift 14
  lumped four bugs into §12 as "all need a running DB/Stripe → for Jonny," and shifts since treated the
  whole list as untouchable in this sandbox. On a fresh read two of them (urge-entries ownership, Stripe
  email-clobber) were plain guard logic whose *correctness is verifiable by reading* — the DB dependency
  was for observing the race/volume, not for reasoning about the guard. Fixed both. The lesson recorded
  for successors: when a bug is parked as "needs a live service," check whether it's the *fix* that needs
  the service or just the *repro* — a guard/validation fix (return 404 if not owned, don't write "") is
  usually cold-verifiable and shouldn't wait for Jonny. What genuinely stays deferred: the atomicity
  race (needs an atomic SQL RPC + migration to even express the fix) and the verify-subscription volume
  fallback (the correct fix — look up by metadata — needs real Stripe data to confirm it resolves).

- *(shift 58)* **The log route persists milestones keyed by the RAW consecutive streak — the best metric
  the server can compute — not total-days-logged, and not the client's grace-aware streak.** Deferred bug
  #5 asked for a design decision: drive milestones purely client-side, or teach the server about grace.
  Rejected both extremes. Pure-client would drop the cross-device badge persistence the disciplined user
  currently gets (perfect streak → total-days == streak → the old code happened to key it right). Teaching
  the server about grace is impossible (grace tokens are client-only React/localStorage state the server
  never sees). Chose the middle: the server derives the raw consecutive run from `habit_logs` and keys the
  milestone row on THAT. Rationale: (a) it eliminates the actual bug (a sporadic logger's total-days
  crossing a milestone number no longer writes a phantom `streak:N` row that false-suppresses the real
  celebration); (b) it strictly preserves the good case (a genuine consecutive N-day run still persists the
  badge cross-device); (c) the only thing it can't persist is a milestone that a *grace token* bridged —
  and that already falls to the client's durable localStorage `granted` dedup (so it won't re-celebrate; it
  just won't light the badge on a *different* device — a rare, minor edge). The streak math is a pure,
  tz-independent, unit-tested helper (`computeStreakForDate`), so the fix is fully reasoning-verifiable
  even though the DB round-trip can't be exercised in this sandbox — the insert/dedup path is structurally
  unchanged; only the `value` it computes changed from `count` to the consecutive streak.

- *(shift 59)* **`syncError` = hard reload, not `router.refresh()`; and don't touch load-bearing timer
  identity.** Two calls this shift. (1) The failed-save recovery path used `router.refresh()`, which in
  this architecture is a no-op: TendApp holds every server value in `useState(initial…)` seeded once at
  mount and never reconciles props→state, so a soft server re-render's fresh props are silently dropped
  and the wrong optimistic state persists. The clean options were (a) revert the specific optimistic
  mutation per-caller (invasive — 6 call sites, each with different rollback shape) or (b) a hard
  `window.location.reload()`. Chose (b): it's the error path (rare), it genuinely restores server truth,
  and it matches the toast's "bringing you back in sync" promise. A future monolith decomposition could
  make (a) clean, but reload is correct and minimal today. (2) The components hunter flagged that the
  toast + milestone-coin auto-dismiss `useEffect(…, [onDone])` timers reset on every parent re-render
  because they're passed inline `() => setX(null)` callbacks (fresh identity each render). This is
  BENIGN today (the only sub-dismiss-interval re-render source, the 10s `liveNow` tick, is slower than
  the 2.5–5s timers) AND the toast's unstable identity is load-bearing — it's what makes a rapid message
  REPLACE correctly restart the dismiss timer (the toasts have no `key`). Memoizing the callback to "fix"
  the reset would truncate the undo window on rapid replacement. So this was deliberately left as-is and
  documented, not churned. Lesson reaffirmed (shift 57/58 line): a hunter finding ≠ an automatic fix —
  weigh whether the "fix" regresses a working behaviour.

- *(shift 61)* **Webhooks now fail LOUD (return 5xx) so the provider retries; error-swallowing was the
  real bug, not the writes.** The shift-53/57 lessons converge here: the fix for a payment/auth-path
  reliability bug was reasoning-verifiable without a live Stripe/Clerk. Two calls worth recording. (1)
  **Return non-2xx on any webhook DB-write failure.** Both webhooks `await`ed their upserts but ignored
  `{error}` and unconditionally returned 200 → Stripe/svix consider the event delivered and never retry,
  so a transient blip during `checkout.session.completed` permanently strands a paying user on free. This
  is a one-line-per-write guard (throw on error → catch → 500) but it's the single highest-value fix on
  the money path. Its corollary FORCED handling the `profiles.email NOT NULL` insert trap (a fail-loud
  webhook would poison-retry forever on a genuinely email-less event): UPDATE-first (email omitted → no
  clobber, preserving shift-53) then INSERT-if-missing with `email || ""` (the ensureProfile placeholder).
  (2) **Don't downgrade to free on `past_due`.** Immediately yanking Pro on the first failed renewal
  charge — while Stripe is still retrying during dunning and may recover — is both a bug and anti-soul
  (punishing a recoverable blip). Keep Pro through active/trialing/past_due; only terminal states (and the
  explicit subscription.deleted) drop to free. (3) **Onboarding: gate the done-flag on real success.** A
  side-effecting completion (create habits) that commits its "done" flag before confirming the side effect
  succeeded is a data-loss pattern — the flag then permanently hides the retry path. addHabit already
  returned its ok-ness implicitly; surfacing it + gating the flag is the fix, plus a re-entrancy guard for
  the non-idempotent create. **Meta-lesson reaffirmed (shift 57/60):** "cold-read vein exhausted" is
  ALWAYS surface-scoped — shift 60 named these exact surfaces as unswept and each held a real bug.
- *(shift 60)* **Lifetime total = server exact-count + client pre-window offset, not a wider log ship.**
  The 90-day `logs` window was serving double duty: heatmap/streak (needs recent dated rows) AND the
  client's lifetime `getTotal`/dragon-stage (needs the full cumulative count). Three fixes were possible:
  (a) drop the window and ship ALL logs — rejected, the payload grows unboundedly with tenure for no
  heatmap benefit; (b) ship a wider window — rejected, just moves the cliff; (c) keep the 90-day window
  for dates but ship a separate TRUE lifetime count. Chose (c). The server count uses `{count:"exact",
  head:true}` per habit (a handful of habits) specifically to dodge Supabase's 1000-row default select cap
  — a `select("habit_id")`-and-count would silently undercount a >1000-log power user, reintroducing the
  bug in miniature. The client derives an immutable per-habit offset = `initial.totalDays −
  initial.logs.length` (the count of logs older than the window, which never changes in-session) and adds
  it to the live windowed `logs.length`; this keeps today's optimistic check/uncheck exact (today is
  always in the window, so it's counted once via `logs`, never via the offset) and needs no threading of a
  new mutable field through the 4 optimistic-update sites. The server also floors `totalDays` at the
  windowed count and the client floors the offset at 0, so a transient count-query error degrades to the
  OLD windowed behaviour (self-healing) rather than a spurious 0 / de-evolution. **Lesson:** the
  "cold-read vein is thin" claim inherited from shifts 49–59 was again SURFACE-scoped (client + API) — the
  server-hydration path was never a hunt focus and held the single most emotionally-damaging bug in the
  app (the dragon art, the #1 pillar, collapsing to an egg on return). Confirms the shift-57 rule: before
  trusting "well-swept," enumerate which FILES were actually read.

## 11. SURPRISE-ME IDEAS (park bold ideas here; promote the best into the frontier)

- **Egg incubation as ambient progress:** the egg visibly "warms"/cracks a little each day you tend it,
  so opening the app shows tangible daily change even before a hatch.
- **Dragon personality from your habits:** the species/color you hatch reflects the habit type
  (calm/water for sleep, fire for fitness, etc.) — collectible + meaningful.
- **"Tend Wrapped" as a share-card export** (the constellation/share-card components hint this exists).
- ~~**Calm mode / night mode** starlit wind-down~~ ✅ SHIPPED shift 6 as the "Wind down" wellness tool
  (a full-screen overlay, not a garden re-theme — see §10). A garden-wide night re-theme is still open.
- **Streak insurance / grace token** earned by coins — protects against one slip so it never feels
  punishing (retention gold, monetizable).
- **Widget-style "today" hero** you could screenshot to a phone home screen.

## 12. NEEDS EYES (blockers / decisions for Jonny — keep short)

- **✅ FIXED (shift 61) — `garden/page.tsx` critical read errors now surface a retryable error state.**
  Was: all six data-fetch calls destructured only `{ data }`, so a TRANSIENT failure on **habits**
  rendered a false "you have zero habits" garden and on **logs** rendered every streak at 0 — alarming
  ("my habits vanished / streaks reset") though self-healing. Now the two CRITICAL reads (habits, logs)
  throw on error, caught by a new `(app)/garden/error.tsx` boundary — a warm "Your garden needs a moment"
  screen that reassures the user their data is safe and offers a one-tap retry (`reset()` re-runs the
  server component, which self-heals the transient failure). The remaining four reads (milestones/quit/
  inventory/prefs) degrade acceptably on a blip (missing celebrations badges / cosmetics), so they're left
  soft rather than turning every minor blip into a full-page error — the two that render *alarmingly wrong*
  core data are the ones that now fail loud + recoverable.

- **✅ FIXED (shift 58) — DEFERRED BUG #5, the log-route milestone keying.** Was: the `habits/[id]/log`
  route inserted a `milestone_type:"streak", value: totalDays` row where `totalDays = count(habit_logs)`
  (distinct days EVER logged), which rehydrates into the client's `earned` map (`garden/page.tsx`) that
  both dedups celebrations AND lights the detail badge grid — so a sporadic logger reaching 7 *total*
  days (never a run) got a phantom `streak:7` row that SUPPRESSED the real 7-day-streak celebration.
  **Fix (design call, see §10 shift 58):** the server can't see grace tokens, so it now records the best
  RAW consecutive streak it can derive from the log dates via a new tested pure helper
  `computeStreakForDate` (lib/streak.ts, delegating to the existing `computeStreak` over a tz-independent
  UTC-noon date walk). This kills the false-suppression while preserving the perfect-streak case
  (streak == total-days → still persists the badge cross-device); grace-bridged milestones the server
  can't observe fall back to the client's durable localStorage `granted` dedup. +8 unit cases; the fix
  is reasoning-verifiable (pure date math; the DB insert/dedup path is structurally unchanged).
- **✅ FIXED (shift 58) — DEFERRED BUG #6, terrarium SMIL ignoring reduced-motion.** Was: the moon
  `<animate>` r/opacity + the planet-shadow `<animate ry>` weren't gated by any tier flag, and the global
  `@media (prefers-reduced-motion)` CSS rule only stops CSS `animation`/`transition`, NOT SVG SMIL. Added
  an `ambientPulse` flag to the animation-tier config (full+reduced true, minimal false) and gated the
  three nodes — restoring the tier system's own contract that "minimal" (= reduced-motion) is a static
  scene. **Also found + fixed the twin:** `constellation.tsx`'s synergy-line pulse was the lone SMIL node
  there with NO reduced-motion awareness at all → added `useReducedMotion` + gated it. Reasoning-verified
  (the accessibility contract is expressible in code; the visual is the only browser-only part).

- **PRODUCT CALL (shift 49) — the bounce-back "recovery" ramp fires for ALL users, not just after a
  real lapse.** Shift 49 fixed the *exploit* (it was an unbounded +3-coins/day faucet — see frontier
  #0ah); it's now a bounded, once-ever 7-day ramp (+3 day 1, +10 day 3, +25 day 7). BUT there is no
  lapse-detection wiring anywhere — nothing starts the ramp based on a user actually missing days and
  coming back, so every new user gets a 7-day "you showed up / bounce-back / back in the groove" ramp
  from their first active day. That's harmless + bounded now (reads as a warm first-week welcome), but
  the copy is comeback-framed. If you want true comeback-only semantics, add lapse detection (e.g. start
  the ramp only when a habit is completed after a gap ≥1 day in an existing streak) — needs a real-device
  eyeball to tune, so left as a product decision, not shipped blind.

- **⚠️ KNOWN BUGS DEFERRED (shift 14) — surfaced by the cold-read bug hunt; couldn't safely fix here.**
  Two were FIXED this shift (see frontier #0af: milestone-coin truncation + the two farmable coin
  paths). These four are DEFERRED because they need DB-level verification or a product call:
  1. ✅ **FIXED (shift 54) — coin mutations are now atomic.** Was: `/api/coins` (delta) and
     `/api/inventory` (purchase) did read-then-write in two round-trips → two concurrent requests could
     clobber each other (lost grant / free item). Fixed with single-statement UPDATEs in
     `migration-009-atomic-coins.sql` (`tend_increment_coins` + `tend_deduct_coins_if_afford`); both
     routes call them via `supabase.rpc()` and gracefully fall back to the old read-then-write path if
     the migration hasn't been run yet. **ACTION: run `migration-009` in Supabase to activate it** (safe
     to re-run; harmless until run — the app falls back). See frontier #0ao.
  2. ✅ **FIXED (shift 15) — the relapse penalty is now gentle + self-healing.** Was: `stageDrops`
     accumulated across relapses and never reset, so after ~4 slips the dragon pinned at Egg forever
     even with a long current clean run + big best-ever streak (anti-soul). The product call (made per
     the soul: assumes-best, never-shaming) = **single-tier nudge that recovers as the streak rebuilds.**
     Redesigned `computeQuitStage` = `max(stage(current clean run), stage(best-ever) − 1)` — a slip
     resets the current run to 0 so the dragon visibly drops exactly one tier, then heals back to peak
     as it rebuilds, and is NEVER worse than one tier below best no matter how many slips. Removed the
     `stageDrops` counter entirely (state/persistence/hydration; `stage_drops` column left dormant, PUT/
     GET already treat it optional). `npm test` 92→94, build GREEN, lint unchanged. See §10 decision.
  3. ✅ **FIXED (shift 53) — `urge-entries` POST now verifies habit ownership.** Was: it wrote
     `{user_id: me, habit_id}` with `habit_id` straight from the body, so a client could create urge
     rows pointing at another user's habit_id (stamped with their own user_id → no cross-user *read*,
     just referentially-bad data). Now adds the same ownership SELECT the `habits/[id]` route uses
     (`id` + `user_id`) before insert, returning 404 when the habit isn't the caller's. Cold-readable
     (no DB needed to verify the logic — mirrors an established pattern), like shift 14's inventory fix.
  4. **Stripe / verify-subscription — email-clobber FIXED (shift 53); the fallback pagination still
     DEFERRED.** ✅ Fixed: Stripe `checkout.session.completed` upsert used to overwrite a stored email
     with `""` when `customer_details.email` was absent (it upserts onConflict clerk_id) → now `email`
     is only included in the payload when Stripe actually provides one. ⏳ Still deferred (needs a
     running Stripe under real volume to verify): `verify-subscription`'s no-customer-id fallback lists
     only the 10 most-recent GLOBAL checkout sessions, so under load a paid user's session won't be
     found and they stay on free tier (this route is the webhook-failure fallback → fails exactly when
     needed). The proper fix is to look up the session by the Clerk metadata rather than paginating
     global sessions → left for a keyed shift or Jonny.

- **✅ PARTLY CLEARED (shift 9) — the landing page is now browser-verified; the interactive in-app
  flows need YOUR machine.** Shift 9 proved the night-train sandbox firewalls Chromium's network (§14),
  so the auto-screenshot-the-live-app path is dead *here* — no future shift can eyeball the hydrated app
  in this env. What shift 9 DID verify offline via `file://`: the **real landing page** (full mobile
  render, looks great — `scripts/shots/landing-fold.png`) and the **dragon gallery** (36 species). What
  still wants your eyes on a normal machine: the hydrated `/preview` tabs (onboarding, wellness, Wrapped,
  You, nav) and the auth-gated real app (streaks/coins, grace badge, one-tap, egg-warming, gratitude
  card). Easiest path on your box: `npm run build && npx next start`, open `localhost:3000/preview`,
  tap each tab at a phone width. (Or just merge and click around the live site.)
- **Run `migration-008-gratitude-entries.sql` in Supabase (shift 6).** Adds the `gratitude_entries`
  JSONB column to `user_preferences` so the Wellness "three good things" ritual persists server-side +
  shows in Insights. Until it's run, gratitude falls back to localStorage gracefully (no crash), but
  won't sync across devices or appear in the Insights card. `IF NOT EXISTS`, so it's safe to re-run.
- **`.env.local` build placeholders (shift 1).** To make `npm run build` pass without secrets, shift 1
  created a **gitignored** `.env.local` with DUMMY, non-secret values (Clerk *publishable* key is
  public; everything else is an obvious placeholder). No real secret is in the tree. This file will
  NOT be part of any merge (it's gitignored). Your real keys stay in Vercel / your own local env. If
  you ever run the app for real on this branch, drop in real keys. Nothing to action unless you want
  to verify — just so you're not surprised to see it locally.
- **✅ RESOLVED (shift 8) — Clerk middleware was never actually missing.** Shift 1 believed there was
  NO middleware and added `src/middleware.ts`. Shift 8 found the repo has ALWAYS had a **root
  `middleware.ts`** (since the first commit `24c72b9`) — and Next 16 runs the ROOT file, ignoring the
  `src/` one. So shift 1's file was dead and its "production auth is broken" alarm was a false alarm:
  `origin/main`/Vercel almost certainly runs that root middleware fine. Shift 8 consolidated to the one
  root file and deleted the dead `src/middleware.ts` (see §10). **No action needed** unless you want to
  confirm `origin/main` still has `middleware.ts` at the root (it does in this branch's history).
- **Product direction check (shift 1).** Shift 1 decided to re-center on the dragon-egg garden and
  demote the quit/recovery framing to a first-class *mode* (see §10). If you actually want Tend to BE
  a recovery-first app, say so and the frontier flips — otherwise the night train proceeds
  garden-first.

---

## 13. PRICING & MONETIZATION MODEL (shift 4 — researched; DoD "pricing modeled" item)

> Purpose: satisfy the DoD "coherent pricing/monetization model (costs modeled, free/Pro split, Stripe
> wired)". Stripe is already wired (Free 3 habits / Tend+ $4.99mo · $39.99yr). This section models the
> real costs, benchmarks competitors, and recommends the split + price. Web-researched July 2026.

### 13a. Cost model — infra is effectively free until real scale
| Provider | Free tier that bites first | First paid tier | When it forces an upgrade |
|---|---|---|---|
| **Supabase** | 7-day inactivity **auto-pause**; then 500 MB DB / 5 GB egress / 50k MAU | Pro **$25/mo** | Auto-pause hits a quiet app almost immediately; capacity caps ~low-thousands of active users |
| **Vercel** | Hobby is **non-commercial-use only**; 100 GB bandwidth / 1M invocations | Pro **$20/mo** | Attaching Stripe = commercial → Pro on day 1 (loosely enforced tiny-scale); bandwidth by ~10k users |
| **Clerk** | 50,000 MRU (returning users) | $25/mo (+$0.02/MRU over) | Doesn't bite until ~50k returning users — very far out |
| **Stripe** | none (usage-priced) | — | Never; **2.9% + $0.30** per US card charge, no monthly fee |

**Bottom line:** a *monetized* 10k-user Tend costs ≈ **$45/mo** (Vercel Pro $20 + Supabase Pro $25);
Clerk + Stripe stay free/usage-only to ~50k users. Net per annual sub after Stripe ≈ $39.99 − (2.9% +
$0.30) ≈ **$38.23/yr ≈ $3.19/mo**. So **~14 annual subscribers cover all infra.** At 10k users × a
conservative 2–5% freemium conversion = **200–500 payers** → wildly profitable. **Conclusion: cost is a
non-constraint. Price for conversion, not cost recovery.**

### 13b. Competitor benchmark (2025–26, USD)
| App | Monthly | Annual (eff. $/mo) | Lifetime | Model |
|---|---|---|---|---|
| Finch | $9.99 | $69.99 (~$5.83) | — | freemium, Plus is cosmetic |
| Duolingo Super | $12.99 | $59.99 (~$5.00) | — | freemium, free tier fully usable |
| Fabulous | ~$16.99 | $39.99 (~$3.33) | ~$250 | freemium, heavily gated |
| Habitica | $4.99 | $47.99 (~$4.00) | — | freemium, subs cosmetic/convenience |
| Streaks | — | — | **$5.99 one-time** | pure paid, no sub |
| Productive | $3.99 | $23.99 (~$2.00) | — | freemium |
| **Tend (today)** | **$4.99** | **$39.99 (~$3.33)** | — | freemium, 3-habit free cap |

**Read:** Tend's annual ($3.33/mo eff.) is competitive (≈ Fabulous). Tend's **monthly is priced too low
relative to its annual** — the $4.99→$39.99 gap is only "save 33%", so there's weak pull toward annual,
which is the plan that actually retains. Health/fitness apps sell **~68% annual**; annual is the plan to
optimize. Nobody in the set except Streaks/Fabulous offers **lifetime** — an easy differentiator + a
cash-now lever for subscription-averse users (and Tend has zero users, so front-loaded cash is fine).

### 13c. RECOMMENDED SPLIT & PRICE
**Free (the generous, on-brand "never shaming" tier):**
- Up to **3 habit eggs**, full daily assumes-best check-in + one-tap "all good", streaks, coins.
- Core garden + dragon hatching/evolution art, **all wellness tools** (breathe/grounding/urge-surf/
  gratitude), basic Insights (recent heatmap + current streaks), **grace tokens earned at milestones**.
- Rationale: the soul is warmth, not a paywall. A stingy free tier contradicts "assumes the best in you."
  Give the whole emotional loop free; charge for *depth, breadth, and expression*.

**Tend+ (paywall = depth / breadth / vanity, never the core loop):**
- **Unlimited** habit eggs · choose your egg & species · full history + deep Insights (trends,
  correlations, records) · **Tend Wrapped** · all garden décor/themes · extra/bankable grace tokens ·
  (future) calm-mode terrarium. This matches the landing's current Tend+ bullet list — no promise drift.

**Price (recommended change):**
- **Monthly $5.99** (up from $4.99) — widens the annual discount, still under Finch/Duolingo/Habitica.
- **Annual $39.99** (unchanged) → now **"save 44%"** vs monthly, a much stronger nudge to the retaining plan.
- **Lifetime $79.99** (new) ≈ 2× annual — differentiator + cash-now; low marginal cost per §13a.
- **7-day free trial on annual** (new) — the single biggest lever: health/fitness **trial→paid ≈ 40%**.
  Default the pricing toggle to **annual** with the savings badge (it already shows a save-badge).

**Expected math (illustrative):** 10k users → ~3% blended conversion ≈ 300 payers; if 68% pick annual
(~$38 net) and rest monthly/lifetime, that's well over **$1k/mo net** against ~$45/mo infra. The
constraint on revenue is **conversion (trial + annual framing)**, which is exactly what the above targets.

**Implementation status:** documentation only this shift (closes the DoD item). Executing the price
change is a Stripe-config + copy task — new price IDs for $5.99/mo, $79.99 lifetime (one-time), and a
trial period on the annual price, plus a `lifetime` entitlement branch alongside the existing sub check.
Parked as an optional follow-up in the frontier; **not required** for the DoD, which asks for the model
to be *modeled + documented*, done here. Sources captured in shift-4 research (RevenueCat/Business of
Apps benchmarks; Vercel/Clerk/Supabase/Stripe pricing pages).

---

## 14. BROWSER-VERIFICATION HARNESS (shift 9 — how to actually *see* the UI)

> Purpose: the DoD's last items were gated on eyeballing the UI in a browser. Shift 9 made that
> possible for what's verifiable in this sandbox, and documented the hard limit for the rest.

### 14a. The hard constraint (verified empirically)
Headless **Chromium in the night-train sandbox has no HTTP egress.** Every `http(s)://` navigation
fails (`ERR_NAME_NOT_RESOLVED`), including `http://127.0.0.1:3200`, even though Bash `curl` and
PowerShell `Invoke-WebRequest` reach the local `next start` server fine. `data:` and `file://` URLs
render normally (confirmed by rasterizing a dragon sprite). There is **no system proxy** (checked the
registry); the block is at the browser's network layer. **Conclusion: `next start` + Playwright
screenshot-the-live-site cannot work here.** Don't burn a future shift re-attempting it in this env.

### 14b. What that means for verification
- **Server components render faithfully offline** → the **landing** (`app/page.tsx`, zero client JS)
  was fully reproduced and eyeballed at a 390px phone viewport. Signed off (§8).
- **Client components render only their pre-hydration markup** → `/preview`'s default **dragon gallery**
  verified (36 species, real sprites, `Creature` hero); tab-switching / animations / the other
  showcases (onboarding, wellness, Wrapped, You, nav) need hydration JS → need a **networked browser**
  (Jonny's machine, or any normal box: just point Playwright at `localhost:3200/preview` — the easy way).

### 14c. The pipeline (committed under `scripts/`)
1. `npm run build` then, **in the host PowerShell** (not the Bash sandbox — the server must be on the
   host loopback), `npx next start -p 3200`.
2. `pwsh scripts/build-static-html.ps1` → fetches each route's SSR HTML via `Invoke-WebRequest`, inlines
   the CSS, rewrites `/_next`+`/sprites` to `file://`, strips JS → `scripts/rendered/<name>.html`.
3. `node scripts/render-shot.mjs` → screenshots those files in headless Chromium at 390px →
   `scripts/shots/<name>-{fold,full}.png`, reporting console errors + failed requests.
Proof shots committed: `scripts/shots/landing-fold.png`, `scripts/shots/preview-fold.png` (rest is
gitignored). `scripts/README.md` has the full write-up. Requires a one-time `npx playwright install
chromium` (browser binary lives in the user cache, not the repo).
