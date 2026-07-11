# 🐉 Tend — Night-Train Branch Review Guide

> A 3-minute skim so you can review and merge `night-train` with confidence. The exhaustive
> reasoning lives in `TEND_NIGHTTRAIN.md` (§10 DECISIONS, §12 NEEDS EYES, §13 PRICING); this file
> is the short version: **what changed, what's safe, what needs your hands, and how to verify.**

---

## 1. What this branch is

An unattended multi-shift rebuild of Tend from a drifting "quit-tracker" into the warm, gamified
**dragon-egg habit garden** it was meant to be. ~150 commits, all on `night-train` — **nothing was
pushed, deployed, or merged to `main`; the live site is untouched.** Highlights:

- **New front door** — conversion-optimized landing (hero dragon, daily-loop, evolution journey,
  FAQ, OG card, JSON-LD/sitemap/robots) + a "plant your first egg" onboarding.
- **Mobile shell** — thumb-first bottom nav (Garden / Insights / Wellness / You), safe-area insets.
- **Core loop** — assumes-best one-tap check-in, streaks, coins, grace tokens, milestone rewards,
  ambient egg-warming, full hatch + evolution **ceremonies**, streak flame, coin-roll, soft chime.
- **Deep analytics + Tend Wrapped** — heatmap, momentum curve, consistency rings, day-of-week polar
  rose, streak journey, synergy constellation, records, gratitude.
- **Wellness suite** — Breathe, Ride-the-wave, 5-4-3-2-1 grounding, gratitude, Wind-down calm mode.
- **Robustness** — ~40 real bugs fixed (dragon de-evolution, timezone/clean-day, webhook retries,
  atomic coins, a11y/reduced-motion, WCAG contrast); a route-level error boundary + loading skeleton;
  **the first test suite the repo ever had** (`npm test` → 129 green over the pure reward/analytics math).

## 2. Merge safety

- **Guardrails honored:** never pushed, never deployed, never touched `origin/main`. `.env*` stayed
  gitignored — no real secret is in the tree (the local `.env.local` is dummy build placeholders and
  is gitignored, so it won't merge). Stripe + Clerk wiring left intact.
- **Green right now on this branch:** `npm run build` ✅ · `npm run lint` → 0 errors / 5 intentional
  warnings · `npm test` → 129/129.
- **`src/middleware.ts` was deleted** (it was a dead duplicate; the repo-root `middleware.ts` is the
  real one Next 16 runs). If you diff and see that, it's intentional — see §10 shift 8.

## 3. ⚠️ Needs your hands (do these — the code degrades gracefully until you do)

**Required for full functionality (safe, `IF NOT EXISTS`, re-runnable):**
1. Run **`migration-008-gratitude-entries.sql`** in Supabase → makes the Wellness "three good things"
   ritual persist server-side + show in Insights. Until then it falls back to localStorage (no crash).
2. Run **`migration-009-atomic-coins.sql`** in Supabase → activates atomic coin RPCs
   (`tend_increment_coins` / `tend_deduct_coins_if_afford`) so concurrent coin writes can't clobber.
   Until then the routes fall back to the old read-then-write path.

**Env (already in Vercel — just confirm on merge):** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
`CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID`, `NEXT_PUBLIC_APP_URL`.

## 4. Optional follow-ups (documented, not done — your call)

- **§13c price change** — recommended: monthly **$5.99** (from $4.99), keep annual $39.99 (→ "save
  44%"), add **$79.99 lifetime** + a **7-day annual trial**. Needs new Stripe price IDs + a `lifetime`
  entitlement branch. Displayed prices were deliberately **left at $4.99/$39.99** so copy stays honest
  with the current live Stripe IDs. Full model + competitor benchmark in §13.
- **`verify-subscription`** global-pagination fallback, **bounce-back ramp** comeback-only semantics —
  both need real Stripe/usage volume to tune. See §9.3 / §12.

## 5. How to verify (on a networked machine — the sandbox can't run a browser)

The auto-verification here is limited to offline `file://` screenshots (the night-train sandbox has no
browser HTTP egress — see §14). To eyeball the live, hydrated app:

```
npm ci && npm run build && npx next start
```

- Open **`/preview`** — a public, no-auth QA harness that mounts every core surface with mock data.
  Tab through: Garden · Today card · Habit detail · Insights · Gallery · Onboarding · Wellness ·
  You · Hatch · Evolve · Wrapped · Breathe · Nav · Loading (or add `?view=insights&dark=1`).
- Or just **sign in and click around the real app** on your phone — the honest final check is the
  hydrated motion/audio + real-device feel, which is the one thing no shift could verify for you.
- Committed proof screenshots (390px phone width, light + dark) live in `scripts/shots/`.

`/preview` is a QA harness, not a product surface — **ship it behind the branch or delete it before
merge, your call** (it's public only so it renders without Clerk keys; it threads no real data).

## 6. Where the detail lives

| You want… | Read |
|---|---|
| Every design decision + rationale | `TEND_NIGHTTRAIN.md` §10 DECISIONS |
| Open questions / blockers for you | §12 NEEDS EYES |
| Pricing/cost model + benchmark | §13 |
| Chronological shift-by-shift log | `TEND_NIGHTTRAIN_LOG.md` |
| The brand soul + remaining ambition | §1–§2 |

**Bottom line:** the branch is build/lint/test-green and self-consistent. The only things standing
between it and shipping are the two Supabase migrations above and your own eyes on a phone.
