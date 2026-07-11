"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Creature } from "@/components/creature";
import { Share2, X, Sparkles, ChevronRight } from "lucide-react";
import { STAGE_LABELS } from "@/lib/constants";
import { computeDayOfWeekRates } from "@/lib/progress";
import { daysAgo, haptic } from "@/lib/utils";
import type { HabitWithStats } from "@/types";

interface TendWrappedProps {
  habits: HabitWithStats[];
  isDone: (id: string, date: string) => boolean;
  getBestStreak: (id: string) => number;
  getTotal: (id: string) => number;
  getCleanDays: (id: string) => number;
  getStage: (id: string) => number;
  coins: number;
  totalSaved: number;
  onClose: () => void;
}

interface Persona {
  title: string;
  blurb: string;
  emoji: string;
  color: string;
}

/**
 * Tend Wrapped — a full-screen, tap-to-advance "story" that turns a person's
 * habit history into a warm, shareable celebration (Spotify-Wrapped pattern,
 * garden aesthetic). Showcases the real dragon art as the emotional payoff and
 * ends on a share-optimized summary card. Zero shame, all encouragement.
 */
export function TendWrapped({
  habits, isDone, getBestStreak, getTotal, getCleanDays, getStage,
  coins, totalSaved, onClose,
}: TendWrappedProps) {
  const buildHabits = habits.filter((h) => h.category !== "quit");
  const quitHabits = habits.filter((h) => h.category === "quit");

  // ── Compute the story stats once ──
  const stats = useMemo(() => {
    // Total days tended = every check-in / clean day across all habits
    const totalDays = habits.reduce((sum, h) => sum + getTotal(h.id), 0);

    // The single strongest run anyone has going or has ever had
    let longestStreak = 0;
    let longestHabit: HabitWithStats | null = null;
    habits.forEach((h) => {
      const best = getBestStreak(h.id);
      if (best > longestStreak) { longestStreak = best; longestHabit = h; }
    });

    // The most-tended habit → its dragon is the hero of the reel
    let topTotal = -1;
    let topHabit: HabitWithStats | null = null;
    habits.forEach((h) => {
      const t = getTotal(h.id);
      if (t > topTotal) { topTotal = t; topHabit = h; }
    });

    // Best day of the week — same tested kernel + 30-day window as Insights, so
    // the two surfaces can never name different "best days" for the same person.
    // The kernel skips days before a habit existed (no bogus 0% from empty days).
    const last30 = Array.from({ length: 30 }, (_, i) => daysAgo(i));
    const dayRates = computeDayOfWeekRates(
      last30,
      buildHabits.map((h) => ({ id: h.id, startDate: h.created_at.slice(0, 10) })),
      isDone,
      (d) => new Date(d + "T12:00:00").getDay(),
    );
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let bestDayIdx = 0;
    let bestDayRate = -1;
    dayRates.forEach((r, i) => {
      if (r.total > 0 && r.pct > bestDayRate) { bestDayRate = r.pct; bestDayIdx = i; }
    });
    const hasDayData = bestDayRate > 0;

    // Dragons hatched = habits past the Egg stage
    const dragonsHatched = habits.filter((h) => getStage(h.id) >= 1).length;
    const elders = habits.filter((h) => getStage(h.id) >= 4).length;

    // Total clean days across quit habits
    const cleanDays = quitHabits.reduce((sum, h) => sum + getCleanDays(h.id), 0);

    return {
      totalDays, longestStreak, longestHabit: longestHabit as HabitWithStats | null,
      topHabit: topHabit as HabitWithStats | null, topTotal,
      bestDay: dayNames[bestDayIdx], hasDayData,
      dragonsHatched, elders, cleanDays,
      habitCount: habits.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, isDone]);

  // ── Persona / identity moment ──
  const persona = useMemo<Persona>(() => {
    const { longestStreak, cleanDays, dragonsHatched } = stats;
    if (quitHabits.length > 0 && cleanDays >= 7 && cleanDays >= longestStreak) {
      return { title: "The Chain-Breaker", emoji: "⛓️", color: "#38bdf8",
        blurb: "You looked a hard loop in the eye and kept walking. That takes a rare kind of strength." };
    }
    if (longestStreak >= 21) {
      return { title: "The Devoted", emoji: "🔥", color: "#f59e0b",
        blurb: "You show up when it's easy and when it isn't. Consistency like yours moves mountains." };
    }
    if (dragonsHatched >= 3) {
      return { title: "The Dragonkeeper", emoji: "🐉", color: "#8B5CF6",
        blurb: "A whole brood is growing under your care. You tend many things gently, all at once." };
    }
    if (buildHabits.length > 0 && stats.totalDays >= 5) {
      return { title: "The Steady Gardener", emoji: "🌱", color: "#4caf50",
        blurb: "Small, quiet days, watered one at a time. This is how forests are grown." };
    }
    return { title: "The New Sprout", emoji: "🌿", color: "#4ade80",
      blurb: "Every dragon starts as an egg. You've begun — and beginning is the hardest part." };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  // ── Build the card reel ──
  const heroHabit = stats.topHabit || stats.longestHabit || habits[0] || null;
  const heroColor = heroHabit?.color || "#4caf50";
  const heroStage = heroHabit ? getStage(heroHabit.id) : 0;

  type Card = { key: string; render: () => React.ReactNode; bg: string; accent: string };
  const cards: Card[] = [];

  // 0 — Cover
  cards.push({
    key: "cover", bg: "#4caf50", accent: "#4ade80",
    render: () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ animation: "wFloat 3.5s ease-in-out infinite" }}>
          <Creature stage={heroStage} color={heroColor} happy size={128} creatureType={heroHabit?.creature_type ?? null} habitId={heroHabit?.id} />
        </div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 800, color: "#fff", marginTop: 20, lineHeight: 1.05, letterSpacing: "-1px" }}>
          Your Tend<br />Story
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 12, maxWidth: 240, marginInline: "auto", lineHeight: 1.5 }}>
          A little look at everything you&rsquo;ve tended so far. No numbers to fear here &mdash; only ones to be proud of.
        </p>
        <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", animation: "wPulse 2s ease-in-out infinite" }}>
          Tap to begin <ChevronRight size={14} />
        </div>
      </div>
    ),
  });

  // 1 — Total days tended
  cards.push({
    key: "days", bg: "#3a7d44", accent: "#4ade80",
    render: () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>You tended</div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 92, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-4px", margin: "8px 0", animation: "wPop .5s cubic-bezier(.34,1.56,.64,1)" }}>
          {stats.totalDays}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{stats.totalDays === 1 ? "day" : "days"}, all told</div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 14, maxWidth: 250, marginInline: "auto", lineHeight: 1.5 }}>
          {stats.totalDays === 0
            ? "Your very first day is waiting. Tend one habit today and the count begins."
            : "Every one of those was a moment you chose to care for yourself. They add up to something real."}
        </p>
      </div>
    ),
  });

  // 2 — Longest streak
  if (stats.longestStreak > 0) {
    cards.push({
      key: "streak", bg: "#b45309", accent: "#f59e0b",
      render: () => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46, animation: "wFloat 3s ease-in-out infinite" }}>{"🔥"}</div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 10 }}>Longest streak</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 80, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-3px", margin: "4px 0", animation: "wPop .5s cubic-bezier(.34,1.56,.64,1)" }}>
            {stats.longestStreak}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{stats.longestStreak === 1 ? "day in a row" : "days in a row"}</div>
          {stats.longestHabit && (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 14, lineHeight: 1.5 }}>
              on <strong style={{ color: "#fff" }}>{stats.longestHabit.creature_name || stats.longestHabit.name}</strong>. That&rsquo;s a fire you kept lit.
            </p>
          )}
        </div>
      ),
    });
  }

  // 3 — Hero dragon showcase
  if (heroHabit && stats.topTotal > 0) {
    cards.push({
      key: "hero", bg: "#6d28d9", accent: "#8B5CF6",
      render: () => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Your strongest bond</div>
          <div style={{ animation: "wFloat 3.5s ease-in-out infinite" }}>
            <Creature stage={heroStage} color={heroColor} happy size={132} creatureType={heroHabit.creature_type ?? null} habitId={heroHabit.id} />
          </div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 12 }}>
            {heroHabit.creature_name || STAGE_LABELS[heroStage]}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
            {STAGE_LABELS[heroStage]} &middot; {heroHabit.name}
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 14, lineHeight: 1.5, maxWidth: 250, marginInline: "auto" }}>
            You tended this one <strong style={{ color: "#fff" }}>{stats.topTotal}</strong> {stats.topTotal === 1 ? "time" : "times"} &mdash; more than any other. Look how far it&rsquo;s come.
          </p>
        </div>
      ),
    });
  }

  // 4 — Best day
  if (stats.hasDayData) {
    cards.push({
      key: "bestday", bg: "#0e7490", accent: "#38bdf8",
      render: () => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46, animation: "wFloat 3s ease-in-out infinite" }}>{"☀️"}</div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 10 }}>You shine brightest on</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 46, fontWeight: 800, color: "#fff", margin: "8px 0", animation: "wPop .5s cubic-bezier(.34,1.56,.64,1)" }}>
            {stats.bestDay}s
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 8, maxWidth: 250, marginInline: "auto", lineHeight: 1.5 }}>
            That&rsquo;s your most-tended day of the week. A little pattern worth leaning into.
          </p>
        </div>
      ),
    });
  }

  // 5 — Clean days (quit habits)
  if (quitHabits.length > 0 && (stats.cleanDays > 0 || totalSaved > 0)) {
    cards.push({
      key: "clean", bg: "#065f46", accent: "#34d399",
      render: () => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46, animation: "wFloat 3s ease-in-out infinite" }}>{"🛡️"}</div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 10 }}>Days you stayed free</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 80, fontWeight: 800, color: "#fff", lineHeight: 1, margin: "4px 0", animation: "wPop .5s cubic-bezier(.34,1.56,.64,1)" }}>
            {stats.cleanDays}
          </div>
          {totalSaved > 0 && (
            <div style={{ fontSize: 16, fontWeight: 700, color: "#34d399", marginTop: 6 }}>
              and about ${Math.round(totalSaved)} kept in your pocket
            </div>
          )}
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 12, maxWidth: 250, marginInline: "auto", lineHeight: 1.5 }}>
            Every clean day was a choice. You made a lot of them.
          </p>
        </div>
      ),
    });
  }

  // 6 — Dragons hatched / coins
  cards.push({
    key: "collection", bg: "#a16207", accent: "#fbbf24",
    render: () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>Your little brood</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 20 }}>
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 56, fontWeight: 800, color: "#fff", lineHeight: 1, animation: "wPop .5s cubic-bezier(.34,1.56,.64,1)" }}>{stats.dragonsHatched}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{stats.dragonsHatched === 1 ? "dragon hatched" : "dragons hatched"}</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 56, fontWeight: 800, color: "#fbbf24", lineHeight: 1, animation: "wPop .6s cubic-bezier(.34,1.56,.64,1)" }}>{coins}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>coins earned</div>
          </div>
        </div>
        {stats.elders > 0 && (
          <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.12)", fontSize: 13, fontWeight: 700, color: "#fff" }}>
            <Sparkles size={13} /> {stats.elders} reached Elder Dragon
          </div>
        )}
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 18, maxWidth: 250, marginInline: "auto", lineHeight: 1.5 }}>
          {stats.dragonsHatched === 0
            ? "Keep tending and the first egg will crack open. It&rsquo;s closer than you think."
            : "Each one grew because you kept coming back. That&rsquo;s the whole magic."}
        </p>
      </div>
    ),
  });

  // 7 — Persona / identity
  cards.push({
    key: "persona", bg: persona.color, accent: persona.color,
    render: () => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>This season, you were</div>
        <div style={{ fontSize: 56, marginTop: 14, animation: "wFloat 3.2s ease-in-out infinite" }}>{persona.emoji}</div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 38, fontWeight: 800, color: "#fff", marginTop: 8, lineHeight: 1.1, animation: "wPop .5s cubic-bezier(.34,1.56,.64,1)" }}>
          {persona.title}
        </div>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 14, maxWidth: 270, marginInline: "auto", lineHeight: 1.55 }}>
          {persona.blurb}
        </p>
      </div>
    ),
  });

  // 8 — Final summary / share card
  cards.push({
    key: "share", bg: "#0a0e18", accent: "#4ade80",
    render: () => (
      <div style={{ width: "100%" }}>
        <div ref={shareCardRef} style={{
          borderRadius: 22, padding: "26px 22px 20px", textAlign: "center",
          background: `linear-gradient(160deg, #0a0e18 0%, ${heroColor}22 55%, #0a0e18 100%)`,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${heroColor}22`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>My Tend Story</div>
          <div style={{ margin: "8px 0 4px" }}>
            <Creature stage={heroStage} color={heroColor} happy size={86} creatureType={heroHabit?.creature_type ?? null} habitId={heroHabit?.id} />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: persona.color, marginBottom: 14 }}>
            {persona.emoji} {persona.title}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { n: stats.totalDays, l: "days tended" },
              { n: stats.longestStreak, l: "day best streak" },
              { n: stats.dragonsHatched, l: "dragons hatched" },
              { n: coins, l: "coins earned" },
            ].map((s) => (
              <div key={s.l} style={{ padding: "12px 8px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 2, textTransform: "uppercase" }}>
            {"🌿"} Tend
          </div>
        </div>
        <button
          onClick={handleShare}
          disabled={sharing}
          style={{
            marginTop: 16, width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
            background: "linear-gradient(135deg, #4ade80, #22c55e)", color: "#06210f",
            fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 8px 28px rgba(74,222,128,0.35)",
          }}
        >
          <Share2 size={17} /> {sharing ? "Sharing…" : "Share my story"}
        </button>
        <button
          onClick={onClose}
          style={{
            marginTop: 10, width: "100%", padding: "12px 0", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
            color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Keep tending {"🌿"}
        </button>
      </div>
    ),
  });

  // ── Navigation ──
  const [idx, setIdx] = useState(0);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const lastCard = idx >= cards.length - 1;

  const go = useCallback((dir: 1 | -1) => {
    setIdx((i) => {
      const next = i + dir;
      if (next < 0) return 0;
      if (next > cards.length - 1) return cards.length - 1;
      haptic("light");
      return next;
    });
  }, [cards.length]);

  // Keyboard support (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    haptic("success");
    try {
      const text =
        `My Tend Story ${"🌿"}\n` +
        `${stats.totalDays} days tended · ${stats.longestStreak}-day best streak · ` +
        `${stats.dragonsHatched} ${stats.dragonsHatched === 1 ? "dragon" : "dragons"} hatched\n` +
        `I'm ${persona.title}. Grow your habits with Tend.`;
      if (navigator.share) {
        await navigator.share({ title: "My Tend Story", text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert("Copied your story to clipboard!");
      }
    } catch {
      /* user cancelled */
    } finally {
      setSharing(false);
    }
  }, [stats, persona]);

  // Clamp: the card set is dynamic (some cards are conditional on stats), so if it
  // shrinks while open, idx could exceed the last index → cards[idx] undefined →
  // crash on current.bg. Clamp defensively rather than trust go()'s tap-time clamp.
  const current = cards[Math.min(idx, cards.length - 1)];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: `radial-gradient(140% 100% at 50% 0%, ${current.bg} 0%, #0a0e18 78%)`,
        transition: "background .5s ease",
        display: "flex", flexDirection: "column",
        paddingTop: "max(14px, env(safe-area-inset-top))",
        paddingBottom: "max(18px, env(safe-area-inset-bottom))",
      }}
    >
      <style>{`
        @keyframes wFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
        @keyframes wPop { 0% { transform: scale(.6); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
        @keyframes wPulse { 0%,100% { opacity: .45 } 50% { opacity: .9 } }
        @keyframes wCardIn { 0% { opacity: 0; transform: translateY(14px) scale(.98) } 100% { opacity: 1; transform: none } }
        @keyframes wStar { 0%,100% { opacity: .12 } 50% { opacity: .5 } }
      `}</style>

      {/* Progress segments */}
      <div style={{ display: "flex", gap: 4, padding: "0 14px", flexShrink: 0 }}>
        {cards.map((c, i) => (
          <div key={c.key} style={{ flex: 1, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#fff", width: i < idx ? "100%" : i === idx ? "100%" : "0%", transition: "width .3s ease" }} />
          </div>
        ))}
      </div>

      {/* Close */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px 0", flexShrink: 0 }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "rgba(255,255,255,0.8)", display: "flex" }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Faint drifting stars */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {STAR_POSITIONS.map((s, i) => (
          <div key={i} style={{
            position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r,
            borderRadius: "50%", background: "#fff", animation: `wStar ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
          }} />
        ))}
      </div>

      {/* The active card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 26px", position: "relative", zIndex: 1, minHeight: 0 }}>
        <div key={current.key} style={{ width: "100%", maxWidth: 340, animation: "wCardIn .45s ease" }}>
          {current.render()}
        </div>
      </div>

      {/* Tap zones (hidden on the final share card so buttons work) */}
      {!lastCard && (
        <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 2 }}>
          <button aria-label="Previous" onClick={() => go(-1)} style={{ flex: "0 0 30%", background: "transparent", border: "none", cursor: "pointer" }} />
          <button aria-label="Next" onClick={() => go(1)} style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer" }} />
        </div>
      )}
    </div>
  );
}

// Deterministic star field (no Math.random at module scope)
const STAR_POSITIONS = [
  { x: 12, y: 14, r: 2 }, { x: 78, y: 10, r: 1.5 }, { x: 45, y: 8, r: 2 },
  { x: 88, y: 30, r: 1 }, { x: 22, y: 40, r: 1.5 }, { x: 66, y: 24, r: 1 },
  { x: 8, y: 62, r: 1.5 }, { x: 92, y: 58, r: 2 }, { x: 34, y: 70, r: 1 },
  { x: 58, y: 80, r: 1.5 }, { x: 18, y: 86, r: 1 }, { x: 80, y: 82, r: 1.5 },
];
