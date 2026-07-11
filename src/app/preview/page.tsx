"use client";

/**
 * /preview — a PUBLIC, auth-free QA/showcase harness.
 *
 * WHY THIS EXISTS: every feature shipped on the `night-train` branch (shifts 2→7)
 * renders only behind Clerk auth, so nobody without real Clerk keys has been able
 * to *see* it in a browser — the single biggest blocker to signing off the mission's
 * Definition of Done. This page mounts the real feature components with mock props
 * and the real THEME so Jonny (or any successor, no secrets required) can eyeball the
 * whole UI on a phone or desktop and finally verify it.
 *
 * It imports NO secrets, touches NO server data, and only renders presentational
 * components with fabricated state. It can ship behind the branch as a dev tool or
 * be deleted before merge — nothing depends on it. Route made public in middleware.ts.
 */

import { useMemo, useState } from "react";
import { THEME, STAGE_LABELS } from "@/lib/constants";
import type { SeasonKey } from "@/lib/constants";
import type { HabitWithStats } from "@/types";
import {
  DRAGON_SPECIES,
  getDragonSprite,
  getDragonSpecies,
  ELEMENT_COLORS,
  RARITY_COLORS,
} from "@/lib/sprites";
import { daysAgo } from "@/lib/utils";

import { Onboarding } from "@/components/onboarding";
import { WellnessHub } from "@/components/wellness-hub";
import { TendWrapped } from "@/components/tend-wrapped";
import { YouScreen } from "@/components/you-screen";
import { BottomNav } from "@/components/bottom-nav";
import { BreathingTimer } from "@/components/breathing-timer";
import { Creature } from "@/components/creature";

/* ───────────────────────── mock data ───────────────────────── */

// Deterministic mock habits, one per element so the dragon variety shows.
// (Left un-annotated so the `_streak/_total/_stage` carry fields stay on the
// inferred type for the Wrapped helper stubs below.)
const MOCK_HABITS = [
  { name: "Morning run", color: "#ef7d3a", creature_type: 2, category: "build", streak: 41, total: 58, stage: 3 },
  { name: "Drink water", color: "#3b82f6", creature_type: 7, category: "build", streak: 12, total: 20, stage: 2 },
  { name: "Read 10 pages", color: "#22c55e", creature_type: 13, category: "build", streak: 7, total: 9, stage: 1 },
  { name: "No doomscrolling", color: "#a855f7", creature_type: 20, category: "quit", streak: 23, total: 30, stage: 3 },
  { name: "Sleep by 11", color: "#fbbf24", creature_type: 31, category: "build", streak: 3, total: 4, stage: 1 },
].map((h, i) => ({
  id: `mock-${i}`,
  user_id: "preview",
  name: h.name,
  color: h.color,
  icon_name: "sparkles",
  category: h.category,
  is_archived: false,
  is_paused: false,
  sort_order: i,
  creature_name: null,
  creature_type: h.creature_type,
  created_at: daysAgo(h.total + 2),
  updated_at: daysAgo(0),
  currentStreak: h.streak,
  totalDays: h.total,
  completedToday: i !== 4,
  stage: h.stage,
  logs: [],
  // carry these for the Wrapped helper stubs below
  _streak: h.streak,
  _total: h.total,
  _stage: h.stage,
})) as (HabitWithStats & { _streak: number; _total: number; _stage: number })[];

// Helper stubs Tend Wrapped needs — derived from the mock rows.
const byId = (id: string) => MOCK_HABITS.find((h) => h.id === id);
const wrappedProps = {
  habits: MOCK_HABITS as HabitWithStats[],
  isDone: (id: string, date: string) => {
    const h = byId(id) as (typeof MOCK_HABITS)[number] | undefined;
    if (!h) return false;
    // "done" on the most-recent `_streak` days.
    const n = Math.round((Date.now() - new Date(date + "T00:00:00").getTime()) / 86400000);
    return n >= 0 && n < h._streak;
  },
  getBestStreak: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._streak ?? 0,
  getTotal: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._total ?? 0,
  getCleanDays: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._streak ?? 0,
  getStage: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._stage ?? 0,
  coins: 340,
  totalSaved: 186,
};

type View =
  | "gallery" | "onboarding" | "wellness" | "wrapped" | "you" | "breathe" | "nav";

const VIEWS: { key: View; label: string }[] = [
  { key: "gallery", label: "🐉 Dragon art" },
  { key: "onboarding", label: "🥚 Onboarding" },
  { key: "wellness", label: "🧘 Wellness" },
  { key: "wrapped", label: "✨ Wrapped" },
  { key: "you", label: "👤 You screen" },
  { key: "breathe", label: "🌬 Breathe" },
  { key: "nav", label: "📱 Bottom nav" },
];

/* ───────────────────────── page ───────────────────────── */

export default function PreviewPage() {
  const [dark, setDark] = useState(false);
  const [view, setView] = useState<View>("gallery");
  const [navTab, setNavTab] = useState<"garden" | "insights" | "wellness" | "you">("garden");
  const th = dark ? THEME.dark : THEME.light;

  return (
    <div style={{ minHeight: "100dvh", background: th.bg, color: th.text }}>
      {/* Harness top bar (not part of the product — the QA chrome) */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50, background: th.card,
          borderBottom: `1px solid ${th.cardBorder}`, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        }}
      >
        <strong style={{ fontSize: 15 }}>Tend · preview harness</strong>
        <span style={{ fontSize: 12, color: th.textMuted }}>mock data · no auth · not the real app</span>
        <button
          onClick={() => setDark((d) => !d)}
          style={{
            marginLeft: "auto", border: `1px solid ${th.cardBorder}`, background: th.hoverBg,
            color: th.text, borderRadius: 999, padding: "6px 14px", fontSize: 13, cursor: "pointer",
          }}
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      {/* View switcher */}
      <nav
        style={{
          display: "flex", gap: 8, overflowX: "auto", padding: "12px 14px",
          borderBottom: `1px solid ${th.cardBorder}`,
        }}
      >
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              whiteSpace: "nowrap", borderRadius: 999, padding: "8px 14px", fontSize: 13,
              cursor: "pointer", fontWeight: view === v.key ? 700 : 500,
              border: `1px solid ${view === v.key ? "transparent" : th.cardBorder}`,
              background: view === v.key ? "#ef7d3a" : th.hoverBg,
              color: view === v.key ? "#fff" : th.text,
            }}
          >
            {v.label}
          </button>
        ))}
      </nav>

      {/* Phone-width stage so it reads like the real mobile product */}
      <main style={{ maxWidth: 460, margin: "0 auto", padding: "18px 14px 120px" }}>
        {view === "gallery" && <DragonGallery th={th} />}
        {view === "onboarding" && <Framed th={th}><Onboarding onComplete={() => setView("gallery")} /></Framed>}
        {view === "wellness" && (
          <WellnessHub th={th} darkMode={dark} onBreathe={() => setView("breathe")} onSaveGratitude={() => {}} />
        )}
        {view === "you" && (
          <YouScreen
            th={th} darkMode={dark} season={"spring" as SeasonKey}
            profile={{ firstName: "Jonny", email: "you@tend.app" }}
            isPro={false} coins={340} dragonCount={5} bestStreak={41}
            onSeasonChange={() => {}} onToggleDark={() => setDark((d) => !d)}
            onOpenGallery={() => setView("gallery")} onOpenShop={() => {}}
            onOpenSettings={() => {}} onManageSubscription={() => {}}
            onUpgrade={() => {}} onSignOut={() => {}}
          />
        )}
      </main>

      {/* Full-screen overlays render outside the phone stage */}
      {view === "wrapped" && <TendWrapped {...wrappedProps} onClose={() => setView("gallery")} />}
      {view === "breathe" && (
        <BreathingTimer
          th={th}
          habit={{ name: "Morning run", color: "#ef7d3a", id: "mock-0" }}
          onComplete={() => setView("gallery")}
          onClose={() => setView("gallery")}
        />
      )}

      {/* Bottom nav preview: always mounted on its own tab so it's tappable */}
      {view === "nav" && (
        <>
          <div style={{ textAlign: "center", color: th.textSub, padding: "40px 0", fontSize: 14 }}>
            Tap the tabs below — active tab is <strong style={{ color: th.text }}>{navTab}</strong>.
          </div>
          <BottomNav active={navTab} onNavigate={setNavTab} th={th} darkMode={dark} youBadge />
        </>
      )}
    </div>
  );
}

/* A soft card frame so component overlays that expect a full page still read well. */
function Framed({ th, children }: { th: (typeof THEME)["light"]; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${th.cardBorder}`, borderRadius: 20, overflow: "hidden",
        background: th.card, minHeight: 560, position: "relative",
      }}
    >
      {children}
    </div>
  );
}

/* ── Dragon-art gallery: the emotional core, all 36 species, egg↔dragon toggle ── */
function DragonGallery({ th }: { th: (typeof THEME)["light"] }) {
  const [hatched, setHatched] = useState(true);
  const rows = useMemo(() => DRAGON_SPECIES, []);
  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>The 36 dragons</h1>
        <button
          onClick={() => setHatched((h) => !h)}
          style={{
            marginLeft: "auto", borderRadius: 999, padding: "7px 14px", fontSize: 13, cursor: "pointer",
            border: "none", background: "#ef7d3a", color: "#fff", fontWeight: 600,
          }}
        >
          {hatched ? "🥚 Show eggs" : "🐉 Hatch all"}
        </button>
      </div>
      <p style={{ color: th.textSub, fontSize: 14, margin: "0 0 18px" }}>
        Every habit is a dragon egg that hatches and evolves as you tend it. 20 common · 10 rare · 6 legendary.
      </p>

      {/* Hero — the most-tended dragon, shown large via the real Creature component */}
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          padding: "24px 0 28px", borderRadius: 20, background: th.hoverBg,
          border: `1px solid ${th.cardBorder}`, marginBottom: 18,
        }}
      >
        <Creature stage={hatched ? 4 : 0} color="#ef7d3a" creatureType={5} size={140} happy />
        <strong style={{ fontSize: 16 }}>{getDragonSpecies(5).name}</strong>
        <span style={{ fontSize: 12, color: th.textMuted }}>
          {STAGE_LABELS[hatched ? 4 : 0]} · legendary · fire
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {rows.map((sp) => {
          const rc = RARITY_COLORS[sp.rarity];
          const ec = ELEMENT_COLORS[sp.element];
          return (
            <div
              key={sp.id}
              style={{
                borderRadius: 16, padding: "12px 6px 10px", textAlign: "center",
                background: th.card, border: `1px solid ${th.cardBorder}`,
                boxShadow: th.cardShadow,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDragonSprite(hatched ? 4 : 0, sp.id)}
                alt={sp.name}
                width={64}
                height={64}
                style={{ objectFit: "contain", imageRendering: "auto" }}
              />
              <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 4, color: th.text }}>{sp.name}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 5 }}>
                <span style={{ fontSize: 9.5, padding: "1px 6px", borderRadius: 999, background: ec.bg, color: ec.text }}>
                  {ec.icon} {sp.element}
                </span>
              </div>
              <div
                style={{
                  fontSize: 9, marginTop: 4, padding: "1px 6px", borderRadius: 999, display: "inline-block",
                  background: rc.bg, color: sp.rarity === "common" ? th.textMuted : rc.text,
                  border: `1px solid ${rc.border}`,
                }}
              >
                {rc.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
