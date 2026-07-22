"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

type Mode = "sign-in" | "sign-up";

/**
 * Branded shell around Clerk's SignIn/SignUp.
 * Always renders children — do NOT gate on ClerkLoading/ClerkLoaded (that pair
 * was leaving a header with zero form when clerk-js stalled or Account Portal
 * paths conflicted).
 */
export function AuthScreen({ mode, children }: { mode: Mode; children: ReactNode }) {
  const { loaded } = useClerk();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShowHelp(true), 6000);
    return () => window.clearTimeout(id);
  }, []);

  const title = mode === "sign-in" ? "Welcome back" : "Start your garden";
  const subtitle =
    mode === "sign-in"
      ? "Sign in to tend your habits and dragons."
      : "Create an account — each habit is an egg that hatches as you show up.";

  return (
    <main style={shell}>
      <Link href="/" style={logo}>
        tend<span style={{ color: "#2E9E5B" }}>.</span>
      </Link>
      <h1 style={h1}>{title}</h1>
      <p style={sub}>{subtitle}</p>

      <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>

      {!loaded && (
        <p style={{ marginTop: 20, fontSize: 13, opacity: 0.55 }}>Loading secure sign-in…</p>
      )}

      {showHelp && !loaded && (
        <div style={help}>
          <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Still loading?</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, opacity: 0.8 }}>
            Hard-refresh (Ctrl+Shift+R) or try Incognito. In Clerk Dashboard open{" "}
            <strong>Account Portal</strong> (left sidebar) — Sign-in / Sign-up URLs must be{" "}
            <code>https://www.hatchtend.com/sign-in</code> and{" "}
            <code>https://www.hatchtend.com/sign-up</code>, not accounts.hatchtend.com.
          </p>
        </div>
      )}
    </main>
  );
}

const shell: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 20px 48px",
  background: "#FBFAF5",
  color: "#17301F",
  fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
};

const logo: CSSProperties = {
  fontFamily: "Fraunces,Georgia,serif",
  fontSize: 28,
  fontWeight: 700,
  color: "#17301F",
  textDecoration: "none",
  marginBottom: 8,
};

const h1: CSSProperties = {
  fontFamily: "Fraunces,Georgia,serif",
  fontSize: 22,
  fontWeight: 600,
  margin: "12px 0 4px",
  textAlign: "center",
};

const sub: CSSProperties = {
  fontSize: 14,
  opacity: 0.72,
  textAlign: "center",
  maxWidth: 320,
  margin: "0 0 28px",
  lineHeight: 1.45,
};

const help: CSSProperties = {
  marginTop: 24,
  maxWidth: 420,
  padding: "16px 18px",
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #f0d8d8",
  textAlign: "left",
};
