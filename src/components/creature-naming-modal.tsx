"use client";

import { useState, useRef, useEffect } from "react";
import { Creature } from "@/components/creature";
import { STAGE_NAMES } from "@/lib/sprites";

/**
 * Cute creature name suggestions — short, endearing, easy to bond with.
 * Shown as tappable pills for quick naming.
 */
const NAME_SUGGESTIONS = [
  "Sprout", "Pip", "Bean", "Clover", "Fern",
  "Moss", "Pebble", "Bud", "Acorn", "Basil",
  "Sage", "Juniper", "Willow", "Hazel", "Ivy",
  "Coral", "Ember", "Luna", "Sol", "Nova",
  "Mochi", "Tofu", "Kiwi", "Olive", "Maple",
];

interface CreatureNamingModalProps {
  habitId: string;
  habitName: string;
  stage: number;
  color: string;
  creatureType?: number | null;
  onName: (name: string) => void;
  onSkip: () => void;
}

/**
 * Full-screen naming ceremony shown when a creature hatches (stage 0 → 1).
 * Creates the emotional bond — the #1 driver of retention.
 */
export function CreatureNamingModal({
  habitId,
  habitName,
  stage,
  color,
  creatureType,
  onName,
  onSkip,
}: CreatureNamingModalProps) {
  const [name, setName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  // Pick 6 random suggestions once per mount (lazy initializer keeps render
  // pure; copy the source array first so we never mutate the shared constant).
  const [suggestions] = useState(() =>
    [...NAME_SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 6)
  );

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed.length <= 20) {
      onName(trimmed);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: 24,
      opacity: entered ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      {/* Celebration particles */}
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${10 + (i * 7.5) % 80}%`,
              top: "-5%",
              width: 4 + (i % 3) * 2,
              height: 4 + (i % 3) * 2,
              borderRadius: "50%",
              background: i % 3 === 0 ? color : i % 3 === 1 ? "#FFD700" : "#ffffff",
              opacity: 0.6,
              animation: `confettiFall ${2.5 + (i % 4) * 0.5}s ease-in infinite`,
              animationDelay: `${(i * 0.3) % 2}s`,
            }}
          />
        ))}
      </div>

      {/* Hero creature — big, bouncing */}
      <div style={{
        animation: entered ? "creatureBounce 0.6s cubic-bezier(0.34,1.56,0.64,1)" : "none",
        marginBottom: 16,
      }}>
        <Creature stage={stage} color={color} happy size={160} creatureType={creatureType} habitId={habitId} />
      </div>

      {/* Title */}
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 24,
        fontWeight: 700,
        color: "white",
        textAlign: "center",
        marginBottom: 4,
        animation: entered ? "fadeUp 0.5s ease 0.2s both" : "none",
      }}>
        Your {STAGE_NAMES[stage] || "dragon"} hatched! 🐉
      </div>

      <div style={{
        fontSize: 13,
        color: "rgba(255,255,255,0.5)",
        textAlign: "center",
        marginBottom: 20,
        animation: entered ? "fadeUp 0.5s ease 0.3s both" : "none",
      }}>
        from your <span style={{ color, fontWeight: 600 }}>{habitName}</span> habit
      </div>

      {/* Naming input */}
      <div style={{
        width: "100%",
        maxWidth: 300,
        animation: entered ? "fadeUp 0.5s ease 0.4s both" : "none",
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 8,
          textAlign: "center",
        }}>
          Give your dragon a name
        </div>

        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder="Type a name..."
          maxLength={20}
          autoFocus
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 14,
            border: `2px solid ${name.trim() ? color : "rgba(255,255,255,0.12)"}`,
            background: "rgba(255,255,255,0.06)",
            color: "white",
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
            outline: "none",
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            transition: "border-color 0.2s",
          }}
        />

        {/* Quick suggestions */}
        {showSuggestions && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "center",
            marginTop: 10,
          }}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setName(s); setShowSuggestions(false); }}
                style={{
                  padding: "5px 12px",
                  borderRadius: 100,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Character count */}
        <div style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
          textAlign: "right",
          marginTop: 4,
        }}>
          {name.length}/20
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: "flex",
        gap: 10,
        marginTop: 16,
        width: "100%",
        maxWidth: 300,
        animation: entered ? "fadeUp 0.5s ease 0.5s both" : "none",
      }}>
        <button
          onClick={onSkip}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Skip
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            flex: 2,
            padding: "12px 0",
            borderRadius: 12,
            border: "none",
            background: name.trim()
              ? `linear-gradient(135deg, ${color}, ${color}cc)`
              : "rgba(255,255,255,0.06)",
            color: name.trim() ? "white" : "rgba(255,255,255,0.2)",
            fontSize: 15,
            fontWeight: 700,
            cursor: name.trim() ? "pointer" : "default",
            fontFamily: "'Fraunces', serif",
            transition: "all 0.2s",
            boxShadow: name.trim() ? `0 4px 20px ${color}44` : "none",
          }}
        >
          Name my dragon
        </button>
      </div>

      {/* Extra keyframes for confetti */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
