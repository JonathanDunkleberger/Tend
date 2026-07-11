"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import type { ThemeColors } from "@/lib/constants";
import { haptic } from "@/lib/utils";

// The BeforeInstallPromptEvent isn't in the TS DOM lib yet.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "tend_install_dismissed";

/**
 * A gentle, on-brand "add Tend to your home screen" affordance.
 * - Android/Chrome: captures `beforeinstallprompt` and fires the native prompt.
 * - iOS Safari (no event): shows the Share → Add to Home Screen instructions.
 * - Renders nothing when already installed (standalone) or previously dismissed.
 */
export function InstallPromptCard({ th, darkMode }: { th: ThemeColors; darkMode: boolean }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  // Detected once on mount via lazy initializers (guarded for SSR) — avoids
  // synchronous setState inside the effect.
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = window.navigator.userAgent;
    return /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua); // Safari-only Share flow
  });
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISMISS_KEY) === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;
  // Nothing to offer: not iOS and no captured prompt yet.
  if (!isIOS && !deferred) return null;

  const dismiss = () => {
    haptic("light");
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const install = async () => {
    haptic("light");
    if (isIOS) { setShowIOSHint((v) => !v); return; }
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  return (
    <div style={{
      borderRadius: 18, marginBottom: 16, overflow: "hidden",
      background: darkMode
        ? "linear-gradient(135deg, rgba(56,189,248,0.09), rgba(139,92,246,0.06))"
        : "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(139,92,246,0.05))",
      border: `1px solid ${th.cardBorder}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px 14px 16px" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(56,189,248,0.14)",
        }}>
          <Download size={20} color="#38bdf8" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>Install Tend</div>
          <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.4, marginTop: 1 }}>
            Add it to your home screen — full-screen, one tap away.
          </div>
        </div>
        <button onClick={install} style={{
          flexShrink: 0, background: "#38bdf8", border: "none", borderRadius: 10,
          padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700,
          color: "#0a0e18", fontFamily: "inherit",
        }}>
          {isIOS ? "How" : "Install"}
        </button>
        <button onClick={dismiss} aria-label="Dismiss" style={{
          flexShrink: 0, background: "none", border: "none", cursor: "pointer",
          padding: 4, color: th.textMuted, display: "flex",
        }}>
          <X size={16} />
        </button>
      </div>

      {isIOS && showIOSHint && (
        <div style={{
          padding: "12px 16px 14px", borderTop: `1px solid ${th.cardBorder}`,
          fontSize: 12.5, color: th.textSub, lineHeight: 1.6,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <span>1.</span> Tap the <Share size={14} color="#38bdf8" style={{ verticalAlign: "middle" }} /> Share button below
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span>2.</span> Choose <Plus size={14} color="#38bdf8" style={{ verticalAlign: "middle" }} /> “Add to Home Screen”
          </div>
        </div>
      )}
    </div>
  );
}
