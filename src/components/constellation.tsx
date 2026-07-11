"use client";

import { useMemo } from "react";
import {
  Sparkles, TrendingUp, Shield, Flame, Heart, Calendar,
  Crown, BarChart3, Trophy, Lock,
} from "lucide-react";
import { seed, daysAgo, daysBetween, today } from "@/lib/utils";
import { computeConsistency, computeSynergies } from "@/lib/progress";
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

export function Constellation({
  habits, isDone, getStreak, getTotal, getCleanDays, getBestStreak, getStage,
  isPro, onUpgrade, th, gratitudeLog,
}: ConstellationProps) {
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
  const dayOfWeekData = useMemo(() => {
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayDone = [0, 0, 0, 0, 0, 0, 0];
    const last30 = Array.from({ length: 30 }, (_, i) => daysAgo(i));
    last30.forEach((d) => {
      const dayIdx = new Date(d + "T12:00:00").getDay();
      buildHabits.forEach((h) => {
        dayTotals[dayIdx]++;
        if (isDone(h.id, d)) dayDone[dayIdx]++;
      });
    });
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames.map((name, i) => ({
      name,
      pct: dayTotals[i] > 0 ? Math.round((dayDone[i] / dayTotals[i]) * 100) : 0,
    }));
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

  // How many scoreboard rows free users see
  const FREE_SCOREBOARD_LIMIT = 3;

  return (
    <div style={{ animation: "fadeUp .28s ease" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text }}>Insights</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Your habits at a glance</p>
      </div>

      {/* ── 1. Overview stats ── */}
      <div className="cd" style={{ padding: 16, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Fraunces',serif", color: weekPct >= 80 ? "#4caf50" : th.text }}>{weekPct}%</div>
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

      {/* ── 2. Weekly trend (FREE) ── */}
      {habits.length > 0 && (
        <div className="cd" style={{ padding: 14, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div className="lb" style={{ marginBottom: 10, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <BarChart3 size={10} /> Weekly Trend
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, padding: "0 4px" }}>
            {weeklyTrend.map((w, i) => {
              const barH = Math.max(4, (w.pct / 100) * 68);
              const isThis = i === weeklyTrend.length - 1;
              const improving = i > 0 && w.pct > weeklyTrend[i - 1].pct;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: isThis ? "#4caf50" : th.textSub,
                  }}>
                    {w.pct}%
                  </div>
                  <div style={{
                    width: "100%", height: barH, borderRadius: 6,
                    background: isThis
                      ? "linear-gradient(to top, #4caf50, #66bb6a)"
                      : `rgba(76,175,80,${0.15 + (w.pct / 100) * 0.25})`,
                    transition: "height 0.4s ease",
                    position: "relative",
                  }}>
                    {improving && isThis && (
                      <TrendingUp size={10} color="#4caf50" style={{
                        position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                      }} />
                    )}
                  </div>
                  <div style={{
                    fontSize: 8, fontWeight: 600, color: th.textMuted,
                    textTransform: "uppercase" as const, letterSpacing: 0.3,
                  }}>
                    {w.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Habit scoreboard (FREE: top 3, PRO: all + best) ── */}
      {scoreboard.length > 0 && (
        <div className="cd" style={{ padding: 14, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div className="lb" style={{ marginBottom: 10, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <Trophy size={10} /> Habit Scoreboard
            <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0, color: th.textMuted, marginLeft: "auto", fontSize: 9 }}>
              bar = 30-day consistency
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {scoreboard.slice(0, isPro ? scoreboard.length : FREE_SCOREBOARD_LIMIT).map((s, i) => {
              const isQuit = s.habit.category === "quit";
              const stageLabel = getStage ? STAGE_LABELS[s.stage] : "";
              return (
                <div key={s.habit.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 10,
                  background: i === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                }}>
                  {/* Rank */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: i === 0 ? `${s.habit.color}20` : "rgba(255,255,255,0.03)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: i === 0 ? s.habit.color : th.textMuted,
                  }}>
                    {i + 1}
                  </div>
                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: th.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {s.habit.creature_name || s.habit.name}
                    </div>
                    <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>
                      {s.habit.creature_name ? s.habit.name : stageLabel}
                      {s.habit.creature_name && stageLabel ? ` \u00b7 ${stageLabel}` : ""}
                    </div>
                    {/* Consistency bar (build habits) */}
                    {!isQuit && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 3,
                            width: `${s.consistency}%`,
                            background: s.consistency >= 70 ? "#4caf50" : s.consistency >= 40 ? "#f59e0b" : "#ef4444",
                            transition: "width .4s ease",
                          }} />
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, color: th.textMuted, minWidth: 26, textAlign: "right" }}>
                          {s.consistency}%
                        </span>
                      </div>
                    )}
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
          <div className="lb" style={{ marginBottom: 10, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} /> Completion by Day
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 70, padding: "0 2px" }}>
            {dayOfWeekData.map((d, i) => {
              const barH = Math.max(3, (d.pct / 100) * 52);
              const isBest = i === bestDay;
              const isWorst = i === worstDay && d.pct < dayOfWeekData[bestDay].pct;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{
                    fontSize: 9, fontWeight: 600,
                    color: isBest ? "#4caf50" : isWorst ? "#ef4444" : th.textMuted,
                  }}>
                    {d.pct}%
                  </div>
                  <div style={{
                    width: "100%", maxWidth: 28, height: barH, borderRadius: 4,
                    background: isBest
                      ? "linear-gradient(to top, #4caf50, #66bb6a)"
                      : isWorst
                        ? "rgba(239,68,68,0.3)"
                        : "rgba(76,175,80,0.2)",
                  }} />
                  <div style={{
                    fontSize: 8, fontWeight: 600,
                    color: isBest ? "#4caf50" : isWorst ? "#ef4444" : th.textMuted,
                  }}>
                    {d.name}
                  </div>
                </div>
              );
            })}
          </div>
          {dayOfWeekData[worstDay].pct < dayOfWeekData[bestDay].pct && (
            <div style={{
              marginTop: 8, padding: "6px 10px", borderRadius: 8,
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)",
              fontSize: 11, color: th.textSub, textAlign: "center",
            }}>
              <span role="img" aria-label="lightbulb">💡</span> You tend to slip on <strong style={{ color: "#ef4444" }}>{dayOfWeekData[worstDay].name}s</strong> — plan ahead for that day
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
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.04" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="320" height="280" fill="url(#cbg)" />
            {Array.from({ length: 25 }).map((_, i) => {
              const r = sr(i * 31 + 7);
              return <circle key={i} cx={r() * 320} cy={r() * 280} r={0.3 + r() * 0.7} fill={th.text} opacity={0.06 + r() * 0.08} />;
            })}
            {synergies.map((syn, i) => {
              const from = positions[syn.a], to = positions[syn.b];
              if (!from || !to) return null;
              return (
                <g key={`syn${i}`}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#8B5CF6" strokeWidth={2 + syn.strength * 3} opacity={syn.strength * 0.15} filter="url(#cgl)" />
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#8B5CF6" strokeWidth={0.8 + syn.strength * 1.2} opacity={syn.strength * 0.5} strokeLinecap="round">
                    <animate attributeName="opacity" values={`${syn.strength * 0.3};${syn.strength * 0.6};${syn.strength * 0.3}`} dur={`${3 + i}s`} repeatCount="indefinite" />
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
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B5CF6", opacity: syn.strength }} />
                  <div style={{ flex: 1, fontSize: 11, color: th.text, fontWeight: 500 }}>{syn.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#8B5CF6", opacity: 0.7 }}>{syn.coCount}d together</div>
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
                <Shield size={14} color="#4ade80" />
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

      {/* ── 6b. Recent gratitude (from the Wellness "three good things" ritual) ── */}
      {gratitudeLog && gratitudeLog.length > 0 && (() => {
        const recent = gratitudeLog.slice(-3).reverse();
        const daysLogged = new Set(gratitudeLog.map((e) => e.date)).size;
        return (
          <div className="cd" style={{ padding: 16, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Heart size={15} color="#4caf50" />
              <span style={{ fontSize: 14, fontWeight: 700, color: th.text }}>Things you were grateful for</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: th.textMuted, fontWeight: 600 }}>{daysLogged} {daysLogged === 1 ? "day" : "days"} logged</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recent.map((entry, i) => (
                <div key={i} style={{ paddingLeft: 12, borderLeft: `2px solid rgba(76,175,80,0.4)` }}>
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
          <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 4 }}>
            Unlock your full picture
          </div>
          <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.5, marginBottom: 6 }}>
            See which days you slip, your all-time best streaks, full habit scoreboard, and synergy details.
          </div>
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6,
            marginBottom: 14, fontSize: 10, color: th.textMuted,
          }}>
            {["Day-of-week analysis", "Best streaks", "Full scoreboard", "Synergy details"].map((f) => (
              <span key={f} style={{
                padding: "3px 8px", borderRadius: 6,
                background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.12)",
                fontWeight: 600,
              }}>
                {f}
              </span>
            ))}
          </div>
          <button
            onClick={() => onUpgrade?.()}
            style={{
              background: "#4ade80",
              color: "#0a0e18",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Unlock with Tend+
          </button>
        </div>
      )}
    </div>
  );
}
