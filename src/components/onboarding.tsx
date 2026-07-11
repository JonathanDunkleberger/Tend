"use client";
/* eslint-disable @next/next/no-img-element -- sprites are small static PNGs; plain <img> matches the rest of the app and keeps this animated flow simple. */

import { useState, useEffect } from "react";
import { QUIT_PRESETS } from "@/lib/constants";
import { getIcon } from "@/lib/utils";
import { getDragonSprite, deriveDragonFromId } from "@/lib/sprites";

/**
 * Onboarding — a ~60-second "plant your first egg" flow.
 *
 * Re-centered on the dragon-egg garden (grow-first, quitting optional) and warm
 * throughout. Showcases the REAL egg/dragon sprites — not the old colored blob.
 *
 * Keeps the onComplete(quitPick, buildPick) contract so tend-app is unchanged:
 * step order asks what to GROW first (primary, required), then an optional
 * "leave behind" (quit) step.
 */

const BUILD_PRESETS = [
  { name: "Meditate", iconName: "Brain", color: "#7c5cbf" },
  { name: "Exercise", iconName: "Dumbbell", color: "#e8553a" },
  { name: "Read", iconName: "BookOpen", color: "#3a8fd6" },
  { name: "Journal", iconName: "BookOpen", color: "#d4a03c" },
  { name: "Hydrate", iconName: "Droplets", color: "#42b4d6" },
  { name: "Walk", iconName: "Footprints", color: "#27ae60" },
  { name: "Sleep well", iconName: "Moon", color: "#6b5b95" },
  { name: "Deep work", iconName: "Target", color: "#34495e" },
  { name: "Cook a meal", iconName: "Utensils", color: "#f39c12" },
  { name: "Create", iconName: "Palette", color: "#1abc9c" },
];

interface OnboardingProps {
  onComplete: (
    quitPick: { name: string; color: string; iconName: string; cost: number } | null,
    buildPick: { name: string; color: string; iconName: string } | null,
  ) => void | Promise<boolean>;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [quitPick, setQuitPick] = useState<{ name: string; color: string; iconName: string; cost: number } | null>(null);
  const [buildPick, setBuildPick] = useState<{ name: string; color: string; iconName: string } | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [reveal, setReveal] = useState(0); // staged reveal on final step
  const [submitting, setSubmitting] = useState(false);

  // Disable the finish button while the starter habits are being created so a
  // double-tap can't create duplicates; re-enable if it fails so the user can retry.
  const finish = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ok = await onComplete(quitPick, buildPick);
    if (ok === false) setSubmitting(false); // on success the overlay unmounts
  };

  useEffect(() => {
    const t = setTimeout(() => setFadeIn(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Final-step staged reveal
  useEffect(() => {
    if (step !== 4) return;
    const timers = [
      setTimeout(() => setReveal(1), 150),
      setTimeout(() => setReveal(2), 850),
      setTimeout(() => setReveal(3), 1250),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const handleBuildPick = (p: (typeof BUILD_PRESETS)[number]) => {
    setBuildPick({ name: p.name, color: p.color, iconName: p.iconName });
    setStep(3);
  };
  const handleQuitPick = (p: typeof QUIT_PRESETS[number]) => {
    setQuitPick({ name: p.name, color: p.color, iconName: p.iconName, cost: p.cost });
    setStep(4);
  };

  // Egg sprite to show in the reveal — derived from the primary pick's name so
  // it's stable & varied (the real species is assigned server-side on create).
  const primaryName = buildPick?.name || quitPick?.name || "tend";
  const revealSpecies = deriveDragonFromId(primaryName);
  const eggSprite = getDragonSprite(0, revealSpecies);
  const dragonSprite = getDragonSprite(4, revealSpecies);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "radial-gradient(120% 90% at 50% 8%, #16261C 0%, #0C1610 55%, #08110C 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans',-apple-system,sans-serif",
        opacity: fadeIn ? 1 : 0, transition: "opacity .45s ease",
        overflowY: "auto",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: OB_CSS }} />
      <div aria-hidden className="obGlow" />

      {/* progress dots */}
      <div className="obDots">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className="obDot" style={{ background: n <= step ? "#4ade80" : "rgba(255,255,255,0.15)", width: n === step ? 20 : 7 }} />
        ))}
      </div>

      {/* Step 1 — welcome */}
      {step === 1 && (
        <div className="obStep" style={{ textAlign: "center" }}>
          <div className="obEggWrap">
            <div className="obEggGlow" />
            <img src={getDragonSprite(0, 33)} alt="" className="obFloat" style={{ width: 108, height: 108 }} draggable={false} />
          </div>
          <h1 className="obLogo">tend<span style={{ color: "#4ade80" }}>.</span></h1>
          <p className="obLede">
            Welcome to your garden. Build the life you want, one gentle day at a time —
            each habit grows into a dragon you tend.
          </p>
          <button className="obBtn" onClick={() => setStep(2)}>Plant your first egg</button>
          <p className="obFine">Takes about a minute · assumes the best in you</p>
        </div>
      )}

      {/* Step 2 — what to grow (primary) */}
      {step === 2 && (
        <div className="obStep">
          <h2 className="obH">What do you want to grow?</h2>
          <p className="obSub">Pick one to start. You can add more anytime.</p>
          <div className="obChips">
            {BUILD_PRESETS.map((p) => {
              const Ic = getIcon(p.iconName);
              return (
                <button key={p.name} className="obChip" onClick={() => handleBuildPick(p)}>
                  <Ic size={15} color={p.color} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3 — optional leave-behind (quit) */}
      {step === 3 && (
        <div className="obStep">
          <h2 className="obH">Anything to leave behind?</h2>
          <p className="obSub">Quitting a habit works the same way — tend it clean and it still grows. Totally optional.</p>
          <div className="obChips">
            {QUIT_PRESETS.map((p) => {
              const Ic = getIcon(p.iconName);
              return (
                <button key={p.name} className="obChip" onClick={() => handleQuitPick(p)}>
                  <Ic size={15} color={p.color} />
                  {p.name}
                </button>
              );
            })}
          </div>
          <div className="obOr"><span /> <em>or</em> <span /></div>
          <button className="obSkip" onClick={() => setStep(4)}>Skip — just growing for now</button>
        </div>
      )}

      {/* Step 4 — plant / reveal */}
      {step === 4 && (
        <div className="obStep" style={{ textAlign: "center" }}>
          <div className="obEggWrap" style={{ opacity: reveal >= 1 ? 1 : 0, transform: reveal >= 1 ? "scale(1)" : "scale(0.85)", transition: "all .7s cubic-bezier(.16,1,.3,1)" }}>
            <div className="obEggGlow" />
            {/* sparkle ring */}
            {reveal >= 1 && [0, 60, 120, 180, 240, 300].map((a, i) => (
              <span key={a} className="obSpark" style={{ transform: `rotate(${a}deg) translateY(-78px)`, animationDelay: `${i * 0.12}s` }} />
            ))}
            <img src={eggSprite} alt="Your first egg" className="obFloat" style={{ width: 116, height: 116 }} draggable={false} />
            {/* faint ghost of what it becomes */}
            <img src={dragonSprite} alt="" className="obGhost" style={{ opacity: reveal >= 2 ? 0.14 : 0 }} draggable={false} />
          </div>

          <div style={{ opacity: reveal >= 2 ? 1 : 0, transform: reveal >= 2 ? "translateY(0)" : "translateY(10px)", transition: "all .5s ease" }}>
            <h2 className="obH" style={{ textAlign: "center", marginBottom: 6 }}>
              {buildPick ? `${buildPick.name} is planted 🥚` : quitPick ? `${quitPick.name} — day one 🥚` : "Your egg is planted 🥚"}
            </h2>
            <p className="obSub" style={{ textAlign: "center", maxWidth: 340 }}>
              Tend it each day and watch it warm, crack, and hatch into a dragon that’s all yours.
            </p>
          </div>

          <div style={{ opacity: reveal >= 3 ? 1 : 0, transform: reveal >= 3 ? "translateY(0)" : "translateY(10px)", transition: "all .5s ease", marginTop: 26 }}>
            <button className="obBtn" onClick={finish} disabled={submitting} style={submitting ? { opacity: 0.7 } : undefined}>{submitting ? "Entering…" : "Enter your garden"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const OB_CSS = `
.obGlow{position:absolute;top:6%;left:50%;transform:translateX(-50%);width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,0.10),transparent 70%);pointer-events:none;}
.obDots{position:absolute;top:calc(22px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);display:flex;gap:6px;align-items:center;}
.obDot{height:7px;border-radius:100px;transition:all .3s ease;}
.obStep{position:relative;z-index:1;width:100%;max-width:440px;padding:72px 26px 48px;animation:obUp .45s ease both;}
@keyframes obUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.obEggWrap{position:relative;width:150px;height:150px;margin:0 auto 22px;display:flex;align-items:center;justify-content:center;}
.obEggGlow{position:absolute;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,0.22),transparent 68%);animation:obPulse 3s ease-in-out infinite;}
.obGhost{position:absolute;width:150px;height:150px;object-fit:contain;transition:opacity .8s ease;pointer-events:none;}
.obFloat{position:relative;object-fit:contain;filter:drop-shadow(0 16px 22px rgba(0,0,0,0.4));animation:obFloatA 3.6s ease-in-out infinite;}
.obSpark{position:absolute;top:50%;left:50%;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:#4ade80;transform-origin:center;animation:obSparkA 1.6s ease infinite;}
.obLogo{font-family:'Fraunces',serif;font-size:34px;font-weight:700;color:#fff;margin:0 0 14px;}
.obLede{font-size:15.5px;line-height:1.55;color:rgba(255,255,255,0.55);max-width:360px;margin:0 auto 30px;}
.obFine{font-size:12.5px;color:rgba(255,255,255,0.32);margin-top:16px;}
.obH{font-family:'Fraunces',serif;font-size:25px;font-weight:600;color:#fff;margin:0 0 8px;letter-spacing:-0.4px;}
.obSub{font-size:14px;color:rgba(255,255,255,0.45);line-height:1.5;margin:0 auto 26px;}
.obChips{display:flex;flex-wrap:wrap;gap:9px;}
.obChip{display:inline-flex;align-items:center;gap:8px;padding:11px 16px;border-radius:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);color:#fff;font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .15s ease;}
.obChip:hover{background:rgba(255,255,255,0.09);border-color:rgba(74,222,128,0.4);transform:translateY(-1px);}
.obChip:active{transform:scale(0.97);}
.obOr{display:flex;align-items:center;gap:12px;margin:26px 0 0;justify-content:center;color:rgba(255,255,255,0.28);font-size:12px;font-style:normal;}
.obOr em{font-style:normal;}
.obOr span{flex:1;height:1px;background:rgba(255,255,255,0.08);}
.obSkip{display:block;margin:16px auto 0;background:none;border:none;color:rgba(255,255,255,0.4);font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit;padding:10px 16px;}
.obSkip:hover{color:rgba(255,255,255,0.7);}
.obBtn{background:#4ade80;color:#08110C;border:none;border-radius:16px;padding:15px 40px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 10px 26px rgba(74,222,128,0.28);transition:transform .15s ease;}
.obBtn:hover{transform:translateY(-1px);}
.obBtn:active{transform:scale(0.97);}
@keyframes obFloatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes obPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.85;transform:scale(1.06)}}
@keyframes obSparkA{0%,100%{opacity:0}50%{opacity:.9}}
@media(prefers-reduced-motion:reduce){.obFloat,.obEggGlow,.obSpark{animation:none!important;}}
`;
