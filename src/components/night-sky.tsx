"use client";

import { useMemo } from "react";
import { seed } from "@/lib/utils";

/**
 * Ambient night sky behind the whole app in dark mode.
 *
 * True black canvas with quietly pulsing stars, three faint constellations
 * (Draco the dragon — of course — plus Ursa Minor and Cassiopeia), a whisper
 * of nebula, and a rare shooting star. Deliberately restrained: opacities
 * live in the 0.03–0.5 range so cards float on top of it without competing.
 * Fixed, pointer-transparent, and frozen automatically under reduced motion.
 */

// Stylized constellation coordinates in a 0–100 local space: [x, y][],
// with `lines` as index pairs into the points array.
const CONSTELLATIONS: {
  name: string;
  points: [number, number][];
  lines: [number, number][];
  /** placement in viewBox units */
  x: number; y: number; scale: number; dur: number;
}[] = [
  {
    // Draco — a winding dragon of seven stars
    name: "draco",
    points: [[2, 60], [16, 44], [34, 52], [50, 36], [66, 42], [80, 22], [92, 30]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    x: 18, y: 60, scale: 1.5, dur: 16,
  },
  {
    // Ursa Minor — the little dipper
    name: "ursa-minor",
    points: [[4, 10], [20, 22], [36, 30], [52, 40], [70, 34], [78, 52], [58, 56]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
    x: 255, y: 470, scale: 1.1, dur: 20,
  },
  {
    // Cassiopeia — the W
    name: "cassiopeia",
    points: [[0, 30], [22, 6], [46, 24], [70, 2], [94, 18]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    x: 280, y: 130, scale: 0.9, dur: 13,
  },
];

export function NightSky() {
  // Seeded so the sky is the same every visit — YOUR sky, not random noise
  const stars = useMemo(() => {
    const r = seed(20260724);
    return Array.from({ length: 64 }, (_, i) => ({
      x: r() * 400,
      y: r() * 860,
      size: 0.35 + r() * 1.05,
      op: 0.12 + r() * 0.32,
      dur: 2.8 + r() * 4.5,
      delay: r() * 6,
      key: i,
    }));
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        pointerEvents: "none", overflow: "hidden",
      }}
    >
      <svg
        width="100%" height="100%"
        viewBox="0 0 400 860"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block" }}
      >
        <defs>
          <filter id="ns-soft"><feGaussianBlur stdDeviation="14" /></filter>
        </defs>

        {/* Whisper of nebula — blue and violet only, never green */}
        <ellipse cx="90" cy="180" rx="120" ry="70" fill="#5A6AD0" opacity="0.030" filter="url(#ns-soft)" />
        <ellipse cx="330" cy="620" rx="100" ry="80" fill="#8A5AC0" opacity="0.024" filter="url(#ns-soft)" />

        {/* Pulsing starfield */}
        {stars.map((s) => (
          <circle key={s.key} cx={s.x} cy={s.y} r={s.size} fill="#DDE2F2" opacity={s.op}>
            <animate
              attributeName="opacity"
              values={`${s.op * 0.35};${Math.min(0.6, s.op * 1.9)};${s.op * 0.35}`}
              dur={`${s.dur}s`}
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Constellations — hairline links, gently breathing */}
        {CONSTELLATIONS.map((c) => (
          <g key={c.name} transform={`translate(${c.x}, ${c.y}) scale(${c.scale})`} opacity="0.6">
            <animate attributeName="opacity" values="0.35;0.75;0.35" dur={`${c.dur}s`} repeatCount="indefinite" />
            {c.lines.map(([a, b], i) => (
              <line
                key={i}
                x1={c.points[a][0]} y1={c.points[a][1]}
                x2={c.points[b][0]} y2={c.points[b][1]}
                stroke="rgba(221,226,242,0.13)" strokeWidth="0.5"
              />
            ))}
            {c.points.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r={1.1} fill="#DDE2F2" opacity="0.5" />
            ))}
          </g>
        ))}

        {/* A rare shooting star — once every ~18s */}
        <g opacity="0">
          <line x1="70" y1="70" x2="106" y2="88" stroke="#EAEEF8" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="92" y1="81" x2="106" y2="88" stroke="#EAEEF8" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
          <animate attributeName="opacity" values="0;0;0;0.7;0" keyTimes="0;0.86;0.9;0.94;1" dur="18s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,0;180,90" keyTimes="0;0.86;0.9;1" dur="18s" repeatCount="indefinite" />
        </g>
      </svg>
    </div>
  );
}
