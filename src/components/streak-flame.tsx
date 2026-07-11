"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * StreakFlame — a small living flame that grows with the streak.
 *
 * A premium micro-interaction for the "🔥 N-day streak" moment: instead of a
 * static emoji, a soft layered flame flickers and licks upward, its size + heat
 * (colour) scaling with how long the streak has burned. Longer streaks glow
 * hotter (amber → orange → white-hot core) and taller, so the number FEELS
 * earned.
 *
 * Motion discipline: all animation is CSS-driven so the global
 * `prefers-reduced-motion` rule neuters it; on top of that, reduced-motion users
 * get a clean static flame (no flicker) — the shape still reads, nothing jitters.
 * Pure presentation over a `streak` number — touches no state.
 */
export function StreakFlame({
  streak,
  size = 22,
  showCount = false,
}: {
  streak: number;
  /** Height of the flame in px (width scales ~0.72×). */
  size?: number;
  /** Render the day count beside the flame. */
  showCount?: boolean;
}) {
  const reduced = useReducedMotion();
  const lit = streak > 0;

  // Heat ramps with the streak: a fresh flame is a warm amber, a long one burns
  // toward a hot orange-red with a white core. Capped so it plateaus gracefully.
  const heat = Math.min(1, streak / 30);
  const outer = mix("#fbbf24", "#f97316", heat); // amber → orange
  const inner = mix("#fde68a", "#fef3c7", heat); // soft yellow → near-white core
  const glow = mix("#f59e0b", "#ef4444", heat); // glow tint hotter over time
  // A long streak stands a touch taller (up to +30%).
  const h = size * (1 + heat * 0.3);
  const w = h * 0.72;

  if (!lit) {
    // Unlit ember — a dormant wisp, no colour, no motion.
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }} aria-hidden={!showCount}>
        <span style={{ fontSize: size * 0.8, opacity: 0.35, filter: "grayscale(1)" }}>🔥</span>
        {showCount && <span style={{ fontSize: size * 0.62, fontWeight: 700, color: "#9ca3af" }}>0</span>}
      </span>
    );
  }

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      aria-label={`${streak}-day streak`}
      role="img"
    >
      <span
        style={{
          position: "relative",
          width: w,
          height: h,
          display: "inline-block",
          filter: `drop-shadow(0 0 ${4 + heat * 6}px ${glow}88)`,
        }}
      >
        {/* Outer flame body */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 78%, ${outer} 0%, ${outer} 42%, transparent 72%)`,
            borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%",
            clipPath: "polygon(50% 0%, 78% 42%, 88% 74%, 62% 100%, 38% 100%, 12% 74%, 22% 42%)",
            transformOrigin: "50% 90%",
            animation: reduced ? "none" : "flameFlicker 0.9s ease-in-out infinite",
          }}
        />
        {/* Inner hot core */}
        <span
          style={{
            position: "absolute",
            left: "26%",
            top: "38%",
            width: "48%",
            height: "54%",
            background: `radial-gradient(circle at 50% 70%, ${inner} 0%, ${outer}cc 55%, transparent 80%)`,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            transformOrigin: "50% 90%",
            animation: reduced ? "none" : "flameCore 0.7s ease-in-out infinite",
          }}
        />
      </span>
      {showCount && (
        <span style={{ fontSize: size * 0.62, fontWeight: 800, color: outer, letterSpacing: "-0.3px" }}>
          {streak}
        </span>
      )}

      <style>{`
        @keyframes flameFlicker {
          0%, 100% { transform: scaleY(1) scaleX(1) rotate(-1deg); }
          30% { transform: scaleY(1.08) scaleX(0.94) rotate(1.5deg); }
          55% { transform: scaleY(0.96) scaleX(1.05) rotate(-1.5deg); }
          80% { transform: scaleY(1.05) scaleX(0.97) rotate(1deg); }
        }
        @keyframes flameCore {
          0%, 100% { transform: scaleY(1) translateY(0); opacity: 0.95; }
          50% { transform: scaleY(1.14) translateY(-1px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

/* Linear hex mix, t in 0..1. Both inputs are #rrggbb. */
function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}
