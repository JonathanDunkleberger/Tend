"use client";

import { useState } from "react";
import { X, Crown, Lock, Sparkles } from "lucide-react";
import {
  DRAGON_SPECIES, ELEMENT_COLORS, RARITY_COLORS,
  getDragonSprite, getDragonSpecies,
} from "@/lib/sprites";
import type { DragonElement } from "@/lib/sprites";
import type { ThemeColors } from "@/lib/constants";
import { FREE_SPECIES_COUNT, isFreeSpecies } from "@/lib/pricing";

interface EggPickerProps {
  /** Currently selected species (1-36), or null for none */
  selected: number | null;
  /** Pro tier? Free users see locks + upsell */
  isPro: boolean;
  /** Theme colors */
  th: ThemeColors;
  /** Fires with the chosen species id when user CONFIRMS (Hatch button) */
  onPick: (speciesId: number) => void;
  /** Optional: fires when user taps an egg in the grid (selection only) */
  onSelect?: (speciesId: number) => void;
  /** Close / cancel */
  onClose: () => void;
  /** Free user tapped a locked egg — show paywall */
  onProTap?: () => void;
}

const ELEMENT_TABS: { key: DragonElement | "all"; label: string; icon: string }[] = [
  { key: "all",    label: "All",     icon: "🐉" },
  { key: "fire",   label: "Fire",    icon: "🔥" },
  { key: "water",  label: "Water",   icon: "💧" },
  { key: "nature", label: "Nature",  icon: "🌿" },
  { key: "storm",  label: "Storm",   icon: "⚡" },
  { key: "shadow", label: "Shadow",  icon: "🌑" },
  { key: "light",  label: "Light",   icon: "✨" },
  { key: "cosmic", label: "Cosmic",  icon: "🌌" },
];

export function EggPicker({ selected, isPro, onPick, onSelect, onClose, onProTap }: EggPickerProps) {
  const [filter, setFilter] = useState<DragonElement | "all">("all");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  // Internal selection state so grid taps don't immediately confirm
  const [localSelected, setLocalSelected] = useState<number | null>(selected);

  const filtered = filter === "all"
    ? DRAGON_SPECIES
    : DRAGON_SPECIES.filter((d) => d.element === filter);

  const isUnlocked = (id: number) => isPro || isFreeSpecies(id);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      display: "flex", flexDirection: "column",
      background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      animation: "fadeUp 0.3s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 20px 0", flexShrink: 0,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700,
            color: "white", display: "flex", alignItems: "center", gap: 8,
          }}>
            Choose Your Egg
            {isPro && <Crown size={16} color="#fbbf24" />}
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            {isPro
              ? "Pick any dragon species for your new habit"
              : `${FREE_SPECIES_COUNT} starter dragons free · Unlock all 36 with Tend+`}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "rgba(255,255,255,0.4)" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Element filter tabs */}
      <div style={{
        display: "flex", gap: 4, padding: "14px 20px 8px",
        overflowX: "auto", flexShrink: 0,
        WebkitOverflowScrolling: "touch",
      }}>
        {ELEMENT_TABS.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "5px 12px", borderRadius: 100,
                border: active ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                background: active ? "rgba(255,255,255,0.1)" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.4)",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", whiteSpace: "nowrap",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <span style={{ fontSize: 12 }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Egg grid */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "8px 16px 100px",
        WebkitOverflowScrolling: "touch",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}>
          {filtered.map((dragon) => {
            const unlocked = isUnlocked(dragon.id);
            const isSelected = localSelected === dragon.id;
            const isHovered = hoveredId === dragon.id;
            const eggPath = getDragonSprite(0, dragon.id);
            const dragonPath = getDragonSprite(1, dragon.id);
            const elStyle = ELEMENT_COLORS[dragon.element];
            const rarStyle = RARITY_COLORS[dragon.rarity];

            return (
              <button
                key={dragon.id}
                onClick={() => {
                  if (unlocked) {
                    setLocalSelected(dragon.id);
                    onSelect?.(dragon.id);
                  } else {
                    onProTap?.();
                  }
                }}
                onMouseEnter={() => setHoveredId(dragon.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: "relative",
                  padding: "14px 8px 10px",
                  borderRadius: 16,
                  border: isSelected
                    ? `2px solid ${elStyle.text}`
                    : `1.5px solid ${unlocked ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}`,
                  background: isSelected
                    ? `${elStyle.bg}`
                    : unlocked
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(255,255,255,0.01)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                  opacity: unlocked ? 1 : 0.5,
                  transform: isSelected ? "scale(1.02)" : isHovered && unlocked ? "scale(1.01)" : "none",
                  boxShadow: isSelected ? `0 4px 20px ${elStyle.text}22` : "none",
                }}
              >
                {/* Lock icon for non-pro */}
                {!unlocked && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    background: "rgba(0,0,0,0.6)", borderRadius: 6,
                    padding: "2px 4px", display: "flex", alignItems: "center", gap: 2,
                  }}>
                    <Lock size={8} color="rgba(255,255,255,0.5)" />
                    <Crown size={8} color="#fbbf24" />
                  </div>
                )}

                {/* Rarity badge */}
                {dragon.rarity !== "common" && (
                  <div style={{
                    position: "absolute", top: 6, left: 6,
                    background: rarStyle.bg, border: `1px solid ${rarStyle.border}`,
                    borderRadius: 6, padding: "1px 5px",
                    fontSize: 8, fontWeight: 700, color: rarStyle.text,
                    textTransform: "uppercase", letterSpacing: 0.5,
                  }}>
                    {rarStyle.label}
                  </div>
                )}

                {/* Egg sprite — show dragon preview on hover/selected */}
                <div style={{
                  width: 64, height: 64,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(isSelected || isHovered) && unlocked ? dragonPath : eggPath}
                    alt={dragon.name}
                    width={56}
                    height={56}
                    draggable={false}
                    style={{
                      objectFit: "contain",
                      filter: unlocked ? "none" : "grayscale(0.8) brightness(0.5)",
                      transition: "all 0.3s ease",
                      animation: isSelected ? "creatureFloat 2.5s ease-in-out infinite" : "none",
                    }}
                  />
                </div>

                {/* Species name */}
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: isSelected ? "white" : unlocked ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}>
                  {dragon.name}
                </div>

                {/* Element icon */}
                <div style={{
                  fontSize: 9, color: elStyle.text,
                  display: "flex", alignItems: "center", gap: 3,
                  opacity: 0.7,
                }}>
                  <span>{elStyle.icon}</span>
                  <span style={{ textTransform: "capitalize" }}>{dragon.element}</span>
                </div>

                {/* Selection checkmark */}
                {isSelected && (
                  <div style={{
                    position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                    background: elStyle.text, borderRadius: 100,
                    width: 20, height: 20, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    boxShadow: `0 2px 8px ${elStyle.text}44`,
                  }}>
                    <Sparkles size={10} color="white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "12px 20px 28px",
        background: "linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)",
        display: "flex", gap: 10,
      }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: "14px 0", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
            fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (localSelected) onPick(localSelected);
          }}
          disabled={!localSelected}
          style={{
            flex: 2, padding: "14px 0", borderRadius: 14, border: "none",
            background: localSelected
              ? `linear-gradient(135deg, ${ELEMENT_COLORS[getDragonSpecies(localSelected).element].text}, ${ELEMENT_COLORS[getDragonSpecies(localSelected).element].text}cc)`
              : "rgba(255,255,255,0.06)",
            color: localSelected ? "white" : "rgba(255,255,255,0.2)",
            fontSize: 15, fontWeight: 700, cursor: localSelected ? "pointer" : "default",
            fontFamily: "'Fraunces',serif",
            transition: "all 0.2s",
            boxShadow: localSelected ? `0 4px 20px ${ELEMENT_COLORS[getDragonSpecies(localSelected).element].text}44` : "none",
          }}
        >
          {localSelected
            ? `Hatch ${getDragonSpecies(localSelected).name}`
            : "Select an egg"}
        </button>
      </div>
    </div>
  );
}
