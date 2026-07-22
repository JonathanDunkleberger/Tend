"use client";

/**
 * Hand-drawn vector icons for world-shop décor items.
 *
 * These are the canonical art for every SHOP_ITEMS entry — small, crisp,
 * on-brand SVG shapes that always match the item's name (a "bench" that
 * looks like a bench, "tulips" that look like tulips, etc). Used by BOTH
 * the shop card preview (shop.tsx) and the actual planet scene
 * (planet-items.tsx), so what you buy is what you see.
 *
 * Coordinate space: origin (0,0) is the item's ground contact point,
 * shapes extend upward (negative y). Roughly fits within x: -10..10,
 * y: -20..2 for tall items, smaller for ground-level ones.
 */
export function DecorGlyph({ id }: { id: string }) {
  switch (id) {
    case "pond":
      return <><ellipse cx="0" cy="0" rx="10" ry="5" fill="#5BA4D9" opacity="0.7" /><ellipse cx="-2" cy="-1.5" rx="3" ry="1.2" fill="white" opacity="0.25" /></>;
    case "bridge":
      return <><rect x="-8" y="-2" width="16" height="3" rx="1" fill="#A0804E" /><rect x="-7" y="-5" width="1.5" height="4" rx="0.5" fill="#7B5D38" /><rect x="5.5" y="-5" width="1.5" height="4" rx="0.5" fill="#7B5D38" /><rect x="-8" y="-5.5" width="16" height="1" rx="0.5" fill="#6B5030" /></>;
    case "bench":
      return <><rect x="-6" y="-1" width="12" height="2" rx="0.8" fill="#A0804E" /><rect x="-6" y="-4" width="12" height="1.5" rx="0.8" fill="#8B6D42" /><rect x="-5" y="-1" width="1" height="3" fill="#6B5030" /><rect x="4" y="-1" width="1" height="3" fill="#6B5030" /></>;
    case "fence":
      return <>{[-6, -2, 2, 6].map((fx, i) => <rect key={i} x={fx - 0.6} y="-7" width="1.2" height="7" rx="0.4" fill="#D4C4A0" />)}<rect x="-7" y="-5.5" width="14" height="1" rx="0.3" fill="#C8B890" /></>;
    case "stone-path":
      return <><ellipse cx="-4" cy="0" rx="2.5" ry="1.8" fill="#A0A090" opacity="0.7" /><ellipse cx="0" cy="-2" rx="3" ry="2" fill="#909080" opacity="0.65" /><ellipse cx="4" cy="0.5" rx="2.2" ry="1.5" fill="#B0B0A0" opacity="0.6" /></>;
    case "sakura":
      return <><rect x="-1" y="-6" width="2" height="6" rx="0.8" fill="#6B5344" /><ellipse cx="0" cy="-10" rx="7" ry="5" fill="#FFB6C1" opacity="0.8" /><ellipse cx="-2" cy="-11" rx="4" ry="3" fill="#FF85A2" opacity="0.6" /></>;
    case "pine":
      return <><rect x="-0.8" y="-4" width="1.6" height="4" rx="0.6" fill="#5D4E37" /><polygon points="0,-14 -5,-8 5,-8" fill="#2E7D32" /><polygon points="0,-11 -4,-6 4,-6" fill="#388E3C" /><polygon points="0,-8 -3,-4 3,-4" fill="#43A047" /></>;
    case "willow":
      return <><rect x="-1" y="-8" width="2" height="8" rx="0.8" fill="#6B5344" /><ellipse cx="0" cy="-10" rx="6" ry="4" fill="#66BB6A" opacity="0.6" /><path d="M-4,-8 Q-6,-3 -7,2" stroke="#4CAF50" strokeWidth="0.7" fill="none" opacity="0.7" /><path d="M4,-8 Q6,-3 7,2" stroke="#4CAF50" strokeWidth="0.7" fill="none" opacity="0.7" /></>;
    case "oak":
      return <><rect x="-1.5" y="-8" width="3" height="8" rx="1.2" fill="#5D4E37" /><ellipse cx="0" cy="-12" rx="9" ry="6" fill="#558B2F" /><ellipse cx="-3" cy="-13" rx="5" ry="4" fill="#689F38" opacity="0.7" /></>;
    case "tulips":
      return <>{[[-3, "#E53935"], [0, "#FDD835"], [3, "#AB47BC"]].map(([fx, c], i) => <g key={i}><line x1={Number(fx)} y1="0" x2={Number(fx)} y2="-5" stroke="#4CAF50" strokeWidth="0.7" /><ellipse cx={Number(fx)} cy={-6} rx="1.5" ry="2" fill={c as string} /></g>)}</>;
    case "sunflowers":
      return <><line x1="0" y1="0" x2="0" y2="-8" stroke="#4CAF50" strokeWidth="1" /><circle cx="0" cy="-10" r="3.5" fill="#FDD835" /><circle cx="0" cy="-10" r="1.8" fill="#795548" /></>;
    case "roses":
      return <>{[[-2, -5], [1.5, -6]].map(([fx, fy], i) => <g key={i}><line x1={fx} y1="0" x2={fx} y2={fy} stroke="#388E3C" strokeWidth="0.6" /><circle cx={fx} cy={fy! - 1} r="1.8" fill="#E53935" /></g>)}</>;
    case "lavender":
      return <>{[-2, 0, 2].map((fx, i) => <g key={i}><line x1={fx} y1="0" x2={fx} y2="-6" stroke="#66BB6A" strokeWidth="0.5" />{[-6, -5, -4].map((fy, j) => <ellipse key={j} cx={fx} cy={fy} rx="0.8" ry="0.5" fill="#9C27B0" opacity={0.6 + j * 0.1} />)}</g>)}</>;
    case "lantern":
      return <><rect x="-0.4" y="-8" width="0.8" height="8" fill="#6B5344" /><rect x="-2" y="-12" width="4" height="4" rx="0.8" fill="#FFF8E1" opacity="0.9" /><rect x="-2" y="-12" width="4" height="4" rx="0.8" fill="#FFD54F" opacity="0.4" /></>;
    case "mushrooms":
      return <><rect x="-0.6" y="-3" width="1.2" height="3" rx="0.4" fill="#F5F5DC" /><ellipse cx="0" cy="-4" rx="3.5" ry="2" fill="#E53935" /><circle cx="-1" cy="-4.5" r="0.6" fill="white" opacity="0.7" /><circle cx="1" cy="-3.8" r="0.5" fill="white" opacity="0.6" /></>;
    case "rock-garden":
      return <><ellipse cx="-2" cy="-1" rx="3" ry="2.5" fill="#9E9E9E" /><ellipse cx="-2" cy="-2" rx="2" ry="1.5" fill="#BDBDBD" opacity="0.5" /><ellipse cx="3" cy="0" rx="2" ry="1.8" fill="#8D8D8D" /></>;
    case "birdhouse":
      return <><rect x="-0.4" y="-10" width="0.8" height="10" fill="#6B5344" /><rect x="-3" y="-14" width="6" height="4.5" rx="0.6" fill="#FFCC80" /><polygon points="0,-16 -4,-14 4,-14" fill="#E57373" /><circle cx="0" cy="-12.5" r="1" fill="#5D4037" /></>;
    // Well — real cropped sprite exists (getShopSprite handles it); glyph kept as a safety fallback.
    case "well":
      return <><rect x="-4" y="-4" width="8" height="4" rx="0.5" fill="#8D8D8D" /><rect x="-5" y="-6.5" width="10" height="1.2" rx="0.4" fill="#6B5030" /><rect x="-4.5" y="-9.5" width="1" height="3.5" fill="#7B5D38" /><rect x="3.5" y="-9.5" width="1" height="3.5" fill="#7B5D38" /><polygon points="-5.5,-9.5 5.5,-9.5 0,-12.5" fill="#A0804E" /></>;
    default:
      return <circle cx="0" cy="-3" r="3" fill="#ccc" opacity="0.5" />;
  }
}
