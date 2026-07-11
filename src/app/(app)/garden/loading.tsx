import { Sprout, BarChart3, HeartPulse, Gem } from "lucide-react";

/**
 * Route-level loading skeleton for the garden.
 *
 * Why this exists: garden/page.tsx is a dynamic server component that awaits
 * several Supabase reads (habits, a 90-day log window, per-habit lifetime
 * counts, profile, milestones, quit/inventory/preferences) before it can render
 * anything. On a phone — especially a Supabase cold-start waking from the
 * free-tier auto-pause — that is a blank white screen for a beat or three. This
 * Suspense fallback paints instantly and MIRRORS the loaded garden's shape
 * (header wordmark + data pills, terrarium hero, habit rows, bottom nav) so the
 * real content swaps in with near-zero layout shift.
 *
 * Deliberately: a plain server component (no client JS), light-garden palette
 * (theme is DB-stored and unknown until the fetch resolves — matches error.tsx's
 * same call), and dependency-free apart from the static nav icons so it can't
 * itself fail to render. The shimmer freezes to a static block under
 * prefers-reduced-motion via the global rule in globals.css.
 */

const NAV = [
  { key: "garden", label: "Garden", Icon: Sprout, color: "#4caf50", active: true },
  { key: "insights", label: "Insights", Icon: BarChart3, color: "#8B5CF6", active: false },
  { key: "wellness", label: "Wellness", Icon: HeartPulse, color: "#38bdf8", active: false },
  { key: "you", label: "You", Icon: Gem, color: "#f59e0b", active: false },
] as const;

const MUTED = "rgba(0,0,0,.42)";

export default function GardenLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      style={{
        minHeight: "100dvh",
        background: "#FAF8F3",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        Warming your garden…
      </span>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 14px 90px" }}>
        {/* HEADER — real wordmark stays; only the data-dependent pills shimmer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 2px 8px",
            paddingTop: "max(14px, env(safe-area-inset-top))",
          }}
        >
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#1a1a2e",
            }}
          >
            tend<span style={{ color: "#4caf50" }}>.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="tend-skel" style={{ width: 50, height: 22, borderRadius: 100 }} />
            <div className="tend-skel" style={{ width: 58, height: 22, borderRadius: 100 }} />
          </div>
        </div>

        {/* TERRARIUM HERO — a soft egg silhouette hints the dragon that's loading */}
        <div
          className="tend-skel"
          style={{
            width: "100%",
            height: 320,
            borderRadius: 24,
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 92,
              height: 116,
              borderRadius: "50% 50% 48% 48% / 62% 62% 42% 42%",
              background: "rgba(0,0,0,0.05)",
            }}
            aria-hidden
          />
        </div>

        {/* HABIT ROWS — varied widths so the placeholder never reads robotic */}
        {[
          { name: "56%", sub: "34%" },
          { name: "46%", sub: "40%" },
          { name: "62%", sub: "30%" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "white",
              border: "1px solid rgba(0,0,0,0.04)",
              borderRadius: 16,
              padding: "14px 16px",
              marginTop: 10,
            }}
          >
            <div
              className="tend-skel"
              style={{ width: 40, height: 40, borderRadius: 100, flexShrink: 0 }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              <div className="tend-skel" style={{ width: row.name, height: 12, borderRadius: 6 }} />
              <div className="tend-skel" style={{ width: row.sub, height: 9, borderRadius: 6 }} />
            </div>
            <div
              className="tend-skel"
              style={{ width: 26, height: 26, borderRadius: 100, flexShrink: 0 }}
            />
          </div>
        ))}
      </div>

      {/* BOTTOM NAV — a static mirror of the real BottomNav so hydration swaps
          it in place with zero shift (Garden pre-highlighted). */}
      <nav
        aria-hidden
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
            width: "100%",
            maxWidth: 520,
            display: "flex",
            justifyContent: "space-around",
            gap: 2,
            padding: "6px 8px",
            paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(18px) saturate(1.4)",
            WebkitBackdropFilter: "blur(18px) saturate(1.4)",
            borderTop: "1px solid rgba(0,0,0,0.04)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.05)",
          }}
        >
          {NAV.map(({ key, label, Icon, color, active }) => (
            <div
              key={key}
              style={{
                position: "relative",
                flex: 1,
                minHeight: 52,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "4px 0",
              }}
            >
              {active && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    width: 44,
                    height: 30,
                    borderRadius: 100,
                    background: `${color}1f`,
                  }}
                />
              )}
              <span style={{ position: "relative", display: "flex" }}>
                <Icon
                  size={22}
                  color={active ? color : MUTED}
                  strokeWidth={active ? 2.4 : 2}
                  fill={active ? `${color}26` : "transparent"}
                />
              </span>
              <span
                style={{
                  position: "relative",
                  fontSize: 10,
                  fontWeight: active ? 700 : 600,
                  letterSpacing: "0.1px",
                  color: active ? color : MUTED,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
