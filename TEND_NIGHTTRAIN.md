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

- [ ] `npm run build` + `npm run lint` pass clean on the `night-train` branch.
- [ ] A stunning, mobile-first, conversion-optimized **landing page** that sells the dream.
- [ ] A delightful **onboarding** that hatches the first egg in under a minute.
- [ ] The **daily core loop** feels great on a phone: assumes-best check-in, streaks, coins, egg
      progress, dragon evolution art showcased with animation.
- [ ] A **deep analytics** screen that genuinely helps + a shareable **Wrapped**.
- [ ] An expanded **wellness suite** (breathing + at least 2–3 more uplifting tools).
- [ ] A coherent **pricing/monetization** model (costs modeled, free/Pro split, Stripe wired).
- [ ] **Premium polish**: micro-interactions, dark mode, PWA install, accessibility, safe-area insets.
- [ ] Everything **branding-consistent as "Tend"** with the warm garden aesthetic.
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
7. **[PHASE 2 — NEXT] Core-loop polish: the assumes-best one-tap check-in.** This is the soul + a DoD
   item. Study `morning-checkin.tsx` + the main garden in `tend-app.tsx` (the terrarium + per-habit
   tap-to-complete). Make the daily tend feel *great*: a single "all good today ✓" affordance that
   assumes the best (marks all active habits done in one satisfying tap w/ confetti + coin feedback),
   gentle per-habit slip reporting, spring micro-interactions on check-off, clear egg-progress-toward-
   hatch feedback. Research Finch/Forest daily-loop delight first. Commit per improvement.
8. **[PHASE 3 — AFTER] Deep analytics + Wrapped.** The Insights tab currently = heatmap + constellation.
   Elevate to genuinely insightful (best/worst days, momentum, per-habit consistency, correlations) +
   a shareable "Tend Wrapped". `share-card.tsx` + `constellation.tsx` are the seeds.
9. **[ongoing] Lint hygiene** — 32 warnings (unused vars + a few exhaustive-deps). Unused-var ones are
   safe quick wins; exhaustive-deps in the monolith need care.

> HANDOFF TL;DR for the next shift: build is GREEN, lint 0-errors. Front door (landing + onboarding)
> done. Bottom-nav shell + Wellness + You screens now DONE (shift 2). Biggest lever now = **core-loop
> polish: the assumes-best one-tap daily check-in** (frontier #7) — the emotional heart of the product.
> Read §6b audit + §10 decisions first. The `.env.local` + middleware notes in NEEDS EYES still stand.

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

## 11. SURPRISE-ME IDEAS (park bold ideas here; promote the best into the frontier)

- **Egg incubation as ambient progress:** the egg visibly "warms"/cracks a little each day you tend it,
  so opening the app shows tangible daily change even before a hatch.
- **Dragon personality from your habits:** the species/color you hatch reflects the habit type
  (calm/water for sleep, fire for fitness, etc.) — collectible + meaningful.
- **"Tend Wrapped" as a share-card export** (the constellation/share-card components hint this exists).
- **Calm mode / night mode** that turns the garden into a starlit terrarium for evening wind-down.
- **Streak insurance / grace token** earned by coins — protects against one slip so it never feels
  punishing (retention gold, monetizable).
- **Widget-style "today" hero** you could screenshot to a phone home screen.

## 12. NEEDS EYES (blockers / decisions for Jonny — keep short)

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
