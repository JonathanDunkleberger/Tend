"use client";

/**
 * World-shop items rendered on the planet surface.
 *
 * Most décor renders the hand-drawn DecorGlyph vector icon (same art as the
 * shop card preview — guaranteed to match the item's name). A small set of
 * items with a verified clean single-icon sprite crop (see SHOP_SPRITE_MAP
 * in lib/sprites.ts) render that raster sprite instead. Everything else
 * intentionally falls back to the glyph rather than an unverified/mismatched
 * spritesheet crop.
 */

import { getShopSprite } from "@/lib/sprites";
import { DecorGlyph } from "@/components/decor-glyphs";

interface PlanetItemProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale?: number;
}

// Display sizes for each item type — 60-80% of creature sizes
// Trees/large: 40-56px, Small decorations: 24-32px
const ITEM_SIZES: Record<string, { w: number; h: number }> = {
  // Landscape
  pond: { w: 40, h: 28 },
  bridge: { w: 48, h: 32 },
  bench: { w: 36, h: 36 },
  fence: { w: 20, h: 36 },
  "stone-path": { w: 28, h: 20 },
  // Trees — large decorations
  sakura: { w: 48, h: 56 },
  pine: { w: 40, h: 56 },
  willow: { w: 44, h: 56 },
  oak: { w: 48, h: 56 },
  // Flowers — small decorations
  tulips: { w: 28, h: 28 },
  sunflowers: { w: 28, h: 28 },
  roses: { w: 28, h: 28 },
  lavender: { w: 28, h: 28 },
  // Decorations — small
  lantern: { w: 28, h: 36 },
  mushrooms: { w: 28, h: 28 },
  "rock-garden": { w: 36, h: 24 },
  birdhouse: { w: 28, h: 36 },
  // Extra items
  well: { w: 36, h: 36 },
  boat: { w: 44, h: 28 },
  sign: { w: 28, h: 36 },
  picnic: { w: 36, h: 36 },
  bush: { w: 32, h: 32 },
  stump: { w: 28, h: 24 },
  butterfly: { w: 20, h: 20 },
};

// Per-item multiplier so hand-drawn glyphs (authored in the small shop-preview
// coordinate space) read at a sensible size next to dragons on the planet.
const GLYPH_SCALE: Record<string, number> = {
  pond: 1.4, bridge: 1.3, bench: 1.3, fence: 1.3, "stone-path": 1.3,
  sakura: 1.8, pine: 1.8, willow: 1.8, oak: 1.8,
  tulips: 1.6, sunflowers: 1.6, roses: 1.6, lavender: 1.6,
  lantern: 1.6, mushrooms: 1.8, "rock-garden": 1.6, birdhouse: 1.4,
  well: 1.4,
};

export function PlanetItem({ id, x, y, rotation, scale = 1 }: PlanetItemProps) {
  const sprite = getShopSprite(id);
  const dims = ITEM_SIZES[id] || { w: 24, h: 24 };
  const w = dims.w * scale;
  const h = dims.h * scale;

  if (!sprite) {
    // No verified-clean sprite crop for this item — render the hand-drawn
    // vector glyph (same art as the shop card) instead of a raw spritesheet
    // or a placeholder circle. Always matches the item's name correctly.
    const glyphScale = (GLYPH_SCALE[id] || 1.5) * scale;
    return (
      <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
        <g transform={`rotate(${-rotation}) scale(${glyphScale})`}>
          <DecorGlyph id={id} />
        </g>
      </g>
    );
  }

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <foreignObject
        x={-w / 2} y={-h}
        width={w} height={h}
        transform={`rotate(${-rotation})`}
        style={{ overflow: "visible" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sprite}
          alt={id}
          width={w}
          height={h}
          style={{
            imageRendering: "pixelated",
            objectFit: "contain",
            display: "block",
          }}
          draggable={false}
        />
      </foreignObject>
    </g>
  );
}
