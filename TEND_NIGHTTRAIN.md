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

### 9.0 FRESH-START ORIENTATION — READ THIS FIRST

You are starting a **fresh night-train run** after a very productive first night (63 real shifts, 111
commits on `night-train` ahead of `main`; shifts 17–48 and 64–91 were spend-limit no-ops, ignore them).
Baseline is **GREEN**: `npm run build` ✅, `npm run lint` 0 errors / 5 intentional warnings,
`npm test` **108/108**. Shift numbering restarts at 1 this run — that's fine, just append to the LOG.

**The mission is NOT complete and the sentinel is deliberately NOT set** — keep going. But DON'T repeat
the first night's tail mistake: shifts 55–63 kept re-running cold-read *bug hunts* on a codebase that is
now genuinely well-swept (every API route, the monolith's effect wiring, the server-hydration path, the
quit/relapse client, the analytics math — all hunted 1–2×, all regression-locked). **Re-hunting is
churn now.** The remaining mission is the part the first night UNDER-delivered because it was blocked on
the sandbox's browser limit: **make it COOL — premium visual design, motion, and delight — and make the
deep analytics genuinely BEAUTIFUL, not just correct.** That is the whole point (see §2 ambition).

**The strategic unlock — turn the `/preview` harness into your eyes.** The auth-gated app can't be
browser-verified in this sandbox (§14: headless Chromium has no HTTP egress), which is why the core-loop
/ insights / polish DoD items stalled "waiting on Jonny's eyeball." Break that: `/preview`
(`src/app/preview/…`, public, no auth) already mounts real components with mock props, and the
`file://` pipeline (§14c) screenshots server-rendered HTML offline at 390px. **Expand `/preview` to
cover the core surfaces, then you can SEE and iterate on the visual composition yourself** — the layout,
color, hierarchy, dragon-art placement, dark-mode parity. (Honest limit: `file://` shows client
components' pre-hydration markup only, so it verifies *static visual composition*, not live animation.
Build motion carefully + reduced-motion-gated + compile-verified, and flag the final motion eyeball for
Jonny — but the "does this screen look gorgeous at phone width" question you CAN answer now.)

**Keep it cheap + stable** (a standing requirement): no new paid deps/services, stay on the free-tier
infra modeled in §13a, don't break the build, commit per change, verify before claiming done.

### 9.1 ALREADY DONE — do NOT redo (digest; full history in the LOG + §10 DECISIONS)

- **Front door:** landing rebuilt + browser-verified (hero dragon, evolution-journey strip, FAQ
  accordion, OG card, JSON-LD, robots/sitemap) — conversion + SEO **complete**. Onboarding rebuilt
  ("plant your first egg"). Don't re-touch the landing unless a real gap appears.
- **Shell/IA:** mobile bottom-nav (Garden/Insights/Wellness/You), safe-area, You profile screen.
- **Core loop logic:** assumes-best one-tap check-in, streaks, coins, grace tokens (earn/spend/gift),
  milestone rewards, egg-warming ambient progress, quit-mode economy — all **regression-locked** in
  `lib/{streak,progress,quit,economy}.ts` (108 tests). Don't re-extract math for coverage.
- **Analytics DATA + Wrapped:** the heatmap, consistency, day-of-week, synergies, records, and the
  Tend Wrapped reel all compute correctly. The MATH is done — the VISUAL DESIGN is the open work (9.2).
- **Wellness suite:** Breathe + grounding + urge-surf + gratitude (server-persisted) + Wind-down calm
  mode. Five tools shipped.
- **Pricing MODEL:** researched + documented (§13). Executing the price change is Jonny-only (9.3).
- **Correctness:** ~40 real bugs fixed across shifts 14–62 (dragon de-evolution, timezone/clean-day,
  webhook retries, atomic coins, onboarding save, relapse re-arm, a11y/reduced-motion, contrast). The
  cold-read vein is genuinely mined out — **do not open a new bug hunt unless you trip over something.**
- **Branding:** recovery-first drift swept to the dragon-garden "Tend" voice across app + README.

### 9.2 THE QUEUE (top = next) — ambitious, mobile-first, sandbox-verifiable

1. **Expand the `/preview` harness to the CORE surfaces** so they become visually verifiable. Mount,
   with rich mock data: the **Garden daily-tend home** (habit rows, egg-warming, streak flames, one-tap
   "all good"), a **habit detail** (dragon hero at each stage + egg-warming + grace shield), the full
   **Insights** analytics screen, the **Wrapped** reel, and the **hatch + evolution ceremonies**. Add a
   light/dark toggle per surface (the harness already supports THEME). Then wire each into the `file://`
   screenshot pipeline (§14c) and commit proof shots. This is the enabling step for everything below.

2. **PREMIUM MOTION + MICRO-INTERACTION PASS** (the "cool as f***" mandate — the biggest gap vs §2).
   On the now-previewable surfaces, design and build: the **hatch ceremony** (egg rocks → cracks →
   dragon emerges with a coin burst + confetti), the **evolution transition** between stages, a
   **satisfying one-tap check-off** (spring/scale + optional haptic via `navigator.vibrate` + a soft
   chime, sound-optional), a **streak-flame** flourish, a **coin-counter roll**, and smooth **page/tab
   transitions**. Use CSS/Web-Animations, keep 60fps, gate ALL of it behind `useReducedMotion` (the
   pattern already exists). Compile- + composition-verify via `/preview`; flag the live-motion eyeball
   for Jonny. Showcase the purchased dragon art as the emotional payoff it's meant to be.

3. **Make the DEEP ANALYTICS genuinely BEAUTIFUL** (§2's "deep, beautiful analytics"). The data is
   there — redesign Insights into something gorgeous and motivating on a phone: a **momentum curve**,
   **per-habit consistency rings**, a **best-day radial / day-of-week bars**, **correlation/synergy
   callouts** in plain warm language ("you tend more on days you sleep well"), a **streak timeline**,
   and a headline "here's how you're doing" summary. Mobile-first, on-brand palette, dark-mode parity.
   Verify composition via `/preview` + `file://`. (Consider loading the `dataviz` skill for palette/
   chart best-practices before writing chart code.)

4. **Promote the best parked ideas into real features** (§11), lightest-risk / highest-delight first:
   **dragon species-by-habit-type** (pure mapping logic → unit-testable + more meaningful collection);
   a **garden-wide night re-theme** (CSS, `file://`-verifiable); a **widget-style "Today" hero** a user
   could screenshot to their home screen. Prune any idea that doesn't earn its complexity.

5. **Re-audit the DoD (§8)** and only tick the core-loop / premium-polish / analytics items once their
   surfaces are **visually verified via `/preview`**. Keep this queue tight (3–6 items) — when you
   finish one, replace it with what you learned should come next. **Do not declare COMPLETE** until §8
   is genuinely all-true AND build/lint/test are green; the meaningful remaining gates are design
   quality, not more bug-hunting.

### 9.3 NOT THIS RUN — Jonny-only (do NOT attempt; surface, don't touch)

- **Run `migration-008` + `migration-009` in Supabase** (gratitude persistence + atomic coins; the app
  falls back gracefully until then).
- **Execute the §13c price change** (needs new Stripe price IDs: $5.99/mo, $79.99 lifetime, 7-day
  annual trial) — a keyed Stripe-config task.
- **`verify-subscription` 10-session global-pagination fallback** — needs real Stripe volume to fix right.
- **Bounce-back ramp product call** — it currently fires for all users (bounded/benign), not only after
  a real lapse; wiring true comeback-only semantics needs a real-device tuning pass.
- **The real-device eyeball + the merge decision** — hydrated interactions/animations and the final
  ship-to-main call are yours.

### 9.4 Discipline

Keep §9 to a tight forward-looking queue — the first night let it balloon to 885 lines of "prior
pointer" archive; that history now lives in `TEND_NIGHTTRAIN_LOG.md` + §10 DECISIONS. Don't rebuild the
archive here. Frontier-first: rewrite this queue BEFORE a long task so a successor can cold-start.

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
