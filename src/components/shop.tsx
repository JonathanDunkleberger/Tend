"use client";

import { useState } from "react";
import { Store, Check, Coins } from "lucide-react";
import { SHOP_CATEGORIES, SHOP_ITEMS } from "@/lib/constants";
import { getShopSprite } from "@/lib/sprites";
import { DecorGlyph } from "@/components/decor-glyphs";
import type { ThemeColors } from "@/lib/constants";
import type { ShopCategory } from "@/types";

interface ShopProps {
  coins: number;
  ownedItems: string[];
  onBuy: (itemId: string) => void;
  onOwnedTap?: (itemId: string) => void;
  isPro?: boolean;
  onPremiumTap?: () => void;
  th: ThemeColors;
}

export function Shop({ coins, ownedItems, onBuy, onOwnedTap, isPro, onPremiumTap, th }: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("landscape");

  const items = SHOP_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div style={{ animation: "fadeUp .28s ease" }}>
      {/* Header */}
      <div
        className="cd"
        style={{
          padding: 18, marginBottom: 10, textAlign: "center",
          background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "50%", margin: "0 auto 10px",
          background: "linear-gradient(135deg,#4caf50,#66FFAA)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Store size={20} color="white" />
        </div>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text }}>
          World Shop
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
          Customize your planet with items earned from streaks
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10,
          background: th.coinBg, padding: "5px 12px", borderRadius: 20,
          fontSize: 13, fontWeight: 700, color: "#f59e0b",
        }}>
          <Coins size={13} />{coins}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
        {SHOP_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          const count = SHOP_ITEMS.filter((i) => i.category === cat.key).length;
          const owned = SHOP_ITEMS.filter((i) => i.category === cat.key && ownedItems.includes(i.id)).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: "7px 14px", borderRadius: 10, border: "none",
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
                background: active ? "#4caf50" : th.card,
                color: active ? "white" : th.textSub,
                transition: "all 0.12s",
              }}
            >
              {cat.label} {owned > 0 && <span style={{ opacity: 0.7 }}>({owned}/{count})</span>}
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {items.map((item) => {
          const owned = ownedItems.includes(item.id);
          const canAfford = coins >= item.price;
          const locked = !!(item.premium && !isPro && !owned);
          return (
            <div
              key={item.id}
              className="cd"
              style={{
                padding: 16, textAlign: "center", position: "relative",
                background: th.card, borderColor: owned ? "rgba(76,175,80,0.2)" : th.cardBorder,
                boxShadow: th.cardShadow,
                opacity: !owned && !canAfford ? 0.55 : 1,
                transition: "all 0.15s",
              }}
            >
              {/* Tend+ badge for premium items */}
              {locked && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  padding: "2px 7px", borderRadius: 10,
                  background: "rgba(74,222,128,0.12)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  fontSize: 9, fontWeight: 700, color: "#4ade80",
                  letterSpacing: "0.3px",
                }}>
                  Tend+
                </div>
              )}
              {/* Sprite preview — 64px, pixelated */}
              <div style={{
                width: 64, height: 64, margin: "0 auto 8px",
                background: th.progressBg, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {getShopSprite(item.id) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getShopSprite(item.id)!}
                    alt={item.name}
                    width={52}
                    height={52}
                    draggable={false}
                    style={{
                      imageRendering: "pixelated",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <svg width="44" height="44" viewBox="-15 -20 30 25">
                    <DecorGlyph id={item.id} />
                  </svg>
                )}
              </div>

              <div style={{ fontWeight: 600, fontSize: 12.5, color: th.text }}>{item.name}</div>
              <div style={{ fontSize: 10, color: th.textSub, marginTop: 2, lineHeight: 1.3 }}>{item.description}</div>

              {owned ? (
                <div
                  onClick={() => onOwnedTap?.(item.id)}
                  style={{
                  marginTop: 8, padding: "6px 0", borderRadius: 8,
                  background: "rgba(76,175,80,0.08)", color: "#4caf50",
                  fontSize: 11, fontWeight: 600, display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 3,
                  cursor: onOwnedTap ? "pointer" : "default",
                }}>
                  <Check size={11} /> Owned
                </div>
              ) : locked ? (
                <button
                  onClick={() => onPremiumTap?.()}
                  style={{
                    marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8,
                    border: "1px solid rgba(74,222,128,0.15)", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                    background: "rgba(74,222,128,0.06)",
                    color: "#4ade80",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                    transition: "all 0.12s",
                  }}
                >
                  <Coins size={10} />{item.price}
                </button>
              ) : (
                <button
                  onClick={() => canAfford && onBuy(item.id)}
                  disabled={!canAfford}
                  style={{
                    marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8,
                    border: "none", cursor: canAfford ? "pointer" : "default",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                    background: canAfford ? "linear-gradient(135deg,#4caf50,#2e7d32)" : th.progressBg,
                    color: canAfford ? "white" : th.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                    transition: "all 0.12s",
                  }}
                >
                  <Coins size={10} />{item.price}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip */}
      {coins === 0 ? (
        <div style={{
          marginTop: 12, padding: 16, borderRadius: 12,
          background: th.coinBg, textAlign: "center",
          fontSize: 12, color: th.text, lineHeight: 1.6, fontWeight: 500,
        }}>
          Earn coins by completing habits, building streaks, and hitting milestones.
          <br /><span style={{ fontSize: 10, color: th.textSub, fontWeight: 400 }}>Every check-in counts!</span>
        </div>
      ) : (
        <div style={{
          marginTop: 12, padding: 12, borderRadius: 12,
          background: th.coinBg, textAlign: "center",
          fontSize: 10, color: th.textSub, lineHeight: 1.5,
        }}>
          Earn coins by building streaks and hitting milestones.
          Purchased items appear on your planet!
        </div>
      )}
    </div>
  );
}

/** Inline preview renderer — reuses planet-items shapes but simplified for the card */
