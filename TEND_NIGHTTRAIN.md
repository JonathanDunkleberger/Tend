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
      re-verified shift 6 — build ✅, lint 0 errors / **5 warnings** (down from 27, all intentional).)*
- [x] A stunning, mobile-first, conversion-optimized **landing page** that sells the dream. *(shift 1:
      new `app/page.tsx`, on-brand, verified 200. Not yet browser-eyeballed but content/sprites serve.)*
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
      egg-warming viz. shift 6: `clickable()` a11y helper made the garden's primary tap targets
      keyboard-operable (roles + Enter/Space + aria-labels). shift 7: **WCAG contrast pass across all
      three surfaces** (THEME map both themes + landing + /pricing), each pair verified via computed
      luminance ratios — no browser needed; light-theme subtext went from ~1.5–2:1 (near-invisible) to
      ≥4.5:1 AA. Remaining: optional per-view skeletons + service worker (SW deliberately skipped until
      browser-verifiable) — all minor. The real gate here is a real-device eyeball.)*
- [ ] Everything **branding-consistent as "Tend"** with the warm garden aesthetic. *(shift 5: README
      rebranded off the stale recovery-first framing → dragon-garden identity + correct pricing/stages.
      Landing/onboarding/manifest already on-brand. Remaining: eyeball in-app copy on a real device;
      the pricing route still uses "terrarium" décor labels — cosmetic, verify tone.)*
- [ ] This doc + DECISIONS reflect the final state so Jonny can review and merge with confidence.

---

## 9. CURRENT FRONTIER (the live work queue — top item is next)

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
> **browser-verification** (auth-gated) rather than new code — the only remaining pure-code levers are
> minor/optional (per-view skeletons, a service worker [skip until browser-verifiable], the §13 price
> change). **BIGGEST BLOCKER TO DECLARING DONE: none of the shift-2→7 UI
> is browser-verified** — it all renders behind Clerk auth. A successor (or Jonny) with real keys must
> eyeball the whole app once: Wrapped reel, nav, wellness tools (incl. the new Wind-down mode), You
> screen, grace-token badge/detail, one-tap, egg-warming bars, empty-garden state, and the new gratitude
> Insights card. **Also NEEDS EYES: migration-008 must be run in Supabase** before gratitude persists
> for real (falls back to localStorage gracefully until then). Read §6b audit + §10 decisions + §13
> pricing first. `.env.local` + middleware notes in NEEDS EYES still stand.

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
- *(shift 6)* **Calm/night mode = a self-contained wellness tool, not a global palette shift.** Rather
  than re-theming the whole garden into a starlit terrarium (deep + risky in the monolith), "Wind
  down" is a full-screen overlay launched from the Wellness hub — a breathing moon-orb + starfield +
  gentle lines, all client-only/CSS/JS-timer, no DB, no theme surgery. Delivers the calm-evening
  feeling with near-zero blast radius. A future shift can still theme the garden itself if desired.

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
- **⚠️ MISSING CLERK MIDDLEWARE — was the live site's auth broken? (shift 1).** This branch had NO
  `middleware.ts`/`proxy.ts` at all, which makes Clerk `auth()` 500 on every page. Shift 1 added
  `src/middleware.ts` (standard `clerkMiddleware`) and verified the landing now returns 200. **Please
  confirm** whether `origin/main` / the Vercel deploy has its own middleware — if not, production auth
  is broken and this fix needs to ship. If main DOES have one, reconcile the two before merging.
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
