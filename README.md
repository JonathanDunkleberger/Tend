<p align="center">
  <img src="public/app-icon-1024.svg" width="80" height="80" alt="Tend" />
</p>

<h1 align="center">tend.</h1>

<p align="center">
  <strong>Your habits are dragon eggs. Tend them daily and watch them hatch.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#roadmap">Roadmap</a> ·
  <a href="#philosophy">Philosophy</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-4ade80?style=flat-square&labelColor=0a0e18" />
  <img src="https://img.shields.io/badge/next.js-16-white?style=flat-square&labelColor=0a0e18" />
  <img src="https://img.shields.io/badge/react-19-61dafb?style=flat-square&labelColor=0a0e18" />
  <img src="https://img.shields.io/badge/license-proprietary-8b85a0?style=flat-square&labelColor=0a0e18" />
  <img src="https://img.shields.io/badge/data-encrypted%20cloud-22c55e?style=flat-square&labelColor=0a0e18" />
</p>

<br />

<p align="center">
  <em>[ screenshot placeholder — add UI screenshot here ]</em>
</p>

<br />

---

## The Idea

Most habit trackers are cold. A checkbox, a streak counter, a guilt trip when you miss a day. Tend is the opposite — a calm little garden you tend every morning, where each habit is a **dragon egg** that hatches and evolves as you show up for it.

**Tend assumes the best in you.** Every day defaults to *"you did well."* You only tell it when you slipped — and even then there's no shame, just a gentle pause before your egg keeps growing. Streaks, coins, and milestone rewards make tending feel great; deep analytics and a shareable *Tend Wrapped* show you how far you've come.

And when a habit is a hard one to break, Tend has your back: quitting is a **first-class mode** with guided breathing, urge support, healing timelines, and compassionate — never punishing — relapse handling. The garden holds the whole of you.

It's [Forest](https://www.forestapp.cc/) meets [Tamagotchi](https://en.wikipedia.org/wiki/Tamagotchi), with the warmth of a garden you actually want to open.

---

## Features

### Dragon-Egg Garden
Every habit plants a **dragon egg**. Tend it and it visibly warms toward hatching, then evolves through five stages — **Egg → Hatchling → Whelp → Drake → Elder Dragon** — as your consistency grows. 36 hand-drawn dragon species (each with an element and rarity) are the emotional payoff, showcased across the garden, milestones, and your shareable *Tend Wrapped*.

### Assumes the Best In You
The daily loop defaults to *"you did well."* One tap — **"Everything went well today"** — marks every habit done, or you quietly report a slip. A slip never shames you; it just gently pauses the egg. **Grace tokens** (earned at streak milestones or bought with coins) protect a streak so one bad day never stings.

### Dual-Mode Habit Tracking
- **Build habits** — daily check-offs for exercise, meditation, hydration, journaling, and anything you want to grow.
- **Quit habits** — sobriety-style counters that tick automatically. You're clean unless you say otherwise. No daily checkboxes for things you're *not* doing.

### Urge Intervention System
When cravings hit, tap **Urge** and choose your weapon:
- **Breathe** — 5-cycle guided breathing (4s inhale → 4s hold → 6s exhale) with animated visual ring
- **Write it out** — quick journal with trigger tags (Stress, Boredom, Social, Night) to identify patterns over time
- **Redirect** — randomized 2-minute physical activities (cold water, pushups, grounding exercises) to break the craving cycle

Every urge survived earns coins and accelerates egg hatching.

### Living Garden
Your dragons grow on a tiny planet-garden inspired by *The Little Prince*. It starts with natural foliage — grass, flowers, a small tree — and fills with life as you progress. Dragons evolve through 5 stages (Egg → Hatchling → Whelp → Drake → Elder Dragon) based on consistency, and you can decorate the garden from the shop with coins.

### Egg Progression
New quit habits begin as eggs that visually transform over 72 hours:
- **0–12h**: Clean egg, gentle pulse
- **12–24h**: Hairline crack, wobble begins
- **24–48h**: Multiple cracks, pronounced wobble
- **48–72h**: Heavy cracks, intense shaking, sparkle particles
- **72h+**: Hatch animation with flash, burst, and dragon reveal

### AA-Style Milestone Coins
Recovery medallions awarded at 2h, 6h, 12h, 24h, 48h, 72h, 1 week, 2 weeks, 1 month, 2 months, 3 months, 6 months, and 1 year. Color progression from stone gray → bronze → green → blue → purple → red → gold. Each coin is earned, never given.

### Healing Timelines
Science-backed body recovery timelines for quit habits. See what's happening inside your body at each milestone — from heart rate normalizing at 2 hours to lung function improving at 90 days.

### Insights & Analytics
- **Tend Wrapped** — a tap-through, Spotify-Wrapped-style story of your journey: total days, longest streak, your hero dragon, best day, and a shareable final card
- **Multi-habit heatmap** — vertical color columns showing all habits at a glance
- **Per-habit consistency** — fair, capped-window completion rates so young habits aren't punished
- **Habit synergies** — constellation visualization showing which habits reinforce each other
- **Trigger patterns** — aggregated urge journal data revealing when and why cravings hit
- **Money saved** — real-time calculator based on daily cost of the habit you quit

### Engagement Without Manipulation
- **Morning check-in** — daily pledge ("I'm still clean") with a science fact about your body healing
- **Dragon reactions** — your dragons respond to your habits (thriving, neglected, sleeping) via CSS state changes
- **Night wind-down** — calm end-of-day screen when all habits are complete
- **Compassionate relapse** — no shame, no red screens. "You went 3 days. That strength is still inside you."
- **Weekly recap** — Sunday summary with habit completion rates, urges beaten, and coins earned

### Monetization
- **Free tier**: up to **5** habit eggs, **12** starter dragons, the full daily loop (assumes-best check-in, streaks, coins, hatching art), **all wellness tools**, *Tend Wrapped*, daily Stoic wisdom, grace tokens at milestones, and basic insights.
- **Tend+** ($4.99/mo · **$29.99/yr** — save ~50% · or **$39.99 Forever**): unlimited habit eggs, all 36 species, deep insights & pattern maps, all garden décor & themes, extra grace tokens, +5 daily coins.

The core emotional loop is **never** gated. The whole garden, hatching art, wellness suite (breathing, grounding, urge-surf, gratitude), Wrapped, and relapse compassion are free forever — the paywall is depth and expression, not the soul.

---

## Architecture

<p align="center">
  <a href="docs/architecture.html">
    <img src="public/tend-architecture.svg" alt="System Architecture" width="100%" />
  </a>
  <br />
  <em>Full interactive diagram: <code>docs/architecture.html</code></em>
</p>

### Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Server components, SSR data loading, API routes |
| **UI** | React 19 + Tailwind CSS | Component architecture, utility styling |
| **Auth** | Clerk | Authentication, user management, webhooks |
| **Database** | Supabase (PostgreSQL) | Cloud persistence, RLS, real-time |
| **Rendering** | Sprite art (custom dragons + Sprout Lands world) | Dragon, egg, and garden decoration assets |
| **Icons** | Lucide React | Consistent, clean iconography |
| **Typography** | Fraunces + DM Sans | Serif display + clean body |
| **Payments** | Stripe (web) / StoreKit (iOS) | Subscription billing, webhook-verified |
| **Hosting** | Vercel | Edge deployment, instant previews |
| **Native** | React Native + Expo | iOS App Store distribution |

### Data Model

All user data is stored in Supabase (PostgreSQL) and tied to authenticated Clerk accounts. A localStorage cache provides instant hydration while the server remains the source of truth. No telemetry. No tracking.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Development

```bash
# Clone the repository
git clone https://github.com/JonathanDunkleberger/Tend.git
cd tend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — best viewed at 375px width (mobile).

### Build

```bash
npm run build
npm start
```

### Deploy

```bash
# Vercel (recommended)
vercel --prod
```

---

## Roadmap

### v1.0 — Launch *(shipped)*
- [x] Dual-mode habit tracking (build + quit)
- [x] Urge intervention system (Breathe / Write / Redirect)
- [x] Living garden with hand-drawn dragon art
- [x] Egg progression with 72-hour hatch cycle
- [x] AA-style milestone coins
- [x] Healing timelines
- [x] Coin economy + World Shop
- [x] Tend+ subscription
- [x] Morning check-in + dragon reactions
- [x] Privacy policy + Terms of Service

### v1.1 — Cloud & Polish *(current)*
- [x] Clerk authentication + Supabase cloud sync
- [x] Stripe webhook-verified subscriptions
- [x] Server-side rendering with SSR data loading
- [x] Animation tier system (reduced motion support)
- [x] Typed API layer with error handling
- [ ] React Native build for App Store
- [ ] TestFlight beta

### v1.2 — Engagement
- [ ] Push notifications (native, opt-in, max 2/day)
- [ ] Sound design (optional, ASMR-quality)
- [ ] Weekly recap (Sunday summary)
- [ ] Night wind-down screen
- [ ] Persisted urge journal insights

### v1.3 — Social
- [ ] Shared planets (anonymous accountability partner)
- [ ] Shareable milestone cards (privacy-safe, no habit names by default)

### v2.0 — Growth
- [ ] Seasonal events (cosmetic, Tend+ only)
- [ ] Expanded dragon catalog
- [ ] Custom dragon naming
- [ ] Cloud sync (optional, encrypted)

---

## Philosophy

### The core loop is free. Forever.

The whole daily garden — assumes-best check-in, hatching art, streaks, coins — plus every wellness tool (breathing, grounding, urge-surf, gratitude) and all relapse support will never be moved behind a paywall. If someone is having a craving at 2 AM, the last thing they should see is a purchase screen.

### No shame mechanics.

There are no red screens, punished streaks, or dying dragons. Relapsing shows: "You went 3 days. That strength is still inside you." Users earn +5 coins for honesty when they reset. The app should be the last thing someone deletes, not the first.

### Your data is yours.

Tend stores data in an encrypted cloud database tied to your authenticated account — no anonymous analytics, no tracking pixels, no data brokers. We can't sell what we don't collect. Your recovery journey syncs across devices but stays private.

### Engagement without addiction.

Tend is a place people come to care for themselves — including, sometimes, breaking a hard habit. The engagement model must be fundamentally different from apps that exploit attention. No loot boxes, no daily login obligations, no guilt notifications, no "your dragon is dying" manipulation. Every feature should make users feel cared for, not surveilled.

---

## Credits

- **World & decoration art**: [Sprout Lands](https://cupnooble.itch.io/sprout-lands-asset-pack) by Cup Nooble
- **Icons**: [Lucide](https://lucide.dev/)
- **Typography**: [Fraunces](https://fonts.google.com/specimen/Fraunces) by Undercase Type · [DM Sans](https://fonts.google.com/specimen/DM+Sans) by Colophon Foundry

---

<p align="center">
  <strong>tend.</strong> — Your habits are dragon eggs. Tend them daily and watch them hatch.
</p>
