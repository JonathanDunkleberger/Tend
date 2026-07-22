"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

type Mode = "sign-in" | "sign-up";

export function AuthScreen({ mode, children }: { mode: Mode; children: ReactNode }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setStuck(true), 8000);
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
      <div style={{ width: "100%", maxWidth: 400 }}>
        <ClerkLoading>
          {stuck ? (
            <div style={cardWarn}>
              <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Sign-in is stuck</p>
              <p style={{ margin: "0 0 16px", fontSize: 13, opacity: 0.75, lineHeight: 1.45 }}>
                Try a hard refresh (Ctrl+Shift+R) or an Incognito window. Ad blockers sometimes block the auth script.
              </p>
              <a href={mode === "sign-in" ? "/sign-in" : "/sign-up"} style={btn}>
                Retry
              </a>
            </div>
          ) : (
            <div style={card}>
              <div aria-hidden style={spinner} />
              <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>Loading secure sign-in…</p>
              <style>{`@keyframes tendSpin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </ClerkLoading>
        <ClerkLoaded>{children}</ClerkLoaded>
      </div>
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

const card: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  padding: "40px 24px",
  background: "#fff",
  borderRadius: 24,
  border: "1px solid #d8f0e0",
};

const cardWarn: CSSProperties = {
  ...card,
  border: "1px solid #f0d8d8",
  textAlign: "center",
};

const spinner: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "3px solid #d8f0e0",
  borderTopColor: "#2E9E5B",
  animation: "tendSpin 0.8s linear infinite",
};

const btn: CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: 14,
  background: "#2E9E5B",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
};
