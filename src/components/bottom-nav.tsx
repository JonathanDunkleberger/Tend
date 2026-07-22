"use client";

import { Sprout, BarChart3, HeartPulse, Gem } from "lucide-react";
import type { ThemeColors } from "@/lib/constants";
import { BRAND } from "@/lib/constants";
import { haptic } from "@/lib/utils";

export type NavTab = "garden" | "insights" | "wellness" | "you";

const TABS: { key: NavTab; label: string; Icon: typeof Sprout }[] = [
  { key: "garden", label: "Garden", Icon: Sprout },
  { key: "insights", label: "Insights", Icon: BarChart3 },
  { key: "wellness", label: "Wellness", Icon: HeartPulse },
  { key: "you", label: "You", Icon: Gem },
];

interface BottomNavProps {
  active: NavTab | null;
  onNavigate: (tab: NavTab) => void;
  th: ThemeColors;
  darkMode: boolean;
  /** Optional dot badge on the "You" tab (e.g. unspent coins nudge) */
  youBadge?: boolean;
}

/**
 * Thumb-first bottom navigation — the app's primary nav shell.
 * Brand-green active state only (no rainbow accents) so chrome matches the landing.
 */
export function BottomNav({ active, onNavigate, th, darkMode, youBadge }: BottomNavProps) {
  const activeColor = darkMode ? BRAND.greenBright : BRAND.green;

  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: 520,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-around",
          gap: 2,
          padding: "6px 8px",
          paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))",
          background: darkMode ? "rgba(11,21,16,0.88)" : "rgba(251,250,245,0.88)",
          backdropFilter: "blur(18px) saturate(1.3)",
          WebkitBackdropFilter: "blur(18px) saturate(1.3)",
          borderTop: `1px solid ${th.cardBorder}`,
          boxShadow: darkMode
            ? "0 -4px 24px rgba(0,0,0,0.4)"
            : "0 -4px 24px rgba(23,48,31,0.06)",
        }}
      >
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => {
                haptic("light");
                onNavigate(key);
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              style={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                padding: "8px 4px 6px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                color: isActive ? activeColor : th.textMuted,
                transition: "color 0.15s ease",
              }}
            >
              <span
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 28,
                  borderRadius: 10,
                  background: isActive
                    ? darkMode
                      ? "rgba(74,222,128,0.12)"
                      : BRAND.greenSoft
                    : "transparent",
                  transition: "background 0.15s ease, transform 0.2s cubic-bezier(.34,1.56,.64,1)",
                  transform: isActive ? "translateY(-1px)" : "none",
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                {key === "you" && youBadge && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 4,
                      width: 7,
                      height: 7,
                      borderRadius: 100,
                      background: BRAND.amber,
                      boxShadow: `0 0 0 2px ${darkMode ? BRAND.forestNight : BRAND.cream}`,
                    }}
                  />
                )}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: 0.1,
                  lineHeight: 1.1,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
