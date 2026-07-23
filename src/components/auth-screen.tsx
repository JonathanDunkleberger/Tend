"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

type Mode = "sign-in" | "sign-up";
type Phase = "loading" | "mounted" | "stuck";

const PORTAL_URL: Record<Mode, string> = {
  "sign-in":
    "https://accounts.hatchtend.com/sign-in?redirect_url=https%3A%2F%2Fwww.hatchtend.com%2Fgarden",
  "sign-up":
    "https://accounts.hatchtend.com/sign-up?redirect_url=https%3A%2F%2Fwww.hatchtend.com%2Fgarden",
};

/**
 * Branded shell around Clerk's SignIn/SignUp.
 * Watches the DOM for the mounted Clerk card. If it never appears (~8s),
 * shows on-page diagnostics + a guaranteed backup path via Clerk's hosted
 * Account Portal, and reports what happened to /api/qa-log.
 */
export function AuthScreen({ mode, children }: { mode: Mode; children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [diag, setDiag] = useState<string[]>([]);
  const errorsRef = useRef<string[]>([]);

  useEffect(() => {
    const push = (s: string) => {
      if (errorsRef.current.length < 12) errorsRef.current.push(s.slice(0, 200));
    };
    const onError = (e: Event) => {
      const ee = e as ErrorEvent;
      const t = e.target as (HTMLScriptElement & HTMLLinkElement) | null;
      if (ee.message) push("js: " + ee.message);
      else if (t && t.src) push("failed to load: " + t.src);
      else if (t && t.href) push("failed to load: " + t.href);
    };
    const onReject = (e: PromiseRejectionEvent) => push("promise: " + String(e.reason));
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onReject);

    const start = Date.now();
    const timer = window.setInterval(() => {
      const mounted = document.querySelector(
        "[class*='cl-rootBox'], [class*='cl-card'], [class*='cl-component']",
      );
      if (mounted) {
        setPhase("mounted");
        window.clearInterval(timer);
        return;
      }
      if (Date.now() - start > 8000) {
        window.clearInterval(timer);
        const w = window as unknown as {
          Clerk?: { status?: string; loaded?: boolean; version?: string };
        };
        const clerkLine = w.Clerk
          ? "clerk-js: status=" + String(w.Clerk.status) + " loaded=" + String(w.Clerk.loaded) + " v=" + String(w.Clerk.version)
          : "clerk-js: NEVER LOADED";
        const lines = [clerkLine, ...errorsRef.current];
        setDiag(lines);
        setPhase("stuck");
        fetch("/api/qa-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: mode,
            ua: navigator.userAgent,
            cookiesEnabled: navigator.cookieEnabled,
            lines,
          }),
        }).catch(() => {});
      }
    }, 400);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onReject);
    };
  }, [mode]);

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

      {phase === "loading" && (
        <p style={{ marginTop: 20, fontSize: 13, opacity: 0.55 }}>Loading secure sign-in…</p>
      )}

      {phase === "stuck" && (
        <div style={panel}>
          <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15 }}>
            The sign-in form could not load in this browser
          </p>
          <p style={{ margin: "0 0 14px", fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>
            No problem — use the backup sign-in below. It opens our secure account page and
            brings you right back to your garden.
          </p>
          <a href={PORTAL_URL[mode]} style={btn}>
            {mode === "sign-in" ? "Use backup sign-in" : "Use backup sign-up"}
          </a>
          <a
            href={mode === "sign-in" ? "/sign-in" : "/sign-up"}
            style={{ ...btn, background: "#fff", color: "#17301F", border: "1px solid #d8e8dc", marginTop: 8 }}
          >
            Retry this page
          </a>
          {diag.length > 0 && (
            <details style={{ marginTop: 14, textAlign: "left" }}>
              <summary style={{ fontSize: 12, opacity: 0.6, cursor: "pointer" }}>
                Technical details
              </summary>
              <pre style={pre}>{diag.join("\n")}</pre>
            </details>
          )}
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

const panel: CSSProperties = {
  marginTop: 24,
  width: "100%",
  maxWidth: 420,
  padding: "20px 22px",
  borderRadius: 20,
  background: "#fff",
  border: "1px solid #f0d8d8",
  textAlign: "center",
};

const btn: CSSProperties = {
  display: "block",
  padding: "13px 16px",
  borderRadius: 14,
  background: "#2E9E5B",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
};

const pre: CSSProperties = {
  marginTop: 8,
  padding: "10px 12px",
  borderRadius: 10,
  background: "#f6f4ec",
  fontSize: 11,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};
