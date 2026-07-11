"use client";

import {
  Crown, LayoutGrid, Store, Settings, Sun, Moon, LogOut, ExternalLink,
  Coins, Flame, ChevronRight, Sparkles,
} from "lucide-react";
import type { ThemeColors, SeasonKey } from "@/lib/constants";
import { SEASONS } from "@/lib/constants";
import { haptic } from "@/lib/utils";

interface YouScreenProps {
  th: ThemeColors;
  darkMode: boolean;
  season: SeasonKey;
  profile: { firstName?: string | null; imageUrl?: string; email?: string };
  isPro: boolean;
  coins: number;
  dragonCount: number;
  bestStreak: number;
  onSeasonChange: (s: SeasonKey) => void;
  onToggleDark: () => void;
  onOpenGallery: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onManageSubscription: () => void;
  onUpgrade: () => void;
  onSignOut: () => void;
}

/**
 * "You" — the profile/account home. Replaces the old slide-out menu with a
 * thumb-first screen: identity, Tend+ status, quick stats, and settings.
 */
export function YouScreen({
  th, darkMode, season, profile, isPro, coins, dragonCount, bestStreak,
  onSeasonChange, onToggleDark, onOpenGallery, onOpenShop, onOpenSettings,
  onManageSubscription, onUpgrade, onSignOut,
}: YouScreenProps) {
  const initial = (profile.firstName || profile.email || "?").charAt(0).toUpperCase();

  const stats: { label: string; value: string; Icon: typeof Coins; color: string }[] = [
    { label: "Coins", value: `${coins}`, Icon: Coins, color: "#f59e0b" },
    { label: "Dragons", value: `${dragonCount}`, Icon: Sparkles, color: "#8B5CF6" },
    { label: "Best streak", value: `${bestStreak}d`, Icon: Flame, color: "#ef7d3a" },
  ];

  const rows: { label: string; Icon: typeof Coins; color: string; onTap: () => void }[] = [
    { label: "Collection", Icon: LayoutGrid, color: th.textSub, onTap: onOpenGallery },
    { label: "World Shop", Icon: Store, color: "#f59e0b", onTap: onOpenShop },
    { label: "Settings", Icon: Settings, color: th.textSub, onTap: onOpenSettings },
  ];

  return (
    <div style={{ animation: "fadeUp 0.28s ease", paddingBottom: 90 }}>
      {/* Identity header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 2px 18px" }}>
        {profile.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.imageUrl}
            alt=""
            width={60}
            height={60}
            style={{ borderRadius: 18, border: `2px solid ${isPro ? "#4ade80" : th.cardBorder}` }}
          />
        ) : (
          <div style={{
            width: 60, height: 60, borderRadius: 18, background: th.progressBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 700, color: th.textMuted, border: `2px solid ${th.cardBorder}`,
          }}>
            {initial}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text, letterSpacing: "-0.5px" }}>
              {profile.firstName || "Tender"}
            </h2>
            {isPro && <Crown size={16} color="#fbbf24" />}
          </div>
          <div style={{ fontSize: 12, color: th.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile.email || ""}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} style={{
            padding: "14px 8px", borderRadius: 16, background: th.card,
            border: `1px solid ${th.cardBorder}`, boxShadow: th.cardShadow, textAlign: "center",
          }}>
            <Icon size={16} color={color} style={{ marginBottom: 6 }} />
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: th.text }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: th.textMuted, letterSpacing: 0.3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tend+ card */}
      <div style={{
        padding: "16px 16px", borderRadius: 18, marginBottom: 16,
        background: isPro
          ? "linear-gradient(135deg, rgba(74,222,128,0.10), rgba(74,222,128,0.03))"
          : darkMode ? "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(56,189,248,0.05))" : "linear-gradient(135deg, rgba(74,222,128,0.07), rgba(56,189,248,0.04))",
        border: `1px solid ${isPro ? "rgba(74,222,128,0.25)" : th.cardBorder}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <Crown size={15} color={isPro ? "#4ade80" : "#f59e0b"} />
              <span style={{ fontSize: 15, fontWeight: 700, color: th.text }}>
                {isPro ? "Tend+" : "Tend+ awaits"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.4 }}>
              {isPro ? "Thank you for growing with us 💚" : "Unlimited habits, every dragon, custom colors."}
            </div>
          </div>
          {isPro ? (
            <button onClick={() => { haptic("light"); onManageSubscription(); }} style={{
              flexShrink: 0, background: "none", border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700,
              color: "#4ade80", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
            }}>
              Manage <ExternalLink size={11} />
            </button>
          ) : (
            <button onClick={() => { haptic("light"); onUpgrade(); }} style={{
              flexShrink: 0, background: "#4ade80", border: "none",
              borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700,
              color: "#0a0e18", fontFamily: "inherit",
            }}>
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Navigation rows */}
      <div style={{ borderRadius: 18, background: th.card, border: `1px solid ${th.cardBorder}`, boxShadow: th.cardShadow, overflow: "hidden", marginBottom: 16 }}>
        {rows.map(({ label, Icon, color, onTap }, i) => (
          <button key={label} onClick={() => { haptic("light"); onTap(); }} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", width: "100%",
            background: "none", border: "none", borderTop: i === 0 ? "none" : `1px solid ${th.cardBorder}`,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          }}>
            <Icon size={19} color={color} />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: th.text }}>{label}</span>
            <ChevronRight size={17} color={th.textMuted} />
          </button>
        ))}
      </div>

      {/* Appearance */}
      <div style={{ borderRadius: 18, background: th.card, border: `1px solid ${th.cardBorder}`, boxShadow: th.cardShadow, padding: "14px 16px", marginBottom: 16 }}>
        <button onClick={() => { haptic("light"); onToggleDark(); }} style={{
          display: "flex", alignItems: "center", gap: 12, width: "100%",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          marginBottom: 14,
        }}>
          {darkMode ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color={th.textSub} />}
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: th.text }}>
            {darkMode ? "Light mode" : "Dark mode"}
          </span>
          <span style={{
            width: 42, height: 24, borderRadius: 100, position: "relative", transition: "background .2s",
            background: darkMode ? "#4ade80" : th.progressBg,
          }}>
            <span style={{
              position: "absolute", top: 2, left: darkMode ? 20 : 2, width: 20, height: 20, borderRadius: "50%",
              background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left .2s cubic-bezier(.34,1.56,.64,1)",
            }} />
          </span>
        </button>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: th.textMuted, marginBottom: 8 }}>
          Season
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["spring", "summer", "autumn", "winter"] as SeasonKey[]).map((s) => (
            <button key={s} onClick={() => { haptic("light"); onSeasonChange(s); }} style={{
              flex: 1, padding: "8px 4px", borderRadius: 10, border: "none",
              background: season === s ? (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent",
              cursor: "pointer", fontSize: 11, fontWeight: 700,
              color: season === s ? th.text : th.textMuted, fontFamily: "inherit", transition: "all .15s",
            }}>
              {SEASONS[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button onClick={onSignOut} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%",
        padding: "13px 0", borderRadius: 14, background: "none", border: `1px solid ${th.cardBorder}`,
        cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: th.textSub,
      }}>
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}
