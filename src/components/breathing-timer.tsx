"use client";

import { useState, useEffect } from "react";
import { Creature } from "@/components/creature";
import type { ThemeColors } from "@/lib/constants";

interface BreathingTimerProps {
  habit?: { name: string; color: string; id: string } | null;
  onComplete: () => void;
  onClose: () => void;
  th: ThemeColors;
}

export function BreathingTimer({ habit, onComplete, onClose }: BreathingTimerProps) {
  const color = habit?.color || "#4caf50";
  const label = habit ? `Urge surfing · ${habit.name}` : "Breathe";
  const [phase, setPhase] = useState<"ready" | "inhale" | "hold" | "exhale" | "done">("ready");
  const [seconds, setSeconds] = useState(0);
  const [cycle, setCycle] = useState(0);
  const totalCycles = 5;
  const phaseTime = { inhale: 4, hold: 4, exhale: 6, ready: 0, done: 0 };

  useEffect(() => {
    if (phase === "ready" || phase === "done") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "ready" || phase === "done") return;
    if (phase === "inhale" && seconds >= phaseTime.inhale) { setSeconds(0); setPhase("hold"); }
    else if (phase === "hold" && seconds >= phaseTime.hold) { setSeconds(0); setPhase("exhale"); }
    else if (phase === "exhale" && seconds >= phaseTime.exhale) {
      if (cycle + 1 >= totalCycles) { setPhase("done"); onComplete(); }
      else { setCycle((c) => c + 1); setSeconds(0); setPhase("inhale"); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, phase, cycle]);

  const ringPct = phase === "inhale" ? seconds / phaseTime.inhale
    : phase === "hold" ? 1
    : phase === "exhale" ? 1 - seconds / phaseTime.exhale : 0;
  const ringR = 60;
  const ringC = 2 * Math.PI * ringR;

  const currentPhaseTime = phase === "ready" || phase === "done" ? 0 : phaseTime[phase];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(5,5,15,0.92)", backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 200, animation: "fi .3s ease",
    }}>
      <div style={{ textAlign: "center", maxWidth: 340, padding: 20 }}>
        {phase !== "done" && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)",
              marginBottom: 24, letterSpacing: 1.5, textTransform: "uppercase",
            }}>
              {label}
            </div>
            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 28px" }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx="80" cy="80" r={ringR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                <circle cx="80" cy="80" r={ringR} fill="none" stroke={color} strokeWidth="4"
                  strokeDasharray={ringC} strokeDashoffset={ringC * (1 - ringPct)} strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s linear" }} opacity="0.8" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  transform: `scale(${phase === "inhale" ? 1 + ringPct * 0.15 : phase === "hold" ? 1.15 : 1.15 - ringPct * 0.15})`,
                  transition: "transform 1s ease-in-out",
                }}>
                  <Creature stage={3} color={color} happy={true} size={64} />
                </div>
              </div>
            </div>
            {phase === "ready" ? (
              <div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 20, lineHeight: 1.7 }}>
                  Cravings peak and pass in about 3 minutes.<br />Let&apos;s breathe through this one together.
                </p>
                <button
                  onClick={() => { setPhase("inhale"); setSeconds(0); }}
                  style={{
                    padding: "14px 36px", borderRadius: 14, border: "none",
                    background: `linear-gradient(135deg,${color},${color}bb)`,
                    color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    boxShadow: `0 4px 24px ${color}30`,
                  }}
                >
                  Start breathing
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 34, fontWeight: 600, fontFamily: "'Fraunces',serif", color: "white", marginBottom: 4, letterSpacing: "-0.5px" }}>
                  {phase === "inhale" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out"}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
                  {currentPhaseTime - seconds}s · Cycle {cycle + 1} of {totalCycles}
                </div>
              </div>
            )}
          </>
        )}

        {phase === "done" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <Creature stage={4} color={color} happy={true} size={80} />
            </div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, color: "white", marginBottom: 8 }}>
              You made it through
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 24 }}>
              That urge came and went. You didn&apos;t give in.<br />Your creature is proud of you.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "13px 30px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#4caf50,#2e7d32)",
                color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(76,175,80,0.2)",
              }}
            >
              Back to my planet
            </button>
          </div>
        )}

        {phase !== "done" && (
          <button
            onClick={onClose}
            style={{ marginTop: 20, background: "none", border: "none", color: "rgba(255,255,255,.2)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
