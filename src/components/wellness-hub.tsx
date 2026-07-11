"use client";

import { useState, useEffect, useRef } from "react";
import { Wind, Sparkles, Waves, Heart, ChevronLeft, Check, Moon, X } from "lucide-react";
import type { ThemeColors } from "@/lib/constants";
import { haptic, today } from "@/lib/utils";

interface WellnessHubProps {
  th: ThemeColors;
  darkMode: boolean;
  /** Launch the shared breathing timer (box-breathing) modal from the parent */
  onBreathe: () => void;
  /** Persist a gratitude entry server-side (via the parent's preferences sync) */
  onSaveGratitude?: (entry: { date: string; items: string[] }) => void;
}

type Tool = "grounding" | "urgesurf" | "gratitude" | "calm";

const AFFIRMATIONS = [
  "You are allowed to grow slowly.",
  "One gentle breath is a fresh start.",
  "Feelings are visitors — let them come and go.",
  "You've made it through every hard day so far.",
  "Rest is part of the work, not a break from it.",
  "You are tending something beautiful. It takes time.",
  "Be as kind to yourself as you'd be to a friend.",
];

/**
 * Wellness hub — a calm, uplifting toolbox. Breathing launches the shared
 * timer; grounding, urge-surf, and gratitude are self-contained mini-tools.
 * Never clinical, never shaming — supportive by design.
 */
export function WellnessHub({ th, darkMode, onBreathe, onSaveGratitude }: WellnessHubProps) {
  const [tool, setTool] = useState<Tool | null>(null);
  // Rotate the affirmation by local hour-of-day. This hub only mounts client-side
  // (the app's initial page is "main"/garden — the Wellness tab renders it after a
  // tap), so it's never in the SSR/hydration paint and a lazy initializer can read
  // local time freely without any hydration mismatch. Lazy-init keeps it flicker-
  // free and needs no effect.
  const [affirmation] = useState(
    () => AFFIRMATIONS[new Date().getHours() % AFFIRMATIONS.length]
  );

  if (tool === "grounding") return <Grounding th={th} onBack={() => setTool(null)} />;
  if (tool === "urgesurf") return <UrgeSurf th={th} darkMode={darkMode} onBack={() => setTool(null)} />;
  if (tool === "gratitude") return <Gratitude th={th} onBack={() => setTool(null)} onSave={onSaveGratitude} />;
  if (tool === "calm") return <CalmMode onBack={() => setTool(null)} />;

  const cards: {
    key: Tool | "breathe";
    title: string;
    sub: string;
    Icon: typeof Wind;
    color: string;
    onTap: () => void;
  }[] = [
    { key: "breathe", title: "Breathe", sub: "Box breathing · 60s reset", Icon: Wind, color: "#38bdf8", onTap: onBreathe },
    { key: "urgesurf", title: "Ride the wave", sub: "Let an urge crest and pass", Icon: Waves, color: "#6366f1", onTap: () => setTool("urgesurf") },
    { key: "grounding", title: "Ground yourself", sub: "5-4-3-2-1 senses", Icon: Sparkles, color: "#8B5CF6", onTap: () => setTool("grounding") },
    { key: "gratitude", title: "Three good things", sub: "A tiny gratitude ritual", Icon: Heart, color: "#4caf50", onTap: () => setTool("gratitude") },
    { key: "calm", title: "Wind down", sub: "A starlit calm for evening", Icon: Moon, color: "#a78bfa", onTap: () => setTool("calm") },
  ];

  return (
    <div style={{ animation: "fadeUp 0.28s ease", paddingBottom: 90 }}>
      <div style={{ padding: "8px 2px 4px" }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color: th.text, letterSpacing: "-0.5px" }}>
          Wellness
        </h2>
        <p style={{ fontSize: 13, color: th.textSub, marginTop: 2, lineHeight: 1.5 }}>
          A few calm tools for when you need them.
        </p>
      </div>

      {/* Affirmation card */}
      <div
        style={{
          margin: "14px 0",
          padding: "18px 18px",
          borderRadius: 18,
          background: darkMode
            ? "linear-gradient(135deg, rgba(56,189,248,0.10), rgba(139,92,246,0.10))"
            : "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(139,92,246,0.07))",
          border: `1px solid ${th.cardBorder}`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: th.textMuted, marginBottom: 8 }}>
          A gentle reminder
        </div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 19, fontWeight: 500, color: th.text, lineHeight: 1.4 }}>
          &ldquo;{affirmation}&rdquo;
        </div>
      </div>

      {/* Tool cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cards.map(({ key, title, sub, Icon, color, onTap }) => (
          <button
            key={key}
            onClick={() => { haptic("light"); onTap(); }}
            style={{
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "16px 15px",
              borderRadius: 18,
              minHeight: 128,
              background: th.card,
              border: `1px solid ${th.cardBorder}`,
              boxShadow: th.cardShadow,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "transform .15s ease",
            }}
            onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${color}1a`,
              }}
            >
              <Icon size={22} color={color} strokeWidth={2.2} />
            </div>
            <div style={{ marginTop: "auto" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: th.text }}>{title}</div>
              <div style={{ fontSize: 12, color: th.textSub, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Shared back header ───────────────────────── */
function ToolHeader({ th, title, onBack }: { th: ThemeColors; title: string; onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      style={{
        display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
        cursor: "pointer", fontSize: 13, fontWeight: 600, color: th.textSub, fontFamily: "inherit",
        padding: "6px 2px", marginBottom: 8,
      }}
    >
      <ChevronLeft size={16} /> {title}
    </button>
  );
}

/* ───────────────────────── Grounding: 5-4-3-2-1 ───────────────────────── */
const GROUND_STEPS = [
  { n: 5, sense: "things you can see", color: "#8B5CF6" },
  { n: 4, sense: "things you can feel", color: "#6366f1" },
  { n: 3, sense: "things you can hear", color: "#38bdf8" },
  { n: 2, sense: "things you can smell", color: "#4caf50" },
  { n: 1, sense: "thing you can taste", color: "#f59e0b" },
];

function Grounding({ th, onBack }: { th: ThemeColors; onBack: () => void }) {
  const [i, setI] = useState(0);
  const done = i >= GROUND_STEPS.length;
  const step = GROUND_STEPS[Math.min(i, GROUND_STEPS.length - 1)];

  return (
    <div style={{ animation: "fadeUp 0.28s ease", paddingBottom: 90 }}>
      <ToolHeader th={th} title="Wellness" onBack={onBack} />
      <div style={{ textAlign: "center", padding: "24px 16px" }}>
        {!done ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: th.textMuted, marginBottom: 20 }}>
              Grounding · step {i + 1} of {GROUND_STEPS.length}
            </div>
            <div
              key={i}
              style={{
                width: 130, height: 130, margin: "0 auto 24px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${step.color}14`, border: `2px solid ${step.color}33`,
                animation: "pop .4s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 56, fontWeight: 700, color: step.color }}>
                {step.n}
              </span>
            </div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, color: th.text, marginBottom: 6 }}>
              Notice {step.n} {step.sense}.
            </div>
            <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5, maxWidth: 300, margin: "0 auto 28px" }}>
              Take your time. Name each one, silently or out loud.
            </p>
            <button
              onClick={() => { haptic("light"); setI((v) => v + 1); }}
              style={{
                padding: "13px 32px", borderRadius: 14, border: "none",
                background: step.color, color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", boxShadow: `0 6px 20px ${step.color}44`,
              }}
            >
              {i === GROUND_STEPS.length - 1 ? "Finish" : "Next"}
            </button>
          </>
        ) : (
          <>
            <div style={{
              width: 96, height: 96, margin: "20px auto 20px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(76,175,80,0.12)", animation: "pop .5s cubic-bezier(.34,1.56,.64,1)",
            }}>
              <Check size={44} color="#4caf50" strokeWidth={3} />
            </div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600, color: th.text, marginBottom: 8 }}>
              You&rsquo;re here, and you&rsquo;re safe.
            </div>
            <p style={{ fontSize: 14, color: th.textSub, lineHeight: 1.5, maxWidth: 300, margin: "0 auto 28px" }}>
              You just brought yourself back to the present. That&rsquo;s a real skill.
            </p>
            <button
              onClick={onBack}
              style={{
                padding: "13px 32px", borderRadius: 14, border: "none",
                background: "#4caf50", color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(76,175,80,0.35)",
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Urge surf timer ───────────────────────── */
function UrgeSurf({ th, darkMode, onBack }: { th: ThemeColors; darkMode: boolean; onBack: () => void }) {
  const DURATION = 90; // seconds
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const done = left <= 0;

  useEffect(() => {
    if (running && !done) {
      intervalRef.current = setInterval(() => {
        setLeft((v) => {
          if (v <= 1) {
            haptic("success");
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, done]);

  const progress = (DURATION - left) / DURATION; // 0..1
  // The wave rises then falls — scale peaks at the midpoint.
  const wave = Math.sin(progress * Math.PI); // 0 → 1 → 0
  const scale = 0.7 + wave * 0.5;

  return (
    <div style={{ animation: "fadeUp 0.28s ease", paddingBottom: 90 }}>
      <ToolHeader th={th} title="Wellness" onBack={onBack} />
      <div style={{ textAlign: "center", padding: "20px 16px" }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600, color: th.text, marginBottom: 6 }}>
          Ride the wave
        </div>
        <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5, maxWidth: 320, margin: "0 auto 24px" }}>
          Urges rise, crest, and fall — always. You don&rsquo;t have to fight it. Just watch it pass.
        </p>

        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div
            style={{
              width: 150, height: 150, borderRadius: "50%",
              background: darkMode
                ? "radial-gradient(circle at 35% 30%, rgba(99,102,241,0.5), rgba(56,189,248,0.25))"
                : "radial-gradient(circle at 35% 30%, rgba(99,102,241,0.35), rgba(56,189,248,0.18))",
              transform: `scale(${running && !done ? scale : 0.85})`,
              transition: "transform 1s linear",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 40px rgba(99,102,241,0.25)",
            }}
          >
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 700, color: th.text }}>
              {done ? "✓" : left}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          {done ? (
            <>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600, color: th.text, marginBottom: 8 }}>
                It passed. It always does.
              </div>
              <button
                onClick={onBack}
                style={{
                  padding: "13px 32px", borderRadius: 14, border: "none",
                  background: "#6366f1", color: "#fff", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                }}
              >
                I feel steadier
              </button>
            </>
          ) : !running ? (
            <button
              onClick={() => { haptic("light"); setRunning(true); }}
              style={{
                padding: "13px 36px", borderRadius: 14, border: "none",
                background: "#6366f1", color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
              }}
            >
              Start · 90s
            </button>
          ) : (
            <div style={{ fontSize: 13, color: th.textSub }}>Breathe slowly. Watch it crest…</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Gratitude: three good things ───────────────────────── */
function Gratitude({ th, onBack, onSave }: { th: ThemeColors; onBack: () => void; onSave?: (entry: { date: string; items: string[] }) => void }) {
  const [items, setItems] = useState<string[]>(["", "", ""]);
  const [saved, setSaved] = useState(false);

  const filled = items.filter((s) => s.trim().length > 0).length;

  const save = () => {
    haptic("success");
    // Stamp with the LOCAL date (today()) — the app keys everything by local
    // date, so a UTC slice would label a late-evening entry as tomorrow.
    const entry = { date: today(), items: items.filter((s) => s.trim()) };
    if (onSave) {
      // Parent persists to server (+ localStorage cache) and dedupes by day
      onSave(entry);
    } else {
      // Fallback: no parent handler → keep the localStorage-only behaviour
      try {
        const key = "tend_gratitude";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.push(entry);
        localStorage.setItem(key, JSON.stringify(prev.slice(-60)));
      } catch { /* localStorage may be unavailable */ }
    }
    setSaved(true);
  };

  return (
    <div style={{ animation: "fadeUp 0.28s ease", paddingBottom: 90 }}>
      <ToolHeader th={th} title="Wellness" onBack={onBack} />
      {!saved ? (
        <div style={{ padding: "8px 4px" }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600, color: th.text, marginBottom: 4 }}>
            Three good things
          </div>
          <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5, marginBottom: 20 }}>
            However small. A warm drink, a kind text, the way the light looked.
          </p>
          {items.map((val, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <textarea
                value={val}
                onChange={(e) => setItems((arr) => arr.map((v, j) => (j === idx ? e.target.value : v)))}
                placeholder={["Something that went okay…", "Someone or something you're glad about…", "A small comfort today…"][idx]}
                rows={2}
                style={{
                  width: "100%", resize: "none", borderRadius: 14, padding: "12px 14px",
                  background: th.inputBg, border: `1px solid ${th.inputBorder}`, color: th.text,
                  fontSize: 14, fontFamily: "inherit", lineHeight: 1.5, outline: "none",
                }}
              />
            </div>
          ))}
          <button
            onClick={save}
            disabled={filled === 0}
            style={{
              width: "100%", marginTop: 8, padding: "14px 0", borderRadius: 14, border: "none",
              background: filled > 0 ? "#4caf50" : th.progressBg,
              color: filled > 0 ? "#fff" : th.textMuted,
              fontSize: 15, fontWeight: 700, cursor: filled > 0 ? "pointer" : "default",
              fontFamily: "inherit", transition: "all .15s",
            }}
          >
            Save today&rsquo;s gratitude
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{
            width: 96, height: 96, margin: "0 auto 20px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(76,175,80,0.12)", animation: "pop .5s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <Heart size={42} color="#4caf50" strokeWidth={2.2} fill="rgba(76,175,80,0.3)" />
          </div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600, color: th.text, marginBottom: 8 }}>
            Held onto.
          </div>
          <p style={{ fontSize: 14, color: th.textSub, lineHeight: 1.5, maxWidth: 300, margin: "0 auto 28px" }}>
            Noticing the good is a habit too — and you just tended it.
          </p>
          <button
            onClick={onBack}
            style={{
              padding: "13px 32px", borderRadius: 14, border: "none",
              background: "#4caf50", color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(76,175,80,0.35)",
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Calm / night mode: wind down ───────────────────────── */
// Deterministic starfield (no Math.random — SSR-safe, stable across renders).
const CALM_STARS = [
  { top: 8, left: 12, size: 2, delay: 0 }, { top: 14, left: 78, size: 3, delay: 1.2 },
  { top: 22, left: 33, size: 2, delay: 2.4 }, { top: 18, left: 55, size: 2, delay: 0.6 },
  { top: 30, left: 88, size: 3, delay: 1.8 }, { top: 27, left: 8, size: 2, delay: 3.1 },
  { top: 40, left: 68, size: 2, delay: 0.9 }, { top: 44, left: 22, size: 3, delay: 2.0 },
  { top: 52, left: 90, size: 2, delay: 1.4 }, { top: 58, left: 44, size: 2, delay: 3.4 },
  { top: 63, left: 15, size: 3, delay: 0.4 }, { top: 70, left: 72, size: 2, delay: 2.7 },
  { top: 76, left: 30, size: 2, delay: 1.1 }, { top: 82, left: 85, size: 2, delay: 3.0 },
  { top: 88, left: 52, size: 3, delay: 1.6 }, { top: 12, left: 45, size: 2, delay: 2.2 },
  { top: 35, left: 50, size: 2, delay: 0.7 }, { top: 66, left: 60, size: 2, delay: 2.9 },
  { top: 48, left: 6, size: 2, delay: 1.9 }, { top: 6, left: 92, size: 2, delay: 3.3 },
];

// One breath cycle: in (4s) · hold (2s) · out (5s) · rest (1s) = 12s.
const CALM_LINES = [
  "Let the day settle.",
  "You did enough today.",
  "Nothing is required of you right now.",
  "Rest is part of tending, too.",
  "Tomorrow can wait for tomorrow.",
];

function CalmMode({ onBack }: { onBack: () => void }) {
  const [elapsed, setElapsed] = useState(0); // seconds, fractional
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    raf.current = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => { if (raf.current) clearInterval(raf.current); };
  }, []);

  const CYCLE = 12;
  const t = elapsed % CYCLE;
  let phase: string;
  let scale: number;
  if (t < 4) { phase = "Breathe in"; scale = 0.72 + (t / 4) * 0.4; }
  else if (t < 6) { phase = "Hold"; scale = 1.12; }
  else if (t < 11) { phase = "Breathe out"; scale = 1.12 - ((t - 6) / 5) * 0.4; }
  else { phase = "Rest"; scale = 0.72; }

  const line = CALM_LINES[Math.floor(elapsed / CYCLE) % CALM_LINES.length];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200, overflow: "hidden",
        background: "radial-gradient(140% 100% at 50% 0%, #1a1740 0%, #0d0b26 45%, #060514 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.6s ease",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="dialog"
      aria-label="Wind down — a calm evening space"
    >
      {/* Starfield */}
      {CALM_STARS.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute", top: `${s.top}%`, left: `${s.left}%`,
            width: s.size, height: s.size, borderRadius: "50%", background: "#fff",
            opacity: 0.6, animation: `pulse ${3 + (i % 3)}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Exit */}
      <button
        onClick={() => { haptic("light"); onBack(); }}
        aria-label="Leave wind-down mode"
        style={{
          position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 16,
          width: 40, height: 40, borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <X size={18} />
      </button>

      {/* Breathing moon-orb */}
      <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute", width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle at 38% 32%, rgba(199,190,255,0.55), rgba(124,110,220,0.22) 55%, transparent 72%)",
            transform: `scale(${scale})`, transition: "transform 0.12s linear",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "relative", width: 120, height: 120, borderRadius: "50%",
            background: "radial-gradient(circle at 38% 32%, #f4f1ff, #c9c0f5 60%, #9d90e0)",
            transform: `scale(${scale})`, transition: "transform 0.12s linear",
            boxShadow: "0 0 60px rgba(199,190,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Moon size={40} color="#5b4fa8" strokeWidth={1.6} />
        </div>
      </div>

      {/* Breath phase */}
      <div style={{ marginTop: 40, fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 500, color: "#efeaff", letterSpacing: "0.5px", minHeight: 34 }}>
        {phase}
      </div>

      {/* Rotating gentle line */}
      <div key={line} style={{ marginTop: 14, fontSize: 14, color: "rgba(230,225,255,0.6)", textAlign: "center", maxWidth: 280, lineHeight: 1.6, animation: "fadeIn 1.2s ease" }}>
        {line}
      </div>

      <button
        onClick={() => { haptic("light"); onBack(); }}
        style={{
          position: "absolute", bottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
          padding: "12px 30px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.05)", color: "rgba(239,234,255,0.85)",
          fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}
      >
        Rest well
      </button>
    </div>
  );
}
