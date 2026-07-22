"use client";

import { useEffect, useState } from "react";
import { Creature } from "@/components/creature";
import { Confetti } from "@/components/confetti";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { STAGE_LABELS } from "@/lib/constants";

/**
 * The hatch + evolution ceremony — the single biggest emotional payoff in Tend.
 *
 * A full-screen moment that SHOWS the dragon art the app is built around:
 *   • hatch   — the egg rocks with anticipation, cracks in a burst of light + shell
 *               shards, and the newborn dragon springs out through radiating rays,
 *               confetti, and a little coin burst.
 *   • evolve  — the current dragon glows + charges, a bright flash, and the next
 *               stage springs up in its place through the same ray/confetti burst.
 *
 * Motion discipline:
 *   • Every animation is CSS-driven, so the global `prefers-reduced-motion` rule in
 *     globals.css already neuters the durations. On top of that we START at the
 *     `reveal` phase for reduced-motion users so they never see a half-played
 *     sequence — just the finished, celebratory frame. Confetti self-gates too.
 *   • `previewPhase` lets the /preview harness force a phase so the offline file://
 *     SSR snapshot can capture the money-shot "reveal" frame for composition review
 *     (pre-hydration markup only renders the initial phase).
 *
 * It renders NOTHING that touches server state — pure presentation over props.
 */

type Phase = "rock" | "crack" | "reveal";

export interface CeremonyProps {
  kind: "hatch" | "evolve";
  /** The NEW stage being revealed (1 for a hatch, 2–4 for an evolution). */
  stage: number;
  color: string;
  creatureType?: number | null;
  habitId?: string;
  habitName: string;
  /** Optional creature name (evolutions of a named dragon feel personal). */
  creatureName?: string | null;
  /** Coins granted by this milestone — shown as a little burst. Omit to hide. */
  coinReward?: number;
  /** Called when the user taps Continue (or Skip). */
  onDone: () => void;
  /** Soft Tend+ nudge after reveal (free users only). Never blocks Continue. */
  showTendPlusNudge?: boolean;
  onTryTendPlus?: () => void;
  /** Force an initial phase — used ONLY by the /preview harness for screenshots. */
  previewPhase?: Phase;
}

export function Ceremony({
  kind,
  stage,
  color,
  creatureType,
  habitId,
  habitName,
  creatureName,
  coinReward,
  onDone,
  showTendPlusNudge,
  onTryTendPlus,
  previewPhase,
}: CeremonyProps) {
  const reduced = useReducedMotion();
  // Reduced-motion + preview both start at a fixed frame; otherwise play through.
  const [phase, setPhase] = useState<Phase>(previewPhase ?? (reduced ? "reveal" : "rock"));

  useEffect(() => {
    if (previewPhase || reduced) return; // static frame — no sequence
    const t1 = setTimeout(() => setPhase("crack"), 1500);
    const t2 = setTimeout(() => setPhase("reveal"), 2150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [previewPhase, reduced]);

  const revealed = phase === "reveal";
  // Before the reveal we show the "before" art: an egg (stage 0) for a hatch, or
  // the previous stage for an evolution. After, the freshly revealed stage.
  const beforeStage = kind === "hatch" ? 0 : Math.max(0, stage - 1);
  const shownStage = revealed ? stage : beforeStage;
  const bonded = creatureName?.trim();

  const title = revealed
    ? kind === "hatch"
      ? `${bonded ? bonded : "Your dragon"} hatched!`
      : `${bonded ? bonded : "Your dragon"} evolved!`
    : kind === "hatch"
    ? "Something's stirring…"
    : "Gathering strength…";

  const subtitle = revealed
    ? kind === "hatch"
      ? "A brand-new hatchling, born from your habit."
      : `Now a ${STAGE_LABELS[stage]} — you tended it here.`
    : `from your ${habitName} habit`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: `radial-gradient(circle at 50% 42%, ${color}2e 0%, rgba(8,6,16,0.92) 55%, rgba(4,3,10,0.97) 100%)`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "ceremonyIn 0.4s ease both",
      }}
      role="dialog"
      aria-label={title}
      aria-live="polite"
    >
      <Confetti active={revealed} />

      {/* ── The stage: rays + shards + creature ── */}
      <div
        style={{
          position: "relative",
          width: 260,
          height: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        {/* Radiating light rays — bloom in only on reveal */}
        {revealed && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-10%",
              borderRadius: "50%",
              background: `conic-gradient(from 0deg, ${color}00, ${color}55, ${color}00, ${color}44, ${color}00, ${color}55, ${color}00, ${color}44, ${color}00)`,
              filter: "blur(2px)",
              opacity: 0.9,
              animation: "ceremonyRays 9s linear infinite, ceremonyRayBloom 0.7s ease both",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Soft central glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "8%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}66 0%, ${color}22 45%, transparent 70%)`,
            opacity: revealed ? 1 : 0.5,
            transition: "opacity 0.6s ease",
            pointerEvents: "none",
          }}
        />

        {/* Crack flash — a bright pop at the moment of breaking */}
        {phase === "crack" && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "12%",
              borderRadius: "50%",
              background: "radial-gradient(circle, #fff 0%, #ffffffcc 30%, transparent 65%)",
              animation: "ceremonyFlash 0.6s ease-out both",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Eggshell shards fly out on crack (hatch only) */}
        {kind === "hatch" && (phase === "crack" || revealed) &&
          SHARDS.map((s, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "52%",
                width: s.w,
                height: s.h,
                borderRadius: 2,
                background: `linear-gradient(${s.rot}deg, ${color}, ${color}aa)`,
                // @ts-expect-error CSS custom props for the keyframe
                "--sx": `${s.x}px`,
                "--sy": `${s.y}px`,
                "--sr": `${s.rot}deg`,
                animation: "ceremonyShard 0.9s cubic-bezier(0.2,0.6,0.3,1) both",
                pointerEvents: "none",
              }}
            />
          ))}

        {/* Expanding ring at the break */}
        {(phase === "crack" || revealed) && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "20%",
              borderRadius: "50%",
              border: `2px solid ${color}`,
              animation: "ceremonyRing 0.8s ease-out both",
              pointerEvents: "none",
            }}
          />
        )}

        {/* The creature — rocks before the break, springs in on reveal.
            NOTE: the art system has ONE dragon sprite per species (stages 1–4
            share it); size is the only per-stage lever, so we scale the hero by
            stage — an evolution visibly GROWS even though the sprite is the same. */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            animation: revealed
              ? "ceremonyPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both"
              : kind === "hatch"
              ? "ceremonyRock 1.1s ease-in-out infinite"
              : "ceremonyCharge 1.1s ease-in-out infinite",
          }}
        >
          <Creature
            stage={shownStage}
            color={color}
            happy={revealed}
            size={heroSize(shownStage)}
            creatureType={creatureType}
            habitId={habitId}
          />
        </div>

        {/* Coin burst on reveal */}
        {revealed && coinReward ? (
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {COINS.map((c, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  fontSize: 22,
                  // @ts-expect-error CSS custom props for the keyframe
                  "--cx": `${c.x}px`,
                  "--cy": `${c.y}px`,
                  animation: "ceremonyCoin 1.1s ease-out both",
                  animationDelay: `${0.15 + i * 0.05}s`,
                }}
              >
                🪙
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Copy ── */}
      <h2
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 26,
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          margin: "0 0 6px",
          animation: revealed ? "fadeUp 0.5s ease 0.15s both" : "fadeUp 0.4s ease both",
        }}
      >
        {title} {revealed ? "🐉" : "✨"}
      </h2>
      <p
        style={{
          fontSize: 13.5,
          color: "rgba(255,255,255,0.62)",
          textAlign: "center",
          margin: "0 0 4px",
          maxWidth: 320,
          animation: revealed ? "fadeUp 0.5s ease 0.25s both" : "fadeUp 0.4s ease 0.05s both",
        }}
      >
        {subtitle}
      </p>

      {revealed && coinReward ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            fontWeight: 700,
            color: "#ffd54a",
            animation: "fadeUp 0.5s ease 0.35s both",
          }}
        >
          +{coinReward} coins
        </div>
      ) : null}

      {/* Continue — only meaningful once revealed; shown throughout so the ceremony
          is always dismissable (and keyboard/SR-operable). */}
      <button
        onClick={onDone}
        style={{
          marginTop: 26,
          padding: "13px 40px",
          borderRadius: 100,
          border: "none",
          background: revealed ? `linear-gradient(135deg, ${color}, ${color}cc)` : "rgba(255,255,255,0.08)",
          color: revealed ? "#fff" : "rgba(255,255,255,0.5)",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "'Fraunces', serif",
          cursor: "pointer",
          boxShadow: revealed ? `0 6px 26px ${color}55` : "none",
          transition: "all 0.3s ease",
          animation: revealed ? "fadeUp 0.5s ease 0.45s both" : "none",
          opacity: revealed ? 1 : 0.6,
        }}
      >
        {revealed ? "Continue" : "Skip"}
      </button>

      {revealed && showTendPlusNudge && onTryTendPlus ? (
        <button
          onClick={() => {
            onTryTendPlus();
            onDone();
          }}
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.45)",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            animation: "fadeUp 0.5s ease 0.55s both",
          }}
        >
          Grow further with Tend+
        </button>
      ) : null}

      {/* Ceremony-only keyframes, co-located (global reduced-motion rule still
          neuters their durations for reduced-motion users). */}
      <style>{`
        @keyframes ceremonyIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ceremonyRock {
          0%, 100% { transform: rotate(-7deg) translateY(0); }
          25% { transform: rotate(6deg) translateY(-2px); }
          50% { transform: rotate(-5deg) translateY(0); }
          75% { transform: rotate(7deg) translateY(-2px); }
        }
        @keyframes ceremonyCharge {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.35) drop-shadow(0 0 12px ${color}); }
        }
        @keyframes ceremonyPop {
          0% { transform: scale(0.2) translateY(30px); opacity: 0; }
          55% { transform: scale(1.12) translateY(-6px); opacity: 1; }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes ceremonyFlash {
          0% { opacity: 0; transform: scale(0.4); }
          40% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes ceremonyRayBloom {
          0% { opacity: 0; transform: scale(0.4); }
          100% { opacity: 0.9; transform: scale(1); }
        }
        @keyframes ceremonyRays { to { transform: rotate(360deg); } }
        @keyframes ceremonyRing {
          0% { opacity: 0.9; transform: scale(0.3); }
          100% { opacity: 0; transform: scale(2.2); }
        }
        @keyframes ceremonyShard {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--sr)) scale(0.4); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--sx)), calc(-50% + var(--sy))) rotate(calc(var(--sr) + 120deg)) scale(1); }
        }
        @keyframes ceremonyCoin {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--cx)), calc(-50% + var(--cy))) scale(1) rotate(30deg); }
        }
      `}</style>
    </div>
  );
}

/* Hero size scales with stage so an evolution reads as visible GROWTH (the art
   system reuses one sprite per species across stages — size is the only lever).
   Egg 132 → Elder 180. */
function heroSize(stage: number): number {
  return 128 + Math.max(0, Math.min(4, stage)) * 13;
}

/* Deterministic shard directions (no Math.random → SSR-stable snapshot). */
const SHARDS = [
  { x: -70, y: 40, w: 16, h: 10, rot: -30 },
  { x: 66, y: 46, w: 14, h: 9, rot: 40 },
  { x: -44, y: 74, w: 12, h: 8, rot: -60 },
  { x: 40, y: 78, w: 15, h: 9, rot: 55 },
  { x: -84, y: -6, w: 11, h: 7, rot: -12 },
  { x: 80, y: -8, w: 13, h: 8, rot: 18 },
];

/* Coin burst directions — a fountain up and out. */
const COINS = [
  { x: -60, y: -74 },
  { x: -22, y: -96 },
  { x: 22, y: -96 },
  { x: 60, y: -74 },
  { x: -84, y: -40 },
  { x: 84, y: -40 },
];
