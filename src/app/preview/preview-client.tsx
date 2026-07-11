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
import { THEME, STAGE_LABELS, STAGE_THRESHOLDS } from "@/lib/constants";
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
import { MultiHabitHeatmap } from "@/components/multi-habit-heatmap";
import { Constellation } from "@/components/constellation";
import { TerrariumScene } from "@/components/terrarium-scene";
import { Ceremony } from "@/components/ceremony";

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

// Helper stubs the analytics + Wrapped surfaces need — derived from the mock rows.
const byId = (id: string) => MOCK_HABITS.find((h) => h.id === id);

// A realistic completion pattern: the current streak is a solid recent block,
// older days fill in at ~68% density via a deterministic hash so the heatmap /
// day-of-week / consistency views read like a real, lived-in history (not a
// perfect wall of green). Deterministic → the file:// SSR snapshot is stable.
const mockIsDone = (id: string, date: string) => {
  const h = byId(id) as (typeof MOCK_HABITS)[number] | undefined;
  if (!h) return false;
  const n = Math.round((Date.now() - new Date(date + "T00:00:00").getTime()) / 86400000);
  if (n < 0 || n >= h._total + 6) return false;
  if (n < h._streak) return true; // current streak intact
  const hash = (id.charCodeAt(id.length - 1) * 2654435761 + n * 40503) >>> 0;
  return hash % 100 < 68;
};

// A few days of "three good things" so the Insights gratitude card has substance.
const mockGratitude = [
  { date: daysAgo(0), items: ["Slow coffee on the balcony", "A long walk with the dog", "Finished the hard task"] },
  { date: daysAgo(1), items: ["Called my mum", "Sunlight after the rain"] },
  { date: daysAgo(3), items: ["Rest day, no guilt", "A good book chapter", "Cooked something new"] },
];

const helpers = {
  habits: MOCK_HABITS as HabitWithStats[],
  isDone: mockIsDone,
  getStreak: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._streak ?? 0,
  getBestStreak: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._streak ?? 0,
  getTotal: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._total ?? 0,
  getCleanDays: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._streak ?? 0,
  getStage: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._stage ?? 0,
  getStageForId: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?._stage ?? 0,
  isHappy: (id: string) => (byId(id) as (typeof MOCK_HABITS)[number])?.completedToday ?? false,
  coins: 340,
  totalSaved: 186,
  gratitudeLog: mockGratitude,
};

const wrappedProps = {
  habits: helpers.habits,
  isDone: helpers.isDone,
  getBestStreak: helpers.getBestStreak,
  getTotal: helpers.getTotal,
  getCleanDays: helpers.getCleanDays,
  getStage: helpers.getStage,
  coins: helpers.coins,
  totalSaved: helpers.totalSaved,
};

export type View =
  | "garden" | "insights" | "gallery" | "onboarding" | "wellness" | "wrapped" | "you" | "breathe" | "nav"
  | "hatch" | "evolve";

const VIEWS: { key: View; label: string }[] = [
  { key: "garden", label: "🌱 Garden" },
  { key: "insights", label: "📊 Insights" },
  { key: "hatch", label: "🥚 Hatch" },
  { key: "evolve", label: "🐉 Evolve" },
  { key: "gallery", label: "🐉 Dragon art" },
  { key: "onboarding", label: "🥚 Onboarding" },
  { key: "wellness", label: "🧘 Wellness" },
  { key: "wrapped", label: "✨ Wrapped" },
  { key: "you", label: "👤 You screen" },
  { key: "breathe", label: "🌬 Breathe" },
  { key: "nav", label: "📱 Bottom nav" },
];

/* ───────────────────────── page ───────────────────────── */

export function PreviewClient({ initialView = "garden", initialDark = false }: { initialView?: View; initialDark?: boolean }) {
  const [dark, setDark] = useState(initialDark);
  const [view, setView] = useState<View>(initialView);
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
        {view === "garden" && <GardenPreview th={th} dark={dark} />}
        {view === "insights" && <InsightsPreview th={th} dark={dark} />}
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
      {view === "hatch" && <CeremonyPreview kind="hatch" />}
      {view === "evolve" && <CeremonyPreview kind="evolve" />}
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

/* Hatch / evolution ceremony preview. Renders the "reveal" money-shot frame on
   first mount (so the offline file:// SSR snapshot captures the finished
   composition); tapping Continue remounts WITHOUT previewPhase so a live browser
   replays the full egg-rock → crack → emerge sequence. */
function CeremonyPreview({ kind }: { kind: "hatch" | "evolve" }) {
  const [nonce, setNonce] = useState(0);
  return (
    <Ceremony
      key={nonce}
      kind={kind}
      stage={kind === "hatch" ? 1 : 3}
      color="#ef7d3a"
      creatureType={5}
      habitName="Morning run"
      creatureName={kind === "evolve" ? "Ember" : null}
      coinReward={kind === "hatch" ? 25 : 50}
      previewPhase={nonce === 0 ? "reveal" : undefined}
      onDone={() => setNonce((n) => n + 1)}
    />
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

/* ── Garden home: the daily-tend surface — real terrarium dragons + today's tend ── */
function GardenPreview({ th, dark }: { th: (typeof THEME)["light"]; dark: boolean }) {
  const doneToday = MOCK_HABITS.filter((h) => h.category !== "quit" && h.completedToday).length;
  const buildTotal = MOCK_HABITS.filter((h) => h.category !== "quit").length;
  const pct = buildTotal ? doneToday / buildTotal : 0;
  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, fontFamily: "'Fraunces',serif" }}>Your garden</h1>
        <span style={{
          marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#d97706",
          background: th.coinBg, padding: "3px 10px", borderRadius: 100,
        }}>🪙 {helpers.coins}</span>
      </div>

      {/* The real terrarium scene — the dragon showcase, the #1 emotional pillar */}
      <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
        <TerrariumScene
          habits={helpers.habits} getStage={helpers.getStageForId} isHappy={helpers.isHappy}
          getStreak={helpers.getStreak} pct={pct} bouncingId={null}
          season={"spring" as SeasonKey} darkMode={dark} ownedItems={[]}
          onCreatureTap={() => {}}
        />
      </div>

      {/* Today's tend — one row per habit, assumes-best one-tap check-off */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 8px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: th.text }}>Today</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 1 ? "#4caf50" : th.textMuted }}>
          🔥 {doneToday}/{buildTotal}
        </span>
        <button style={{
          marginLeft: "auto", fontSize: 11.5, fontWeight: 700, cursor: "pointer",
          border: "none", borderRadius: 100, padding: "6px 12px",
          background: "linear-gradient(135deg,#4caf50,#2e7d32)", color: "#fff",
        }}>✓ All good today</button>
      </div>

      <div style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${th.cardBorder}`, background: th.card }}>
        {MOCK_HABITS.map((h, i) => {
          const quit = h.category === "quit";
          const done = !quit && h.completedToday;
          const stage = h._stage;
          const nextT = stage < 4 ? STAGE_THRESHOLDS[stage + 1] : null;
          const remaining = nextT ? nextT - h._total : 0;
          const warmPct = nextT ? Math.min(1, (h._total - STAGE_THRESHOLDS[stage]) / (nextT - STAGE_THRESHOLDS[stage])) : 1;
          const sub = quit
            ? `${h._streak}d clean · ${STAGE_LABELS[stage]}`
            : done
            ? `${h._streak}d streak · ${STAGE_LABELS[stage]}`
            : remaining > 0
            ? `${STAGE_LABELS[stage]} · ${stage === 0 ? "hatches" : "evolves"} in ${remaining}d`
            : STAGE_LABELS[stage];
          return (
            <div key={h.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              borderBottom: i === MOCK_HABITS.length - 1 ? "none" : `1px solid ${th.cardBorder}`,
            }}>
              <Creature stage={stage} color={h.color} creatureType={h.creature_type ?? 1} size={40} happy={done} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: th.text }}>{h.name}</div>
                <div style={{ fontSize: 11.5, color: th.textSub, marginTop: 1 }}>{sub}</div>
                {/* egg-warming ambient progress */}
                {stage < 4 && (
                  <div style={{ height: 3, borderRadius: 3, background: th.progressBg, marginTop: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.round(warmPct * 100)}%`, borderRadius: 3, background: h.color, opacity: 0.75 }} />
                  </div>
                )}
              </div>
              {/* one-tap check circle */}
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                border: done ? "none" : `2px solid ${th.cardBorder}`,
                background: done ? "#4caf50" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 15, fontWeight: 800,
              }}>{done ? "✓" : quit ? "🛡" : ""}</div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: th.textMuted, marginTop: 12, textAlign: "center" }}>
        Preview approximation of the daily-tend rows — the live app renders these from the monolith.
      </p>
    </div>
  );
}

/* ── Insights: the deep-analytics surface — real heatmap + Constellation ── */
function InsightsPreview({ th, dark }: { th: (typeof THEME)["light"]; dark: boolean }) {
  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      {/* Tend Wrapped launcher — mirrors the real Insights header (Constellation
          below owns the "Insights" title, exactly as in the live app) */}
      <div style={{
        width: "100%", marginBottom: 12, padding: "16px 18px", borderRadius: 18,
        border: "1px solid rgba(139,92,246,0.3)",
        background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(74,222,128,0.12))",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: "linear-gradient(135deg, #8B5CF6, #4ade80)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>✨</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: th.text }}>Your Tend Story</div>
          <div style={{ fontSize: 12, color: th.textSub, marginTop: 1 }}>A shareable look at everything you&rsquo;ve tended</div>
        </div>
      </div>

      <MultiHabitHeatmap habits={helpers.habits} isDone={helpers.isDone} getCleanDays={helpers.getCleanDays} th={th} />
      <Constellation
        habits={helpers.habits} isDone={helpers.isDone} getStreak={helpers.getStreak}
        getTotal={helpers.getTotal} getCleanDays={helpers.getCleanDays} getBestStreak={helpers.getBestStreak}
        getStage={helpers.getStage} th={th} isPro gratitudeLog={helpers.gratitudeLog}
      />
      <p style={{ fontSize: 11, color: th.textMuted, marginTop: 12, textAlign: "center" }}>
        {dark ? "Dark" : "Light"} theme · real heatmap + analytics components with mock history.
      </p>
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
