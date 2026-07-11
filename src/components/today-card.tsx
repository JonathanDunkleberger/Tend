"use client";

import { useCallback, useRef, useState } from "react";
import { Share2, X } from "lucide-react";
import { Creature } from "@/components/creature";
import { StreakFlame } from "@/components/streak-flame";

/**
 * TodayCard — a shareable, widget-style "Today" hero.
 *
 * The single screenshot that captures a whole day of tending: your featured
 * dragon nested inside a progress ring that fills as you tend, your streak
 * flame, how many dragons you've hatched, and a warm one-line read of the day.
 * Designed to be screenshotted to a phone home screen or shared — so it's a
 * self-contained, always-dark "garden at night" surface (share cards read best
 * dark, regardless of the in-app theme) with the Tend wordmark for reach.
 *
 * `TodayCardVisual` is the pure card (no overlay, no buttons) so the /preview
 * harness can render + file://-verify the composition offline; `TodayCard`
 * wraps it in a full-screen share overlay (Web Share API + clipboard fallback,
 * mirroring share-card.tsx).
 *
 * All presentation — no state beyond the share button's pending flag.
 */

export interface TodayCardData {
  /** Local date for the header (defaults to now). */
  date?: Date;
  /** Build habits tended today / total active build habits. */
  tended: number;
  total: number;
  /** Featured dragon (the longest-streak habit). */
  heroStage: number;
  heroColor: string;
  heroCreatureType?: number | null;
  heroHabitId?: string;
  heroName: string | null;
  heroHabitName: string;
  /** Longest current streak across all habits. */
  bestStreak: number;
  /** How many dragons have hatched (stage ≥ 1). */
  dragonCount: number;
}

/** Warm one-line read of the day, keyed off today's completion ratio. */
function dayLine(pct: number, allDoneEmpty: boolean): string {
  if (allDoneEmpty) return "A fresh day to tend 🌱";
  if (pct >= 1) return "Every egg tended today ✨";
  if (pct >= 0.5) return "Over halfway — lovely momentum 🌿";
  if (pct > 0) return "A gentle start — keep going 🌤";
  return "A fresh day to tend 🌱";
}

/* ── The pure card visual (file://-verifiable) ── */
export function TodayCardVisual({ data, width = 320 }: { data: TodayCardData; width?: number }) {
  const {
    date = new Date(),
    tended, total,
    heroStage, heroColor, heroCreatureType, heroHabitId, heroName, heroHabitName,
    bestStreak, dragonCount,
  } = data;

  const pct = total > 0 ? tended / total : 0;
  const allDone = pct >= 1 && total > 0;
  const dateStr = date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  // Progress ring geometry (SVG, SSR-stable).
  const RING = Math.round(width * 0.66); // ring box
  const stroke = 9;
  const r = (RING - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, pct)) * circ;
  const cxy = RING / 2;
  const heroSize = Math.round(RING * 0.62);

  // Deterministic starfield (no Math.random → stable SSR snapshot).
  const stars = [
    { top: "8%", left: "16%", s: 2, o: 0.35 },
    { top: "14%", right: "20%", s: 3, o: 0.5 },
    { top: "26%", left: "10%", s: 2, o: 0.28 },
    { top: "6%", left: "62%", s: 2, o: 0.4 },
    { top: "20%", right: "12%", s: 2, o: 0.3 },
    { bottom: "30%", left: "8%", s: 2, o: 0.22 },
    { bottom: "24%", right: "14%", s: 3, o: 0.28 },
  ];

  return (
    <div
      style={{
        width,
        borderRadius: 26,
        overflow: "hidden",
        position: "relative",
        background: `radial-gradient(120% 80% at 50% 8%, ${heroColor}26 0%, transparent 55%), linear-gradient(165deg, #0c1120 0%, #0a0e18 60%, #070a12 100%)`,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 24px 70px rgba(0,0,0,0.5), 0 0 46px ${heroColor}18`,
        padding: "22px 22px 20px",
        textAlign: "center",
        fontFamily: "inherit",
      }}
    >
      {/* Starfield */}
      {stars.map((st, i) => (
        <div key={i} style={{
          position: "absolute", ...st, width: st.s, height: st.s,
          borderRadius: "50%", background: "white", opacity: st.o,
        }} />
      ))}

      {/* Header row: wordmark + date */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px" }}>
          tend<span style={{ color: "#4caf50" }}>.</span>
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: 0.2 }}>{dateStr}</span>
      </div>

      {/* Ring + dragon — the money shot */}
      <div style={{ position: "relative", width: RING, height: RING, margin: "8px auto 6px" }}>
        <svg width={RING} height={RING} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)", display: "block" }}>
          <circle cx={cxy} cy={cxy} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} />
          <circle
            cx={cxy} cy={cxy} r={r} fill="none" stroke={allDone ? "#4ade80" : heroColor} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{
              transition: "stroke-dasharray .7s cubic-bezier(.4,0,.2,1)",
              filter: `drop-shadow(0 0 6px ${allDone ? "#4ade80" : heroColor}bb)`,
            }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Creature stage={heroStage} color={heroColor} happy={allDone} size={heroSize} creatureType={heroCreatureType} habitId={heroHabitId} />
        </div>
      </div>

      {/* Progress numerals */}
      <div style={{ position: "relative", marginTop: 2 }}>
        <span style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1 }}>
          {tended}<span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>/{total}</span>
        </span>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: allDone ? "#4ade80" : "rgba(255,255,255,0.5)", marginTop: 4 }}>
          {allDone ? "All tended" : "Tended today"}
        </div>
      </div>

      {/* Hero identity */}
      {(heroName || heroHabitName) && (
        <div style={{ position: "relative", marginTop: 10, fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
          {heroName ? <><strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>{heroName}</strong> · {heroHabitName}</> : heroHabitName}
        </div>
      )}

      {/* Stat chips: streak flame + dragons hatched */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", gap: 10, marginTop: 14 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 13px",
          borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <StreakFlame streak={bestStreak} size={18} showCount />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>day streak</span>
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 13px",
          borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{ fontSize: 14 }}>🐉</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{dragonCount}</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{dragonCount === 1 ? "dragon" : "dragons"}</span>
        </span>
      </div>

      {/* Warm one-line read */}
      <div style={{ position: "relative", marginTop: 16, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>
        {dayLine(pct, total === 0)}
      </div>

      {/* Footer wordmark */}
      <div style={{ position: "relative", marginTop: 14, fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: 2.5, textTransform: "uppercase" }}>
        🌿 tend your habits
      </div>
    </div>
  );
}

/* ── Full-screen share overlay ── */
export function TodayCard({ data, onClose }: { data: TodayCardData; onClose: () => void }) {
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const pct = data.total > 0 ? data.tended / data.total : 0;
  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const line = pct >= 1
        ? `I tended every habit today 🌱 — ${data.bestStreak}-day streak going strong.`
        : `${data.tended}/${data.total} habits tended today 🌿 — ${data.bestStreak}-day streak.`;
      if (navigator.share) {
        await navigator.share({ title: "Tend — my day", text: `${line}\n\nGrow your habits with Tend 🐉` });
      } else {
        await navigator.clipboard.writeText(`${line} #Tend`);
        alert("Copied to clipboard!");
      }
    } catch {
      /* user cancelled */
    } finally {
      setSharing(false);
    }
  }, [data, pct]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        padding: 20, animation: "fadeUp 0.3s ease",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)",
          border: "none", borderRadius: 10, padding: 8, cursor: "pointer",
          color: "rgba(255,255,255,0.6)", display: "flex",
        }}
      >
        <X size={18} />
      </button>

      <div ref={cardRef}>
        <TodayCardVisual data={data} width={300} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20, width: "100%", maxWidth: 300 }}>
        <button
          onClick={handleShare}
          disabled={sharing}
          style={{
            flex: 1, padding: "14px 0", borderRadius: 14, border: "none",
            background: `linear-gradient(135deg, ${data.heroColor}, ${data.heroColor}cc)`,
            color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: `0 4px 20px ${data.heroColor}33`,
          }}
        >
          <Share2 size={16} />
          {sharing ? "Sharing…" : "Share my day"}
        </button>
      </div>
    </div>
  );
}
