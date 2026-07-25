"use client";

import { useMemo } from "react";
import {
  Sparkles, TrendingUp, Shield, Flame, Heart, Calendar,
  Crown, Trophy, Lock,
} from "lucide-react";
import { seed, daysAgo, daysBetween, today } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { computeConsistency, computeSynergies, computeDayOfWeekRates, computeStreakSeries } from "@/lib/progress";
import { getSynergyName, STAGE_LABELS } from "@/lib/constants";
import type { ThemeColors } from "@/lib/constants";
import type { HabitWithStats } from "@/types";

interface ConstellationProps {
  habits: HabitWithStats[];
  isDone: (id: string, date: string) => boolean;
  getStreak: (id: string) => number;
  getTotal: (id: string) => number;
  getCleanDays?: (id: string) => number;
  getBestStreak?: (id: string) => number;
  getStage?: (id: string) => number;
  /** ISO dates (YYYY-MM-DD) urges were survived, per quit habit */
  getUrgeDates?: (id: string) => string[];
  isPro?: boolean;
  onUpgrade?: () => void;
  th: ThemeColors;
  gratitudeLog?: { date: string; items: string[] }[];
}

interface Synergy {
  a: number;
  b: number;
  strength: number;
  coCount: number;
  name: string | null;
  label: string;
}

/**
 * Build a smooth (Catmull-Rom → cubic-bézier) SVG path through points given in a
 * normalized 0..100 user space. Used for the momentum curve; the SVG is drawn
 * with preserveAspectRatio="none" + non-scaling stroke so it fills any width
 * while the 2px line stays crisp. `close` extends the path down to the baseline
 * for the area fill.
 */
function smoothPath(pts: { x: number; y: number }[], close = false): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  if (close) d += ` L ${pts[pts.length - 1].x.toFixed(2)} 100 L ${pts[0].x.toFixed(2)} 100 Z`;
  return d;
}

/**
 * A small circular progress ring with the value centered inside. Sequential-by-
 * magnitude fill (the caller passes the graded color) over a recessive track.
 * Pure SVG + an HTML overlay label → renders identically at SSR (file://-verifiable).
 */
function ConsistencyRing({ pct, color, th, size = 42 }: { pct: number; color: string; th: ThemeColors; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, pct / 100)) * circ;
  const cxy = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={cxy} cy={cxy} r={r} fill="none" stroke={th.progressBg} strokeWidth={stroke} />
        <circle
          cx={cxy} cy={cxy} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray .5s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color: th.text, letterSpacing: -0.3,
      }}>{pct}</div>
    </div>
  );
}

/** Grade a 0–100 consistency into the status ramp (paired with the numeric label, never color-alone). */
function gradeColor(pct: number): string {
  return pct >= 70 ? "#2E9E5B" : pct >= 40 ? "#f59e0b" : "#ef4444";
}

/**
 * Best-day "polar area" (nightingale rose): 7 sectors, one per weekday, radius ∝
 * completion rate. Days-of-week are cyclical, so a radial reads more naturally
 * than a bar row — and it's a lovelier centerpiece. Single-hue sequential (green)
 * by magnitude; the best day gets the fullest, brightest wedge + a highlighted
 * label. Pure SVG (viewBox units) so it's crisp at any width and SSR-stable.
 */
function PolarDays({
  data, bestDay, worstDay, th,
}: {
  data: { name: string; pct: number }[];
  bestDay: number;
  worstDay: number;
  th: ThemeColors;
}) {
  const S = 220, cx = S / 2, cy = S / 2, maxR = 82, floor = 10;
  const seg = (Math.PI * 2) / 7;
  const gap = 0.05; // radians of surface gap between wedges
  const hasSpread = data[worstDay].pct < data[bestDay].pct;
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width="100%" style={{ display: "block", maxWidth: 260, margin: "2px auto 0" }}>
      {/* recessive concentric grid at 25 / 50 / 75 / 100% */}
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <circle key={g} cx={cx} cy={cy} r={floor + g * (maxR - floor)} fill="none"
          stroke={th.cardBorder} strokeWidth="1" opacity={g === 1 ? 0.7 : 0.4} />
      ))}
      {data.map((d, i) => {
        const ac = i * seg - Math.PI / 2; // sector center, start at top (Sun)
        const a0 = ac - seg / 2 + gap;
        const a1 = ac + seg / 2 - gap;
        const rr = floor + (d.pct / 100) * (maxR - floor);
        const x0 = cx + Math.cos(a0) * rr, y0 = cy + Math.sin(a0) * rr;
        const x1 = cx + Math.cos(a1) * rr, y1 = cy + Math.sin(a1) * rr;
        const isBest = i === bestDay && hasSpread;
        const isWorst = i === worstDay && hasSpread;
        // Sequential green by magnitude; best day fullest, worst day dimmest.
        const fill = isBest ? "#2E9E5B" : isWorst ? "#ef4444" : "#66bb6a";
        const op = isBest ? 0.95 : isWorst ? 0.5 : 0.28 + (d.pct / 100) * 0.4;
        // label just outside the max ring
        const lr = maxR + 14;
        const lx = cx + Math.cos(ac) * lr, ly = cy + Math.sin(ac) * lr;
        return (
          <g key={i}>
            <path
              d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${rr.toFixed(2)} ${rr.toFixed(2)} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
              fill={fill} opacity={op}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fontWeight={isBest || isWorst ? 700 : 500}
              fill={isBest ? "#2E9E5B" : isWorst ? "#ef4444" : th.textMuted}>
              {d.name[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Constellation({
  habits, isDone, getStreak, getTotal, getCleanDays, getBestStreak, getStage,
  getUrgeDates, isPro, onUpgrade, th, gratitudeLog,
}: ConstellationProps) {
  // SVG SMIL isn't stopped by the global reduced-motion CSS rule, so gate the synergy-line pulse manually.
  const prefersReducedMotion = useReducedMotion();
  const sr = seed;

  const buildHabits = habits.filter((h) => h.category !== "quit");
  const quitHabits = habits.filter((h) => h.category === "quit");

  // ── Overview stats ──
  // Use the app-wide LOCAL date convention (today()) — completions are keyed by
  // local date via today()/daysAgo(), so a UTC toISOString() slice would look up
  // the wrong day every evening for users west of UTC (0-of-N false negatives).
  const todayStr = today();
  const totalHabitsOnTrack = habits.filter((h) => {
    if (h.category === "quit") return getCleanDays ? getCleanDays(h.id) > 0 : getStreak(h.id) > 0;
    return isDone(h.id, todayStr);
  }).length;
  const weekPct = habits.length ? Math.round((totalHabitsOnTrack / habits.length) * 100) : 0;
  const avgClean = quitHabits.length
    ? Math.round(quitHabits.reduce((sum, h) => sum + (getCleanDays ? getCleanDays(h.id) : getStreak(h.id)), 0) / quitHabits.length)
    : 0;

  // Total days tracked across all habits
  const totalDaysTracked = habits.reduce((sum, h) => sum + getTotal(h.id), 0);

  // ── Weekly trend (4 weeks) ──
  const weeklyTrend = useMemo(() => {
    const weeks: { label: string; pct: number; total: number; done: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      let done = 0;
      let total = 0;
      for (let d = w * 7 + 6; d >= w * 7; d--) {
        const date = daysAgo(d);
        habits.forEach((h) => {
          if (h.category === "quit") {
            const clean = getCleanDays ? getCleanDays(h.id) : 0;
            if (clean > d) { done++; }
            total++;
          } else {
            if (isDone(h.id, date)) done++;
            total++;
          }
        });
      }
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const label = w === 0 ? "This wk" : w === 1 ? "Last wk" : `${w}w ago`;
      weeks.push({ label, pct, total, done });
    }
    return weeks;
  }, [habits, isDone, getCleanDays]);

  // ── Streak journey (30 days) — the flagship build habit's running streak length
  // day-by-day, so the climb-and-reset story is visible. Delegates to the tested
  // computeStreakSeries kernel; flagship = the build habit on the longest run now.
  const streakJourney = useMemo(() => {
    if (buildHabits.length === 0) return null;
    const WINDOW = 30;
    const flagship = buildHabits.reduce((best, h) =>
      getStreak(h.id) > getStreak(best.id) ? h : best, buildHabits[0]);
    const series = computeStreakSeries((o) => isDone(flagship.id, daysAgo(o)), WINDOW);
    const peak = Math.max(...series, 0);
    if (peak === 0) return null; // no streak history to tell yet
    return { flagship, series, peak, current: series[series.length - 1], window: WINDOW };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, isDone, getStreak]);

  // ── Habit scoreboard ──
  const scoreboard = useMemo(() => {
    return habits
      .map((h) => {
        const streak = getStreak(h.id);
        const best = getBestStreak ? getBestStreak(h.id) : streak;
        const total = getTotal(h.id);
        const stage = getStage ? getStage(h.id) : 0;
        // Consistency % — completions over the habit's life, capped to a fair
        // 30-day window so young habits aren't punished by a large denominator.
        // Delegates to the tested computeConsistency kernel (see lib/progress.ts).
        let consistency = 0;
        if (h.category !== "quit") {
          const age = daysBetween(h.created_at.slice(0, 10), todayStr) + 1;
          consistency = computeConsistency((n) => isDone(h.id, daysAgo(n)), age);
        }
        return { habit: h, streak, best, total, stage, consistency };
      })
      .sort((a, b) => b.streak - a.streak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, getStreak, getBestStreak, getTotal, getStage, isDone]);

  // ── Day-of-week completion rate (last 30 days) ──
  // Delegates to the tested computeDayOfWeekRates kernel (lib/progress.ts), which
  // skips days before a habit was created so young habits don't read ~0% on every
  // weekday. Wrapped's "best day" uses the same kernel + window so they can't
  // contradict each other.
  const dayOfWeekData = useMemo(() => {
    const last30 = Array.from({ length: 30 }, (_, i) => daysAgo(i));
    const tallies = computeDayOfWeekRates(
      last30,
      buildHabits.map((h) => ({ id: h.id, startDate: h.created_at.slice(0, 10) })),
      isDone,
      (d) => new Date(d + "T12:00:00").getDay(),
    );
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames.map((name, i) => ({ name, pct: tallies[i].pct }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, isDone]);

  const worstDay = dayOfWeekData.reduce((worst, d, i) =>
    d.pct < dayOfWeekData[worst].pct ? i : worst, 0
  );
  const bestDay = dayOfWeekData.reduce((best, d, i) =>
    d.pct > dayOfWeekData[best].pct ? i : best, 0
  );

  // ── Synergies ──
  const synergies = useMemo<Synergy[]>(() => {
    if (buildHabits.length < 2) return [];
    const last30 = Array.from({ length: 30 }, (_, i) => daysAgo(i));
    // Pairing + \u22653-day threshold + strength ramp live in the tested kernel
    // (lib/progress.ts); here we only supply the co-completion count per pair.
    const coCountOf = (i: number, j: number) => {
      const a = buildHabits[i], b = buildHabits[j];
      let c = 0;
      last30.forEach((d) => { if (isDone(a.id, d) && isDone(b.id, d)) c++; });
      return c;
    };
    return computeSynergies(buildHabits.length, coCountOf).map(({ a: i, b: j, coCount, strength }) => {
      const a = buildHabits[i], b = buildHabits[j];
      const name = getSynergyName(a.name, b.name);
      return {
        a: i, b: j, strength, coCount, name,
        label: name || `${a.name.slice(0, 8)} \u00d7 ${b.name.slice(0, 8)}`,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, isDone]);

  // Constellation positions for synergy visual
  const cx = 160, cy = 140, radius = 90;
  const positions = buildHabits.map((_, i) => {
    const angle = (i / Math.max(buildHabits.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  });

  // ── Streak records ──
  const longestQuitStreak = quitHabits.reduce((best, h) => {
    const s = getBestStreak ? getBestStreak(h.id) : (getCleanDays ? getCleanDays(h.id) : getStreak(h.id));
    return s > best.days ? { days: s, name: h.name } : best;
  }, { days: 0, name: "" });

  const bestBuildStreak = buildHabits.length > 0
    ? Math.max(...buildHabits.map((h) => getBestStreak ? getBestStreak(h.id) : getStreak(h.id)))
    : 0;
  const bestBuildName = buildHabits.find((h) =>
    (getBestStreak ? getBestStreak(h.id) : getStreak(h.id)) === bestBuildStreak
  )?.name || "";

  // ── Urges survived (quit habits) ──
  // Every logged urge is a moment the user chose themselves over the habit —
  // the most invisible work in the whole app, surfaced. Free for everyone:
  // the emotional core is never paywalled.
  const urgeStats = useMemo(() => {
    if (!getUrgeDates || quitHabits.length === 0) return null;
    const weekFloor = daysAgo(6);
    const perHabit = quitHabits
      .map((h) => {
        const dates = getUrgeDates(h.id);
        return { habit: h, count: dates.length, thisWeek: dates.filter((d) => d >= weekFloor).length };
      })
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);
    const total = perHabit.reduce((s, r) => s + r.count, 0);
    if (total === 0) return null;
    return { perHabit, total, thisWeek: perHabit.reduce((s, r) => s + r.thisWeek, 0) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, getUrgeDates]);

  // ── Calm advice ──
  const getAdvice = (): string => {
    const justRelapsed = quitHabits.some((h) => (getCleanDays ? getCleanDays(h.id) : getStreak(h.id)) === 0);
    if (justRelapsed) {
      return longestQuitStreak.days > 0
        ? `A slip is not a fall. You\u2019ve proven you can go ${longestQuitStreak.days} ${longestQuitStreak.days === 1 ? "day" : "days"}. Do it again.`
        : "Starting over takes courage. You\u2019re here. That\u2019s what matters.";
    }
    const shortQuit = quitHabits.find((h) => {
      const d = getCleanDays ? getCleanDays(h.id) : getStreak(h.id);
      return d > 0 && d < 3;
    });
    if (shortQuit) return "The first 72 hours are the hardest. Your brain is recalibrating. This is temporary.";
    const weekStreak = quitHabits.find((h) => {
      const d = getCleanDays ? getCleanDays(h.id) : getStreak(h.id);
      return d >= 7;
    });
    if (weekStreak) return "One week in. Your neural pathways are physically changing. Don\u2019t stop now.";
    if (totalHabitsOnTrack === habits.length && habits.length > 0) return "You showed up today. That\u2019s what matters.";
    return "Small steps compound. Trust the process.";
  };
  const advice = getAdvice();

  // ── Headline summary ("here's how you're doing this week") ──
  // A warm one-line read of the week, keyed off this-week completion % + the
  // momentum delta vs last week. Purely derived from weeklyTrend (already memoized).
  const thisWeekPct = weeklyTrend[weeklyTrend.length - 1]?.pct ?? 0;
  const lastWeekPct = weeklyTrend[weeklyTrend.length - 2]?.pct ?? 0;
  const weekDelta = thisWeekPct - lastWeekPct;
  const headline: { emoji: string; text: string } | null =
    habits.length === 0
      ? null
      : thisWeekPct >= 85
        ? { emoji: "🔥", text: weekDelta >= 0 ? "You’re on fire this week — keep the flame going." : "Still a strong week — a small dip, nothing to worry about." }
        : thisWeekPct >= 60
          ? { emoji: "🌱", text: weekDelta > 0 ? "Building beautifully — you’re up from last week." : weekDelta < 0 ? "A solid week with a gentle dip — easy to recover." : "Steady and consistent — right on track." }
          : thisWeekPct >= 30
            ? { emoji: "🌤", text: weekDelta > 0 ? "Momentum is turning your way — lovely comeback." : "A quieter week. One small tend tomorrow turns it around." }
            : { emoji: "🤍", text: "Fresh-start energy. Tend one egg today and the curve turns up." };

  // How many scoreboard rows free users see
  const FREE_SCOREBOARD_LIMIT = 3;

  return (
    <div style={{ animation: "fadeUp .28s ease" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text }}>Insights</h2>
        <p style={{ fontSize: 13, color: th.textMuted, marginTop: 2 }}>Your habits at a glance</p>
      </div>

      {/* ── 0. Headline summary — the warm "how you're doing this week" hero ── */}
      {headline && (
        <div className="cd" style={{
          padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 16,
          background: "linear-gradient(135deg, rgba(46,158,91,0.12), rgba(46,158,91,0.02))",
          borderColor: "rgba(46,158,91,0.22)", boxShadow: th.cardShadow,
        }}>
          <div style={{ textAlign: "center", flexShrink: 0, minWidth: 62 }}>
            <div style={{
              fontSize: 34, fontWeight: 800, fontFamily: "'Fraunces',serif", lineHeight: 1,
              color: thisWeekPct >= 60 ? "#2E9E5B" : th.text,
            }}>{thisWeekPct}<span style={{ fontSize: 16, fontWeight: 600 }}>%</span></div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: th.label, marginTop: 3 }}>This week</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, color: th.text, fontWeight: 600, lineHeight: 1.45 }}>
              <span style={{ marginRight: 5 }}>{headline.emoji}</span>{headline.text}
            </div>
            {lastWeekPct > 0 || weekDelta !== 0 ? (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8,
                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                color: weekDelta > 0 ? "#2E9E5B" : weekDelta < 0 ? "#e57373" : th.textMuted,
                background: weekDelta > 0 ? "rgba(46,158,91,0.14)" : weekDelta < 0 ? "rgba(229,115,115,0.14)" : th.progressBg,
              }}>
                {weekDelta > 0 ? "▲" : weekDelta < 0 ? "▼" : "•"} {weekDelta > 0 ? "+" : ""}{weekDelta}% vs last week
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* ── 1. Overview stats ── */}
      <div className="cd" style={{ padding: 16, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Fraunces',serif", color: weekPct >= 80 ? "#2E9E5B" : th.text }}>{weekPct}%</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: th.label, marginTop: 2 }}>On Track</div>
            <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>{totalHabitsOnTrack} of {habits.length}</div>
          </div>
          {quitHabits.length > 0 && (
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Fraunces',serif", color: th.text }}>{avgClean}<span style={{ fontSize: 14, fontWeight: 500 }}>d</span></div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: th.label, marginTop: 2 }}>Avg Clean</div>
              <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>{quitHabits.length} quit {quitHabits.length === 1 ? "habit" : "habits"}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Fraunces',serif", color: th.text }}>
              {totalDaysTracked}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: th.label, marginTop: 2 }}>Total Days</div>
            <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>across all habits</div>
          </div>
        </div>
      </div>

      {/* ── 2. Momentum curve (FREE) — 4-week completion %, single-series area sparkline ── */}
      {habits.length > 0 && (() => {
        // Points in a normalized 0..100 space, inset from the edges so the end
        // markers aren't clipped; y leaves headroom top (for a 100% peak) + bottom.
        const yTop = 16, yBottom = 84, xL = 6, xR = 94;
        const n = weeklyTrend.length;
        const pts = weeklyTrend.map((w, i) => ({
          x: n > 1 ? xL + (i / (n - 1)) * (xR - xL) : (xL + xR) / 2,
          y: yTop + (1 - w.pct / 100) * (yBottom - yTop),
          pct: w.pct,
        }));
        const last = weeklyTrend[n - 1];
        const prev = n > 1 ? weeklyTrend[n - 2] : null;
        const delta = prev ? last.pct - prev.pct : 0;
        // Green reads on both surfaces; brighten the marker for dark contrast.
        const line = "#2E9E5B";
        const gid = "momentumFill";
        return (
        <div className="cd" style={{ padding: 14, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div className="lb" style={{ marginBottom: 6, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={10} /> Momentum
            {prev && (
              <span style={{
                marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "none",
                padding: "2px 8px", borderRadius: 999,
                color: delta > 0 ? "#2E9E5B" : delta < 0 ? "#e57373" : th.textMuted,
                background: delta > 0 ? "rgba(46,158,91,0.12)" : delta < 0 ? "rgba(229,115,115,0.12)" : th.progressBg,
              }}>
                {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {delta > 0 ? "+" : ""}{delta}% vs last wk
              </span>
            )}
          </div>
          {/* chart area + overlaid markers/labels */}
          <div style={{ position: "relative", height: 80, margin: "18px 0 20px" }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="80" style={{ display: "block", overflow: "visible" }}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={line} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={line} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* baseline */}
              <line x1="0" y1="100" x2="100" y2="100" stroke={th.cardBorder} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d={smoothPath(pts, true)} fill={`url(#${gid})`} stroke="none" />
              <path d={smoothPath(pts)} fill="none" stroke={line} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {pts.map((p, i) => {
              const isThis = i === n - 1;
              return (
                <div key={i}>
                  {/* value label above the point */}
                  <div style={{
                    position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                    transform: "translate(-50%,-165%)", whiteSpace: "nowrap",
                    fontSize: isThis ? 13 : 10.5, fontWeight: isThis ? 800 : 600,
                    color: isThis ? line : th.textSub,
                  }}>{p.pct}%</div>
                  {/* marker */}
                  <div style={{
                    position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                    transform: "translate(-50%,-50%)",
                    width: isThis ? 11 : 7, height: isThis ? 11 : 7, borderRadius: "50%",
                    background: line,
                    border: isThis ? `2px solid ${th.card}` : "none",
                    boxShadow: isThis ? `0 0 0 2px ${line}, 0 2px 8px rgba(46,158,91,0.45)` : "none",
                  }} />
                  {/* week label below */}
                  <div style={{
                    position: "absolute", left: `${p.x}%`, top: "100%",
                    transform: "translate(-50%, 5px)", whiteSpace: "nowrap",
                    fontSize: 8, fontWeight: 600, color: isThis ? th.textSub : th.textMuted,
                    textTransform: "uppercase" as const, letterSpacing: 0.3,
                  }}>{weeklyTrend[i].label}</div>
                </div>
              );
            })}
          </div>
        </div>
        );
      })()}

      {/* ── 2b. Streak journey (FREE) — flagship habit's streak length over 30 days ── */}
      {streakJourney && (() => {
        const { flagship, series, peak, current, window } = streakJourney;
        const yTop = 14, yBottom = 86, xL = 4, xR = 96;
        const n = series.length;
        const pts = series.map((s, i) => ({
          x: n > 1 ? xL + (i / (n - 1)) * (xR - xL) : (xL + xR) / 2,
          y: yTop + (1 - s / peak) * (yBottom - yTop),
          s,
        }));
        // Peak marker (first day the max was reached) + the live end point.
        const peakIdx = series.indexOf(peak);
        const line = flagship.color || "#f59e0b";
        const gid = "streakFill";
        return (
        <div className="cd" style={{ padding: 14, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div className="lb" style={{ marginBottom: 4, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <Flame size={10} /> Streak journey
            <span style={{
              marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "none",
              padding: "2px 8px", borderRadius: 999, color: line,
              background: `${line}1f`,
            }}>
              🔥 best {peak}d
            </span>
          </div>
          <div style={{ fontSize: 11, color: th.textSub, marginBottom: 2 }}>
            {flagship.creature_name || flagship.name}
            {current > 0
              ? ` · on a ${current}-day run`
              : peak > 0 ? " · ready for a fresh run" : ""}
          </div>
          <div style={{ position: "relative", height: 72, margin: "16px 0 8px" }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="72" style={{ display: "block", overflow: "visible" }}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={line} stopOpacity="0.30" />
                  <stop offset="100%" stopColor={line} stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="100" x2="100" y2="100" stroke={th.cardBorder} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d={smoothPath(pts, true)} fill={`url(#${gid})`} stroke="none" />
              <path d={smoothPath(pts)} fill="none" stroke={line} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* peak marker + label (only if the peak isn't the live end point) */}
            {peakIdx !== n - 1 && (
              <div style={{
                position: "absolute", left: `${pts[peakIdx].x}%`, top: `${pts[peakIdx].y}%`,
                transform: "translate(-50%,-50%)", width: 6, height: 6, borderRadius: "50%",
                background: line, opacity: 0.55,
              }} />
            )}
            {/* live end point */}
            <div style={{
              position: "absolute", left: `${pts[n - 1].x}%`, top: `${pts[n - 1].y}%`,
              transform: "translate(-50%,-165%)", whiteSpace: "nowrap",
              fontSize: 12, fontWeight: 800, color: line,
            }}>{current}d</div>
            <div style={{
              position: "absolute", left: `${pts[n - 1].x}%`, top: `${pts[n - 1].y}%`,
              transform: "translate(-50%,-50%)", width: 11, height: 11, borderRadius: "50%",
              background: line, border: `2px solid ${th.card}`,
              boxShadow: `0 0 0 2px ${line}, 0 2px 8px ${line}66`,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 600, color: th.textMuted, textTransform: "uppercase", letterSpacing: 0.3 }}>
            <span>{window}d ago</span>
            <span>Today</span>
          </div>
        </div>
        );
      })()}

      {/* ── 3. Habit scoreboard (FREE: top 3, PRO: all + best) ── */}
      {scoreboard.length > 0 && (
        <div className="cd" style={{ padding: 14, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div className="lb" style={{ marginBottom: 10, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <Trophy size={10} /> Habit Scoreboard
            <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0, color: th.textMuted, marginLeft: "auto", fontSize: 9 }}>
              ring = 30-day consistency
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {scoreboard.slice(0, isPro ? scoreboard.length : FREE_SCOREBOARD_LIMIT).map((s, i) => {
              const isQuit = s.habit.category === "quit";
              const stageLabel = getStage ? STAGE_LABELS[s.stage] : "";
              return (
                <div key={s.habit.id} style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "9px 10px", borderRadius: 12,
                  background: i === 0 ? th.hoverBg : "transparent",
                }}>
                  {/* Consistency ring (build) or a clean-streak shield (quit) \u2014 the row's visual anchor */}
                  {isQuit ? (
                    <div style={{
                      position: "relative", width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(74,222,128,0.1)", border: "1.5px solid rgba(74,222,128,0.3)",
                    }}>
                      <Shield size={17} color="#4ADE80" />
                    </div>
                  ) : (
                    <ConsistencyRing pct={s.consistency} color={gradeColor(s.consistency)} th={th} />
                  )}
                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13.5, fontWeight: 600, color: th.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {s.habit.creature_name || s.habit.name}
                    </div>
                    <div style={{ fontSize: 10.5, color: th.textSub, marginTop: 2 }}>
                      {s.habit.creature_name ? s.habit.name : stageLabel}
                      {s.habit.creature_name && stageLabel ? ` \u00b7 ${stageLabel}` : ""}
                    </div>
                  </div>
                  {/* Streak */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces',serif",
                      color: s.streak > 0 ? s.habit.color : th.textMuted,
                    }}>
                      {s.streak}d
                    </div>
                    <div style={{ fontSize: 9, color: th.textMuted }}>
                      {isQuit ? "clean" : "streak"}
                    </div>
                  </div>
                  {/* Best (pro only) */}
                  {isPro && s.best > 0 && (
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: th.textSub }}>
                        {s.best}d
                      </div>
                      <div style={{ fontSize: 8, color: th.textMuted }}>best</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Pro upsell for scoreboard */}
          {!isPro && scoreboard.length > FREE_SCOREBOARD_LIMIT && (
            <button
              onClick={() => onUpgrade?.()}
              style={{
                marginTop: 8, width: "100%", padding: "10px 0",
                borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                color: th.textMuted, fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Lock size={10} />
              See all {scoreboard.length} habits + best streaks
              <Crown size={10} color="#fbbf24" />
            </button>
          )}
        </div>
      )}

      {/* ── 4. Day-of-week analysis (PRO) ── */}
      {isPro && buildHabits.length > 0 && (
        <div className="cd" style={{ padding: 14, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div className="lb" style={{ marginBottom: 4, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} /> Completion by Day
          </div>
          <PolarDays data={dayOfWeekData} bestDay={bestDay} worstDay={worstDay} th={th} />
          {/* best / worst callout beneath the rose */}
          {dayOfWeekData[worstDay].pct < dayOfWeekData[bestDay].pct && (
            <div style={{ display: "flex", justifyContent: "center", gap: 16, margin: "6px 0 2px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Fraunces',serif", color: "#2E9E5B" }}>{dayOfWeekData[bestDay].name}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase" as const, color: th.label }}>Best · {dayOfWeekData[bestDay].pct}%</div>
              </div>
              <div style={{ width: 1, background: th.cardBorder }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Fraunces',serif", color: "#ef4444" }}>{dayOfWeekData[worstDay].name}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase" as const, color: th.label }}>Toughest · {dayOfWeekData[worstDay].pct}%</div>
              </div>
            </div>
          )}
          {dayOfWeekData[worstDay].pct < dayOfWeekData[bestDay].pct && (
            <div style={{
              marginTop: 8, padding: "6px 10px", borderRadius: 8,
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)",
              fontSize: 11, color: th.textSub, textAlign: "center",
            }}>
              <span role="img" aria-label="lightbulb">💡</span> <strong style={{ color: "#2E9E5B" }}>{dayOfWeekData[worstDay].name}s</strong> are harder for you — a little extra care that day helps
            </div>
          )}
        </div>
      )}

      {/* ── 5. Habit synergies (visual for all, details Tend+) ── */}
      {buildHabits.length >= 2 && (
        <div className="cd" style={{ overflow: "hidden", marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div style={{ padding: "12px 14px 0" }}>
            <div className="lb" style={{ color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={10} /> Habit Synergies
            </div>
          </div>
          <svg viewBox="0 0 320 280" style={{ width: "100%", display: "block" }}>
            <defs>
              <filter id="cgl"><feGaussianBlur stdDeviation="2.5" /></filter>
              <radialGradient id="cbg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.05" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              {/* Each synergy line is a gradient between the two habits it connects —
                  lovelier + more meaningful than a single off-brand purple. */}
              {synergies.map((syn, i) => {
                const from = positions[syn.a], to = positions[syn.b];
                if (!from || !to) return null;
                return (
                  <linearGradient key={`sg${i}`} id={`syn-grad-${i}`} gradientUnits="userSpaceOnUse"
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
                    <stop offset="0%" stopColor={buildHabits[syn.a].color} />
                    <stop offset="100%" stopColor={buildHabits[syn.b].color} />
                  </linearGradient>
                );
              })}
            </defs>
            <rect width="320" height="280" fill="url(#cbg)" />
            {Array.from({ length: 25 }).map((_, i) => {
              const r = sr(i * 31 + 7);
              return <circle key={i} cx={r() * 320} cy={r() * 280} r={0.3 + r() * 0.7} fill={th.text} opacity={0.06 + r() * 0.08} />;
            })}
            {synergies.map((syn, i) => {
              const from = positions[syn.a], to = positions[syn.b];
              if (!from || !to) return null;
              // Floor the visibility so even a faint synergy still reads as a thread.
              const glow = 0.12 + syn.strength * 0.22;
              const core = 0.4 + syn.strength * 0.45;
              return (
                <g key={`syn${i}`}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={`url(#syn-grad-${i})`} strokeWidth={3 + syn.strength * 3} opacity={glow} filter="url(#cgl)" />
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={`url(#syn-grad-${i})`} strokeWidth={1.2 + syn.strength * 1.3} opacity={core} strokeLinecap="round">
                    {!prefersReducedMotion && <animate attributeName="opacity" values={`${core * 0.65};${core};${core * 0.65}`} dur={`${3 + i}s`} repeatCount="indefinite" />}
                  </line>
                </g>
              );
            })}
            {buildHabits.map((h, i) => {
              const pos = positions[i];
              if (!pos) return null;
              const streak = getStreak(h.id);
              const nodeR = 6 + Math.min(streak, 30) * 0.2;
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r={nodeR + 4} fill={h.color} opacity="0.06" />
                  <circle cx={pos.x} cy={pos.y} r={nodeR} fill={h.color} opacity="0.85" />
                  <circle cx={pos.x - nodeR * 0.3} cy={pos.y - nodeR * 0.3} r={nodeR * 0.2} fill="white" opacity="0.25" />
                  <text x={pos.x} y={pos.y + nodeR + 12} textAnchor="middle" fontSize="8" fill={th.text} opacity="0.6" fontWeight="600">{h.name}</text>
                  <text x={pos.x} y={pos.y + nodeR + 21} textAnchor="middle" fontSize="7" fill={th.text} opacity="0.25">{streak}d</text>
                </g>
              );
            })}
          </svg>
          {isPro && synergies.length > 0 && (
            <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
              {[...synergies].sort((a, b) => b.strength - a.strength).slice(0, 3).map((syn, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: th.hoverBg }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(90deg, ${buildHabits[syn.a].color}, ${buildHabits[syn.b].color})`,
                    opacity: 0.55 + syn.strength * 0.45 }} />
                  <div style={{ flex: 1, fontSize: 11, color: th.text, fontWeight: 500 }}>{syn.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: th.textSub }}>{syn.coCount}d together</div>
                </div>
              ))}
            </div>
          )}
          {isPro && synergies.length === 0 && (
            <div style={{ padding: "8px 14px 14px", fontSize: 11, color: th.textMuted, textAlign: "center" }}>
              Complete habits on the same days to form synergies
            </div>
          )}
          {!isPro && (
            <div style={{ padding: "6px 14px 12px", fontSize: 11, color: th.textMuted, textAlign: "center" }}>
              Upgrade to Tend+ for synergy details
            </div>
          )}
        </div>
      )}

      {/* ── 6. Streak records (PRO) ── */}
      {isPro && (
        <div className="cd" style={{ padding: 14, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div className="lb" style={{ marginBottom: 10, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={10} /> Streak Records
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {longestQuitStreak.days > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={14} color="#4ADE80" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>
                    Longest quit streak: {longestQuitStreak.days} {longestQuitStreak.days === 1 ? "day" : "days"}
                  </div>
                  <div style={{ fontSize: 10, color: th.textSub }}>{longestQuitStreak.name}</div>
                </div>
              </div>
            )}
            {bestBuildStreak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Flame size={14} color="#f59e0b" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>
                    Best build streak: {bestBuildStreak} {bestBuildStreak === 1 ? "day" : "days"}
                  </div>
                  <div style={{ fontSize: 10, color: th.textSub }}>{bestBuildName}</div>
                </div>
              </div>
            )}
            {habits.length === 0 && (
              <div style={{ fontSize: 12, color: th.textMuted, textAlign: "center", padding: 10 }}>
                Add habits to see records
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 6a. Urges survived (FREE) — the invisible work, made visible ── */}
      {urgeStats && (
        <div className="cd" style={{ padding: 16, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div className="lb" style={{ marginBottom: 12, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <Shield size={10} /> Urges survived
            {urgeStats.thisWeek > 0 && (
              <span style={{
                marginLeft: "auto", fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "none",
                padding: "2px 8px", borderRadius: 999, color: "#4ADE80", background: "rgba(74,222,128,0.12)",
              }}>
                {urgeStats.thisWeek} this week
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: urgeStats.perHabit.length > 1 ? 12 : 0 }}>
            <div style={{ fontSize: 34, fontWeight: 800, fontFamily: "'Fraunces',serif", lineHeight: 1, color: "#4ADE80" }}>
              {urgeStats.total}
            </div>
            <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.45 }}>
              {urgeStats.total === 1 ? "urge ridden out without giving in" : "urges ridden out without giving in"}.
              Every one was a moment you chose yourself.
            </div>
          </div>
          {urgeStats.perHabit.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {urgeStats.perHabit.map(({ habit: h, count }) => (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 8, background: th.hoverBg }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: h.color }} />
                  <div style={{ flex: 1, fontSize: 11.5, color: th.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: th.textSub }}>{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 6b. Recent gratitude (from the Wellness "three good things" ritual) ── */}
      {gratitudeLog && gratitudeLog.length > 0 && (() => {
        const recent = gratitudeLog.slice(-3).reverse();
        const daysLogged = new Set(gratitudeLog.map((e) => e.date)).size;
        return (
          <div className="cd" style={{ padding: 16, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Heart size={15} color="#2E9E5B" />
              <span style={{ fontSize: 14, fontWeight: 700, color: th.text }}>Things you were grateful for</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: th.textMuted, fontWeight: 600 }}>{daysLogged} {daysLogged === 1 ? "day" : "days"} logged</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recent.map((entry, i) => (
                <div key={i} style={{ paddingLeft: 12, borderLeft: `2px solid rgba(46,158,91,0.4)` }}>
                  <div style={{ fontSize: 11, color: th.textMuted, fontWeight: 600, marginBottom: 3 }}>
                    {(() => { const d = new Date(entry.date + "T00:00:00"); return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); })()}
                  </div>
                  {entry.items.map((it, j) => (
                    <div key={j} style={{ fontSize: 13, color: th.text, lineHeight: 1.5 }}>· {it}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── 7. Calm advice ── */}
      {habits.length > 0 && (
        <div className="cd" style={{ padding: 16, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Heart size={16} color={th.textSub} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: th.text, fontWeight: 500, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
              &ldquo;{advice}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* ── 8. Free-user upgrade card ── */}
      {!isPro && habits.length > 0 && (
        <div className="cd" style={{
          padding: 18,
          marginBottom: 10,
          background: "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(74,222,128,0.02))",
          borderColor: "rgba(74,222,128,0.25)",
          boxShadow: th.cardShadow,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 600, color: th.text, marginBottom: 4 }}>
            Go deeper with Tend+
          </div>
          <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.5, marginBottom: 6 }}>
            Day-of-week patterns, best streaks, full scoreboard, and habit synergies — optional depth when you want it. Wellness stays free.
          </div>
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6,
            marginBottom: 14, fontSize: 10, color: th.textMuted,
          }}>
            {["Day-of-week", "Best streaks", "Scoreboard", "Synergies"].map((f) => (
              <span key={f} style={{
                padding: "3px 8px", borderRadius: 6,
                background: "rgba(46,158,91,0.08)", border: "1px solid rgba(46,158,91,0.14)",
                fontWeight: 600,
              }}>
                {f}
              </span>
            ))}
          </div>
          <button
            onClick={() => onUpgrade?.()}
            style={{
              background: "linear-gradient(135deg, #2E9E5B, #1F7A46)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "11px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(46,158,91,0.28)",
            }}
          >
            See Tend+
          </button>
        </div>
      )}
    </div>
  );
}
