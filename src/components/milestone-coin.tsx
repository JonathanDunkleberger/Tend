"use client";

import { useEffect, useState } from "react";

/* ═══════════ AA-STYLE MILESTONE COINS ═══════════ */

export interface CoinTier {
  key: string;
  label: string;
  hours: number;       // threshold in hours (for quit habits)
  days: number;        // threshold in days (for build habits)
  color: string;       // main coin color
  rim: string;         // rim / border color
  symbol: string;      // text displayed on coin face
  metallic: string;    // gradient highlight color
}

export const MILESTONE_COINS: CoinTier[] = [
  { key: "2h",   label: "2 Hours",    hours: 2,     days: 0,   color: "#CD7F32", rim: "#a0622a", symbol: "2H",   metallic: "#e8a860" },
  { key: "6h",   label: "6 Hours",    hours: 6,     days: 0,   color: "#CD7F32", rim: "#a0622a", symbol: "6H",   metallic: "#e8a860" },
  { key: "12h",  label: "12 Hours",   hours: 12,    days: 0,   color: "#CD7F32", rim: "#a0622a", symbol: "12H",  metallic: "#e8a860" },
  { key: "24h",  label: "24 Hours",   hours: 24,    days: 1,   color: "#C0C0C0", rim: "#8a8a8a", symbol: "1D",   metallic: "#e0e0e0" },
  { key: "48h",  label: "48 Hours",   hours: 48,    days: 2,   color: "#C0C0C0", rim: "#8a8a8a", symbol: "2D",   metallic: "#e0e0e0" },
  { key: "72h",  label: "72 Hours",   hours: 72,    days: 3,   color: "#C0C0C0", rim: "#8a8a8a", symbol: "3D",   metallic: "#e0e0e0" },
  { key: "7d",   label: "1 Week",     hours: 168,   days: 7,   color: "#FFD700", rim: "#c9a800", symbol: "7D",   metallic: "#fff3a0" },
  { key: "14d",  label: "2 Weeks",    hours: 336,   days: 14,  color: "#FFD700", rim: "#c9a800", symbol: "14D",  metallic: "#fff3a0" },
  { key: "30d",  label: "1 Month",    hours: 720,   days: 30,  color: "#E5C100", rim: "#b8960a", symbol: "30D",  metallic: "#fff070" },
  { key: "60d",  label: "2 Months",   hours: 1440,  days: 60,  color: "#50C878", rim: "#38a05c", symbol: "60D",  metallic: "#80e8a0" },
  { key: "90d",  label: "3 Months",   hours: 2160,  days: 90,  color: "#4169E1", rim: "#2a4fba", symbol: "90D",  metallic: "#7090f0" },
  { key: "180d", label: "6 Months",   hours: 4320,  days: 180, color: "#9B59B6", rim: "#7d3f9a", symbol: "180D", metallic: "#c080e0" },
  { key: "365d", label: "1 Year",     hours: 8760,  days: 365, color: "#E74C3C", rim: "#c0392b", symbol: "1Y",   metallic: "#f08070" },
];

/* ── Single coin SVG ── */
interface MilestoneCoinProps {
  tier: CoinTier;
  size?: number;
  earned?: boolean;
  glow?: boolean;
  style?: React.CSSProperties;
}

export function MilestoneCoin({ tier, size = 32, earned = true, glow = false, style }: MilestoneCoinProps) {
  const r = size / 2;
  const fontSize = size < 20 ? 5 : size < 30 ? 7 : size < 44 ? 9 : 12;
  const uid = `${tier.key}-${size}`;
  const tickCount = 28; // reeded edge, like a real sobriety chip

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        filter: earned
          ? (glow ? `drop-shadow(0 0 ${size * 0.2}px ${tier.color}80)` : `drop-shadow(0 1px 2px rgba(23,48,31,0.18))`)
          : "grayscale(1)",
        opacity: earned ? 1 : 0.28,
        animation: glow ? "coinGlow 2s ease-in-out infinite" : undefined,
        ...style,
      }}
    >
      <defs>
        <radialGradient id={`cg-${uid}`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor={tier.metallic} />
          <stop offset="70%" stopColor={tier.color} />
          <stop offset="100%" stopColor={tier.rim} />
        </radialGradient>
        <linearGradient id={`cr-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tier.metallic} />
          <stop offset="45%" stopColor={tier.rim} />
          <stop offset="100%" stopColor={tier.color} />
        </linearGradient>
      </defs>
      {/* Outer rim — metallic gradient instead of flat color */}
      <circle cx={r} cy={r} r={r - 0.5} fill={`url(#cr-${uid})`} />
      {/* Reeded edge ticks */}
      {Array.from({ length: tickCount }).map((_, i) => {
        const a = (i * 360 / tickCount) * Math.PI / 180;
        return (
          <line
            key={i}
            x1={r + (r - 0.5) * Math.cos(a)}
            y1={r + (r - 0.5) * Math.sin(a)}
            x2={r + (r - size * 0.07) * Math.cos(a)}
            y2={r + (r - size * 0.07) * Math.sin(a)}
            stroke={tier.metallic}
            strokeWidth={size * 0.015}
            opacity={0.55}
          />
        );
      })}
      {/* Inner face with gradient */}
      <circle cx={r} cy={r} r={r - size * 0.1} fill={`url(#cg-${uid})`} />
      {/* Double embossed inner ring */}
      <circle cx={r} cy={r} r={r - size * 0.16} fill="none" stroke={tier.rim} strokeWidth={size * 0.014} opacity={0.5} />
      <circle cx={r} cy={r} r={r - size * 0.2} fill="none" stroke={tier.metallic} strokeWidth={size * 0.01} opacity={0.45} />
      {/* Shine sweep — soft highlight across the upper left */}
      <ellipse
        cx={r - size * 0.14} cy={r - size * 0.18}
        rx={size * 0.3} ry={size * 0.16}
        fill="white" opacity={0.16}
        transform={`rotate(-28 ${r - size * 0.14} ${r - size * 0.18})`}
      />
      {/* Symbol text — embossed: light offset under dark face text */}
      <text
        x={r}
        y={r + fontSize * 0.38}
        textAnchor="middle"
        fill={tier.metallic}
        fontSize={fontSize}
        fontWeight={800}
        fontFamily="'Fraunces', serif"
        opacity={0.55}
      >
        {tier.symbol}
      </text>
      <text
        x={r}
        y={r + fontSize * 0.3}
        textAnchor="middle"
        fill={tier.rim}
        fontSize={fontSize}
        fontWeight={800}
        fontFamily="'Fraunces', serif"
      >
        {tier.symbol}
      </text>
    </svg>
  );
}

/* ── Coin row for detail page ── */
interface CoinRowProps {
  habitId: string;
  earnedCoins: string[];   // array of coin keys earned (e.g. ["2h", "6h", "24h"])
  isQuit?: boolean;
}

export function CoinRow({ earnedCoins, isQuit }: CoinRowProps) {
  const coins = isQuit
    ? MILESTONE_COINS
    : MILESTONE_COINS.filter((c) => c.days > 0);

  const latestIdx = coins.reduce((maxI, c, i) => earnedCoins.includes(c.key) ? i : maxI, -1);

  return (
    <div style={{
      display: "flex", gap: 4, overflowX: "auto", padding: "2px 0",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
    }}>
      {coins.map((c, i) => {
        const isEarned = earnedCoins.includes(c.key);
        const isLatest = i === latestIdx;
        return (
          <div key={c.key} style={{ position: "relative", flexShrink: 0, textAlign: "center" }}>
            <MilestoneCoin
              tier={c}
              size={isLatest ? 48 : 40}
              earned={isEarned}
              glow={isLatest}
            />
            {/* Every tier gets a label — the unearned ones read as the road
                ahead instead of anonymous grey ghosts */}
            <div style={{
              fontSize: 7, textAlign: "center",
              color: isEarned ? c.color : "rgba(128,128,128,0.55)",
              fontWeight: 700, marginTop: 1, opacity: isEarned ? 0.85 : 1,
            }}>
              {c.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Tiny coin badge for habit row ── */
interface CoinBadgeProps {
  earnedCoins: string[];
  isQuit?: boolean;
}

export function CoinBadge({ earnedCoins, isQuit }: CoinBadgeProps) {
  const coins = isQuit
    ? MILESTONE_COINS
    : MILESTONE_COINS.filter((c) => c.days > 0);

  // Find latest earned coin
  const latest = [...coins].reverse().find((c) => earnedCoins.includes(c.key));
  if (!latest) return null;

  return <MilestoneCoin tier={latest} size={24} earned glow={false} />;
}

/* ── Celebration overlay ── */
interface MilestoneCelebrationProps {
  tier: CoinTier;
  habitName: string;
  coinReward: number;
  onDismiss: () => void;
}

export function MilestoneCelebration({ tier, habitName, coinReward, onDismiss }: MilestoneCelebrationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        cursor: "pointer",
      }}
    >
      <div style={{ animation: "coinSpin 1s ease-out", marginBottom: 20 }}>
        <MilestoneCoin tier={tier} size={120} earned glow />
      </div>
      <div style={{
        fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 800,
        color: tier.color, marginBottom: 6, textAlign: "center",
        textShadow: `0 0 20px ${tier.color}40`,
      }}>
        {tier.label}
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16, textAlign: "center" }}>
        {habitName}
      </div>
      {coinReward > 0 && (
        <div style={{
          fontSize: 18, fontWeight: 700, color: "#FFD700",
          display: "flex", alignItems: "center", gap: 6,
          animation: "fadeUp 0.5s ease 0.5s both",
        }}>
          +{coinReward} coins
        </div>
      )}
      <div style={{
        fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 24,
        animation: "fadeUp 0.5s ease 1s both",
      }}>
        Tap to dismiss
      </div>
    </div>
  );
}
