"use client";

import { useState } from "react";
import { ArrowRight, RefreshCw, CloudMoon, Clock, Moon } from "lucide-react";
import { WELCOME_MSGS } from "@/lib/constants";
import type { ThemeColors } from "@/lib/constants";

interface WelcomeBackProps {
  daysAway: number;
  onClose: () => void;
  th: ThemeColors;
}

export function WelcomeBack({ daysAway, onClose, th }: WelcomeBackProps) {
  // Pick one welcome message once per mount (lazy initializer keeps render pure).
  const [msg] = useState(() => WELCOME_MSGS[Math.floor(Math.random() * WELCOME_MSGS.length)]);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fi .2s ease", padding: 20,
    }}>
      <div style={{
        background: th.card, borderRadius: 22, padding: "28px 24px", maxWidth: 340, width: "100%", textAlign: "center",
        animation: "su .35s cubic-bezier(.16,1,.3,1)", border: `1px solid ${th.cardBorder}`,
      }}>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
          {daysAway <= 2 ? <CloudMoon size={32} color={th.textSub} /> : daysAway <= 7 ? <Clock size={32} color={th.textSub} /> : <Moon size={32} color={th.textSub} />}
        </div>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 500, color: th.text, marginBottom: 6 }}>{msg.title}</h2>
        <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.6, marginBottom: 4 }}>{msg.body}</p>
        <p style={{ fontSize: 11, color: th.textMuted, marginBottom: 18 }}>
          {daysAway === 1 ? "You missed 1 day" : `You've been away ${daysAway} days`} — no judgment, only growth.
        </p>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px 20px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg,#4caf50,#2e7d32)", color: "white", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(76,175,80,0.25)",
        }}>
          Let&apos;s grow <ArrowRight size={14} style={{ verticalAlign: "middle", marginLeft: 4 }} />
        </button>
        <div style={{ marginTop: 12, fontSize: 10, color: th.textFaint }}>
          <RefreshCw size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />
          Bounce-back streak starts now — earn bonus coins for showing up!
        </div>
      </div>
    </div>
  );
}
