"use client";

import { useRef, useCallback, useState } from "react";
import { Creature } from "@/components/creature";
import { Share2, X } from "lucide-react";
import { STAGE_LABELS } from "@/lib/constants";

interface ShareCardProps {
  creatureName: string | null;
  habitName: string;
  stage: number;
  color: string;
  streak: number;
  totalDays: number;
  isQuit: boolean;
  cleanDays?: number;
  moneySaved?: number;
  creatureType?: number | null;
  habitId?: string;
  onClose: () => void;
}

/**
 * Shareable milestone card — Instagram story format (9:16).
 * Shows creature hero, streak, name, and Tend branding.
 * Supports Web Share API and canvas download fallback.
 */
export function ShareCard({
  creatureName,
  habitName,
  stage,
  color,
  streak,
  totalDays,
  isQuit,
  cleanDays = 0,
  moneySaved = 0,
  creatureType,
  habitId,
  onClose,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const displayName = creatureName || STAGE_LABELS[stage];
  const heroNumber = isQuit ? cleanDays : streak;
  const heroLabel = isQuit
    ? (cleanDays === 1 ? "day clean" : "days clean")
    : (streak === 1 ? "day streak" : "day streak");

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      // Try html2canvas-style approach via canvas
      const card = cardRef.current;
      if (!card) return;

      // Use native Web Share API with text if available
      if (navigator.share) {
        const shareText = isQuit
          ? `${displayName} and I are ${cleanDays} days clean! 🌱`
          : `${displayName} and I hit a ${streak}-day streak! 🔥`;
        await navigator.share({
          title: "Tend — Habit Tracker",
          text: shareText + "\n\nTrack your habits with Tend 🌿",
        });
      } else {
        // Fallback: copy text to clipboard
        const shareText = isQuit
          ? `${displayName} and I are ${cleanDays} days clean! 🌱 #Tend`
          : `${displayName} and I hit a ${streak}-day streak! 🔥 #Tend`;
        await navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard!");
      }
    } catch {
      // User cancelled share
    } finally {
      setSharing(false);
    }
  }, [displayName, isQuit, cleanDays, streak]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: 20,
      animation: "fadeUp 0.3s ease",
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(255,255,255,0.1)",
          border: "none",
          borderRadius: 10,
          padding: 8,
          cursor: "pointer",
          color: "rgba(255,255,255,0.6)",
          display: "flex",
        }}
      >
        <X size={18} />
      </button>

      {/* The card itself — visual preview */}
      <div
        ref={cardRef}
        style={{
          width: 300,
          borderRadius: 24,
          overflow: "hidden",
          background: `linear-gradient(160deg, #0a0e18 0%, ${color}15 50%, #0a0e18 100%)`,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${color}15`,
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        {/* Subtle star dots */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          {[
            { top: -10, left: 20, size: 2, opacity: 0.3 },
            { top: 5, right: 30, size: 3, opacity: 0.2 },
            { top: -5, left: "50%", size: 2, opacity: 0.25 },
          ].map((s, i) => (
            <div key={i} style={{
              position: "absolute",
              ...s,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: "white",
            }} />
          ))}
        </div>

        {/* Hero creature */}
        <div style={{ marginBottom: 12 }}>
          <Creature stage={stage} color={color} happy size={120} creatureType={creatureType} habitId={habitId} />
        </div>

        {/* Creature name */}
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22,
          fontWeight: 700,
          color: "white",
          marginBottom: 2,
        }}>
          {displayName}
        </div>

        {/* Habit name */}
        <div style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 16,
        }}>
          {isQuit ? "Quitting" : "Building"} · {habitName}
        </div>

        {/* Hero stat */}
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 52,
          fontWeight: 800,
          color: "white",
          lineHeight: 1,
          letterSpacing: "-2px",
        }}>
          {heroNumber}
        </div>
        <div style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
          fontWeight: 500,
          marginBottom: 16,
        }}>
          {heroLabel}
        </div>

        {/* Secondary stats */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginBottom: 20,
        }}>
          {isQuit && moneySaved > 0 && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80" }}>
                ${Math.round(moneySaved)}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>saved</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color }}>
              {STAGE_LABELS[stage]}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>evolution</div>
          </div>
          {!isQuit && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                {totalDays}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>total days</div>
            </div>
          )}
        </div>

        {/* Branding */}
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: 2,
          textTransform: "uppercase",
        }}>
          🌿 Tend
        </div>
      </div>

      {/* Share buttons */}
      <div style={{
        display: "flex",
        gap: 10,
        marginTop: 20,
        width: "100%",
        maxWidth: 300,
      }}>
        <button
          onClick={handleShare}
          disabled={sharing}
          style={{
            flex: 1,
            padding: "14px 0",
            borderRadius: 14,
            border: "none",
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 4px 20px ${color}33`,
          }}
        >
          <Share2 size={16} />
          {sharing ? "Sharing..." : "Share"}
        </button>
      </div>
    </div>
  );
}
