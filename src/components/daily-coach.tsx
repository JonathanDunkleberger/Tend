"use client";

import {
  Sunrise, Star, Shield, Compass, MoonStar, TrendingUp, Clock, Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { CoachNote, CoachNoteKind } from "@/lib/coach";
import type { ThemeColors } from "@/lib/constants";

// Each note kind gets its own icon + tint so the card reads at a glance —
// green for wins, amber for care, violet for the quiet default.
const KIND_STYLE: Record<CoachNoteKind, { icon: LucideIcon; color: string }> = {
  "comeback":      { icon: Sunrise,    color: "#f59e0b" },
  "milestone-eve": { icon: Star,       color: "#f59e0b" },
  "urge":          { icon: Shield,     color: "#4ADE80" },
  "hard-day":      { icon: Compass,    color: "#8b9ddb" },
  "all-done":      { icon: MoonStar,   color: "#8b9ddb" },
  "momentum":      { icon: TrendingUp, color: "#2E9E5B" },
  "waiting":       { icon: Clock,      color: "#8b9ddb" },
  "gentle":        { icon: Sparkles,   color: "#2E9E5B" },
};

/**
 * The "Coach's note" card on the Garden — one personal, data-driven line each
 * day (see lib/coach.ts for the rules). Presentation only; the note is
 * computed upstream so this stays a dumb card.
 */
export function DailyCoach({ note, th }: { note: CoachNote; th: ThemeColors }) {
  const { icon: Icon, color } = KIND_STYLE[note.kind];
  return (
    <div className="cd" style={{
      marginTop: 12, padding: "13px 14px",
      display: "flex", alignItems: "flex-start", gap: 12,
      background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 11, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}1a`, border: `1px solid ${color}33`,
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lb" style={{ color: th.label, marginBottom: 3 }}>Coach&rsquo;s note</div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: th.text, lineHeight: 1.5 }}>
          {note.text}
        </p>
      </div>
    </div>
  );
}
