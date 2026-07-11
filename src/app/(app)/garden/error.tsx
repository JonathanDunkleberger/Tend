"use client";

import { useEffect } from "react";

/**
 * Error boundary for the garden route.
 *
 * Why this exists: garden/page.tsx now THROWS when the critical Supabase reads
 * (habits, logs) fail transiently, instead of silently rendering a false-empty
 * garden / streaks-at-zero. Without a boundary that would show Next's raw error
 * page — jarring, and worst of all it reads as "my dragons and streaks are gone."
 * This gives the failure a warm, on-brand, RECOVERABLE face: it reassures the
 * user nothing was lost and offers a one-tap retry (reset() re-runs the server
 * component, which self-heals the moment the transient error clears).
 *
 * Kept deliberately palette-simple (light garden default, no THEME context at
 * this level) and dependency-free so it can't itself fail to render.
 */
export default function GardenError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for server logs / debugging; never blocks render.
    console.error("Garden failed to load:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px max(24px, env(safe-area-inset-left)) max(24px, env(safe-area-inset-bottom))",
        background: "#FAF8F3",
        color: "#1a1a2e",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 340 }}>
        <div style={{ fontSize: 52, marginBottom: 12, lineHeight: 1 }} aria-hidden>
          🌿
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 26,
            fontWeight: 600,
            margin: "0 0 10px",
            letterSpacing: "-0.01em",
          }}
        >
          Your garden needs a moment
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            color: "rgba(0,0,0,.55)",
            margin: "0 0 22px",
          }}
        >
          We couldn&apos;t reach your garden just now. Your dragons, streaks, and
          coins are all safe — this is only a hiccup on our end. Give it another try.
        </p>
        <button
          onClick={reset}
          style={{
            appearance: "none",
            border: "none",
            cursor: "pointer",
            background: "#2e7d32",
            color: "white",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 600,
            padding: "13px 30px",
            borderRadius: 999,
            boxShadow: "0 4px 16px rgba(46,125,50,0.22)",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
