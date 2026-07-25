"use client";

import { useMemo, useState } from "react";
import { getDragonSprite, deriveDragonFromId } from "@/lib/sprites";
import { haptic } from "@/lib/utils";
import type { ThemeColors } from "@/lib/constants";
import type { HabitWithStats } from "@/types";

/**
 * The Dragon Cradle — the companion's HOME, not a sprite on a card.
 *
 * This is the parasocial heart of the detail page: a woven nest on a grassy
 * knoll under a day/night sky, where the dragon (or its egg) visibly LIVES.
 * It has moods (sleeping at night, thriving on a streak, waiting when
 * neglected), a status line written like a pet sitter's note, a "together N
 * days" bond counter, and it can be petted — tap the dragon and it bounces
 * and throws hearts. Log in every day just to see how it's doing.
 */

type Mood = "sleeping" | "neglected" | "thriving" | "healthy";

function getMood(tendedToday: boolean, streak: number): Mood {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) return "sleeping";
  if (!tendedToday && hour >= 15) return "neglected";
  if (streak >= 7) return "thriving";
  return "healthy";
}

/** Pet-sitter notes — first person plural warmth, never guilt-trippy. */
function moodLine(mood: Mood, isEgg: boolean, tendedToday: boolean, name: string): string {
  if (isEgg) {
    if (mood === "sleeping") return "the egg rests quietly in the dark";
    return tendedToday
      ? "the egg is warm and safe — it can feel you close"
      : "the egg feels a little cool — tend today to warm it";
  }
  switch (mood) {
    case "sleeping": return `${name} is fast asleep — dreaming of tomorrow`;
    case "thriving": return `${name} is thriving, warmed by your streak`;
    case "neglected": return `${name} is watching the path, waiting for you`;
    default: return tendedToday ? `${name} is happy you're here` : `${name} perks up when you visit`;
  }
}

interface DragonCradleProps {
  habit: HabitWithStats;
  stage: number;
  tendedToday: boolean;
  streak: number;
  darkMode: boolean;
  th: ThemeColors;
}

export function DragonCradle({ habit, stage, tendedToday, streak, darkMode, th }: DragonCradleProps) {
  const night = darkMode;
  const mood = getMood(tendedToday, streak);
  const isEgg = stage === 0;
  const species = habit.creature_type || deriveDragonFromId(habit.id);
  const spritePath = getDragonSprite(stage, species);
  const petName = habit.creature_name || "your dragon";

  // Bond counter — days since this companion came into your life
  const daysTogether = useMemo(() => {
    const ms = Date.now() - new Date(habit.created_at).getTime();
    return Math.max(1, Math.floor(ms / 86400000) + 1);
  }, [habit.created_at]);

  // Petting: tap → bounce + a burst of floating hearts
  const [petAt, setPetAt] = useState(0);
  const [hearts, setHearts] = useState<number[]>([]);
  const pet = () => {
    haptic("light");
    const now = Date.now();
    setPetAt(now);
    setHearts((h) => [...h.slice(-6), now, now + 1, now + 2]);
    setTimeout(() => setHearts((h) => h.filter((id) => now - id < 1600)), 1700);
  };

  const skyBg = night
    ? "radial-gradient(ellipse at 50% 30%, #16281e 0%, #0d1a12 70%)"
    : "radial-gradient(ellipse at 50% 25%, #F0FAFF 0%, #DDF1FA 55%, #CBE8F6 100%)";
  const moundFill = night ? "#1d3526" : "#7ABF5E";
  const moundShade = night ? "#16291d" : "#69AF4E";
  const nestDark = night ? "#4a3620" : "#7A5C36";
  const nestMid = night ? "#5d472c" : "#96754A";
  const nestLight = night ? "#75593a" : "#B08F60";

  const spriteFilter = mood === "sleeping"
    ? "saturate(0.45) brightness(0.72)"
    : mood === "neglected"
      ? "saturate(0.6) brightness(0.88)"
      : tendedToday || isEgg ? "none" : "saturate(0.7) brightness(0.92)";

  const spriteAnim = petAt && Date.now() - petAt < 600
    ? "creatureBounce 0.5s cubic-bezier(0.34,1.56,0.64,1)"
    : mood === "sleeping"
      ? "creatureIdleFloat 4.5s ease-in-out infinite"
      : mood === "thriving"
        ? "bob 2s ease-in-out infinite"
        : "creatureFloat 3s ease-in-out infinite";

  return (
    <div>
      {/* ── The scene ── */}
      <div
        onClick={pet}
        role="button"
        tabIndex={0}
        aria-label={`Pet ${petName}`}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pet(); } }}
        style={{
          position: "relative", height: 210, borderRadius: 18, overflow: "hidden",
          background: skyBg, cursor: "pointer", userSelect: "none",
          boxShadow: night
            ? "inset 0 1px 0 rgba(255,255,255,0.05)"
            : "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -12px 24px rgba(46,158,91,0.06)",
        }}
      >
        <svg viewBox="0 0 320 210" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0 }}>
          {/* Night: stars + crescent moon. Day: sun wash + drifting cloud */}
          {night ? (
            <>
              {[[30, 28, 1.1], [70, 52, 0.7], [120, 22, 0.9], [205, 38, 0.7], [258, 20, 1.2], [288, 58, 0.8], [175, 60, 0.6], [45, 80, 0.7]].map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={0.5}>
                  <animate attributeName="opacity" values="0.2;0.65;0.2" dur={`${2.5 + i * 0.7}s`} repeatCount="indefinite" />
                </circle>
              ))}
              <path d="M282,30 a13,13 0 1,0 10,21 a10.5,10.5 0 1,1 -10,-21z" fill="#FFFDE8" opacity="0.75" />
            </>
          ) : (
            <>
              <circle cx="278" cy="38" r="30" fill="#FFE9A8" opacity="0.4" />
              <circle cx="278" cy="38" r="15" fill="#FFD966" opacity="0.85" />
              <ellipse cx="70" cy="45" rx="26" ry="7" fill="white" opacity="0.55">
                <animateTransform attributeName="transform" type="translate" values="-10,0;12,0;-10,0" dur="20s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="180" cy="26" rx="18" ry="5" fill="white" opacity="0.4">
                <animateTransform attributeName="transform" type="translate" values="8,0;-10,0;8,0" dur="26s" repeatCount="indefinite" />
              </ellipse>
            </>
          )}

          {/* Hanging mobile — a star charm swaying above the nest */}
          <g style={{ transformOrigin: "58px 0px", animation: "cradleSway 5.5s ease-in-out infinite" }}>
            <line x1="58" y1="0" x2="58" y2="42" stroke={night ? "rgba(255,255,255,0.22)" : "rgba(23,48,31,0.2)"} strokeWidth="1" />
            <path d="M58,42 l2.6,5.3 5.9,0.9 -4.3,4.1 1,5.8 -5.2,-2.7 -5.2,2.7 1,-5.8 -4.3,-4.1 5.9,-0.9z"
              fill={night ? "#FFE9A8" : "#F5A623"} opacity={night ? 0.85 : 0.75} />
          </g>

          {/* Grassy knoll */}
          <ellipse cx="160" cy="228" rx="190" ry="62" fill={moundShade} />
          <ellipse cx="160" cy="234" rx="185" ry="60" fill={moundFill} />
          {/* Grass tufts */}
          {[[52, 186], [96, 178], [232, 179], [270, 188], [130, 174], [196, 175]].map(([x, y], i) => (
            <g key={i} stroke={night ? "#2c4a35" : "#5CA83E"} strokeWidth="1.6" strokeLinecap="round">
              <line x1={x} y1={y} x2={x - 3} y2={y - 7} />
              <line x1={x} y1={y} x2={x} y2={y - 9} />
              <line x1={x} y1={y} x2={x + 3} y2={y - 7} />
            </g>
          ))}
          {/* Tiny flowers by day */}
          {!night && [[70, 190, "#FFB6C1"], [244, 191, "#E8A0BF"], [160, 200, "#F8C8DC"]].map(([x, y, c], i) => (
            <g key={i}>
              <circle cx={Number(x)} cy={Number(y)} r="2.4" fill={String(c)} opacity="0.9" />
              <circle cx={Number(x)} cy={Number(y)} r="1" fill="#FFF8DC" />
            </g>
          ))}

          {/* The nest — woven bowl with a blanket tinted to the habit color */}
          <ellipse cx="160" cy="176" rx="56" ry="16" fill={nestDark} />
          <ellipse cx="160" cy="172" rx="52" ry="14" fill={nestMid} />
          <ellipse cx="160" cy="169" rx="44" ry="10" fill={night ? "#241a10" : "#5C4326"} />
          {/* Blanket */}
          <ellipse cx="160" cy="169" rx="38" ry="8" fill={habit.color} opacity={night ? 0.35 : 0.4} />
          <ellipse cx="160" cy="168" rx="30" ry="6" fill={habit.color} opacity={night ? 0.25 : 0.3} />
          {/* Woven twigs across the front of the bowl */}
          {[
            "M110,172 q25,14 50,13 q28,-1 48,-12",
            "M114,177 q24,12 46,11 q26,-1 44,-10",
            "M120,182 q20,9 40,8 q22,-1 38,-8",
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={nestLight} strokeWidth={2.2 - i * 0.4} strokeLinecap="round" opacity={0.85 - i * 0.15} />
          ))}
          <path d="M108,170 q28,17 52,16 q30,-1 52,-15" fill="none" stroke={nestDark} strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />

          {/* Warmth shimmer rising off the egg when tended */}
          {isEgg && tendedToday && [0, 1, 2].map((i) => (
            <circle key={i} cx={148 + i * 12} cy={130} r="1.6" fill={night ? "#FFE9A8" : "#F5A623"} opacity="0">
              <animate attributeName="opacity" values="0;0.6;0" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.6}s`} />
              <animate attributeName="cy" values="132;108" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.6}s`} />
            </circle>
          ))}
        </svg>

        {/* The companion — perched in the nest */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spritePath}
          alt={petName}
          width={116}
          height={116}
          draggable={false}
          style={{
            position: "absolute", left: "50%", bottom: 52, transform: "translateX(-50%)",
            objectFit: "contain", pointerEvents: "none",
            filter: spriteFilter,
            transition: "filter 0.5s ease",
            animation: spriteAnim,
          }}
        />

        {/* Soft glow beneath when happy */}
        <div style={{
          position: "absolute", left: "50%", bottom: 40, transform: "translateX(-50%)",
          width: 120, height: 44, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${habit.color}${tendedToday ? "40" : "1a"} 0%, transparent 70%)`,
          pointerEvents: "none", transition: "background 0.5s ease",
        }} />

        {/* ZZZ when sleeping */}
        {mood === "sleeping" && !isEgg && (
          <div style={{ position: "absolute", left: "58%", bottom: 150, pointerEvents: "none" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                position: "absolute", left: i * 7, top: -i * 6,
                fontSize: 9 + i * 3, fontWeight: 700,
                color: night ? "rgba(180,200,255,0.55)" : "rgba(110,130,180,0.55)",
                animation: "zzzFloat 2.5s ease-in-out infinite",
                animationDelay: `${i * 0.6}s`,
              }}>z</span>
            ))}
          </div>
        )}

        {/* Pet hearts — burst upward on tap */}
        {hearts.map((id, i) => (
          <span key={id} style={{
            position: "absolute", left: `${46 + (i % 3) * 6}%`, bottom: 120,
            fontSize: 14 + (i % 3) * 3, pointerEvents: "none",
            color: "#ff6b9d",
            animation: "cradleHeart 1.5s ease-out forwards",
            animationDelay: `${(i % 3) * 0.12}s`,
          }}>♥</span>
        ))}

        {/* Bond chip */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "4px 10px", borderRadius: 100,
          background: night ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          fontSize: 10, fontWeight: 700,
          color: night ? "rgba(255,255,255,0.75)" : "#1F7A46",
          border: `1px solid ${night ? "rgba(255,255,255,0.1)" : "rgba(46,158,91,0.18)"}`,
        }}>
          {daysTogether === 1 ? "Day 1 together" : `Together ${daysTogether} days`}
        </div>

        {/* Tap hint — only until first pet, only for hatched dragons */}
        {!isEgg && hearts.length === 0 && (
          <div style={{
            position: "absolute", bottom: 8, right: 12,
            fontSize: 9, fontWeight: 600, fontStyle: "italic",
            color: night ? "rgba(255,255,255,0.3)" : "rgba(23,48,31,0.3)",
            pointerEvents: "none",
          }}>
            tap to pet
          </div>
        )}
      </div>

      {/* Pet-sitter note */}
      <p style={{
        fontSize: 12, fontStyle: "italic", color: th.textSub,
        textAlign: "center", marginTop: 10, lineHeight: 1.4,
      }}>
        {moodLine(mood, isEgg, tendedToday, petName)}
      </p>
    </div>
  );
}
