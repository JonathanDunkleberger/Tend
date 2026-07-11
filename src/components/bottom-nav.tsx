"use client";

import { Sprout, BarChart3, HeartPulse, Gem } from "lucide-react";
import type { ThemeColors } from "@/lib/constants";
import { haptic } from "@/lib/utils";

export type NavTab = "garden" | "insights" | "wellness" | "you";

const TABS: { key: NavTab; label: string; Icon: typeof Sprout; color: string }[] = [
  { key: "garden", label: "Garden", Icon: Sprout, color: "#4caf50" },
  { key: "insights", label: "Insights", Icon: BarChart3, color: "#8B5CF6" },
  { key: "wellness", label: "Wellness", Icon: HeartPulse, color: "#38bdf8" },
  { key: "you", label: "You", Icon: Gem, color: "#f59e0b" },
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
 * Safe-area aware, 4 large tap targets, spring-y active state.
 * Mobile-first: fixed to the viewport bottom, blur backdrop, max-width matched
 * to the app column so it feels native on a phone.
 */
export function BottomNav({ active, onNavigate, th, darkMode, youBadge }: BottomNavProps) {
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
          background: darkMode ? "rgba(20,20,36,0.82)" : "rgba(255,255,255,0.82)",
          backdropFilter: "blur(18px) saturate(1.4)",
          WebkitBackdropFilter: "blur(18px) saturate(1.4)",
          borderTop: `1px solid ${th.cardBorder}`,
          boxShadow: darkMode
            ? "0 -4px 24px rgba(0,0,0,0.35)"
            : "0 -4px 24px rgba(0,0,0,0.05)",
        }}
      >
        {TABS.map(({ key, label, Icon, color }) => {
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
                minHeight: 52,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                WebkitTapHighlightColor: "transparent",
                padding: "4px 0",
              }}
            >
              {/* Active pill behind the icon */}
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  width: 44,
                  height: 30,
                  borderRadius: 100,
                  background: isActive ? `${color}1f` : "transparent",
                  transform: isActive ? "scale(1)" : "scale(0.6)",
                  opacity: isActive ? 1 : 0,
                  transition: "transform .32s cubic-bezier(.34,1.56,.64,1), opacity .2s ease",
                }}
              />
              <span
                style={{
                  position: "relative",
                  display: "flex",
                  transform: isActive ? "translateY(-1px) scale(1.04)" : "translateY(0) scale(1)",
                  transition: "transform .32s cubic-bezier(.34,1.56,.64,1)",
                }}
              >
                <Icon
                  size={22}
                  color={isActive ? color : th.textMuted}
                  strokeWidth={isActive ? 2.4 : 2}
                  fill={isActive ? `${color}26` : "transparent"}
                />
                {key === "you" && youBadge && (
                  <span
                    style={{
                      position: "absolute",
                      top: -1,
                      right: -2,
                      width: 7,
                      height: 7,
                      borderRadius: 100,
                      background: "#f59e0b",
                      border: `1.5px solid ${darkMode ? "#141424" : "#fff"}`,
                    }}
                  />
                )}
              </span>
              <span
                style={{
                  position: "relative",
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: "0.1px",
                  color: isActive ? color : th.textMuted,
                  transition: "color .2s ease",
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
