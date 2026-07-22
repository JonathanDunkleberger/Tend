/**
 * Dragon sprite system for Tend.
 *
 * 36 unique dragon species, each with a matching egg.
 * High-res (~200px) 2D art — NOT pixel art.
 *
 * Creatures are now dragons that hatch from eggs.
 *   Stage 0 = Egg (matched to dragon species)
 *   Stage 1+ = Dragon (same dragon at all post-hatch stages, grows via display size)
 *
 * Each habit gets a dragon species (1-36) assigned at creation via creature_type.
 * Existing habits without creature_type get one derived from their id hash.
 */

/** Total number of dragon species in the pack */
export const DRAGON_COUNT = 36;

/* ═══════════ DRAGON SPECIES DATABASE ═══════════ */

export type DragonElement = "fire" | "water" | "nature" | "storm" | "shadow" | "light" | "cosmic";
export type DragonRarity = "common" | "rare" | "legendary";

export interface DragonSpecies {
  id: number;
  name: string;
  element: DragonElement;
  rarity: DragonRarity;
  color: string;
}

/**
 * 36 dragon species — grouped by element, with rarity tiers.
 * 20 common, 10 rare, 6 legendary.
 */
export const DRAGON_SPECIES: DragonSpecies[] = [
  // Fire (1-5)
  { id: 1,  name: "Ember Drake",     element: "fire",   rarity: "common",    color: "#ef4444" },
  { id: 2,  name: "Blaze Whelp",     element: "fire",   rarity: "common",    color: "#f97316" },
  { id: 3,  name: "Cinder Wing",     element: "fire",   rarity: "rare",      color: "#dc2626" },
  { id: 4,  name: "Magma Pup",       element: "fire",   rarity: "rare",      color: "#b91c1c" },
  { id: 5,  name: "Inferno Fang",    element: "fire",   rarity: "legendary", color: "#ff6b35" },
  // Water (6-10)
  { id: 6,  name: "Splash Fin",      element: "water",  rarity: "common",    color: "#3b82f6" },
  { id: 7,  name: "Tide Hatchling",  element: "water",  rarity: "common",    color: "#06b6d4" },
  { id: 8,  name: "Reef Sprite",     element: "water",  rarity: "common",    color: "#0ea5e9" },
  { id: 9,  name: "Coral Drake",     element: "water",  rarity: "rare",      color: "#0891b2" },
  { id: 10, name: "Abyssal Serpent", element: "water",  rarity: "legendary", color: "#1e40af" },
  // Nature (11-16)
  { id: 11, name: "Sprout Drake",    element: "nature", rarity: "common",    color: "#22c55e" },
  { id: 12, name: "Moss Hatchling",  element: "nature", rarity: "common",    color: "#16a34a" },
  { id: 13, name: "Fern Wing",       element: "nature", rarity: "common",    color: "#4ade80" },
  { id: 14, name: "Bloom Serpent",   element: "nature", rarity: "rare",      color: "#15803d" },
  { id: 15, name: "Petal Drake",     element: "nature", rarity: "rare",      color: "#86efac" },
  { id: 16, name: "Ancient Verdant", element: "nature", rarity: "legendary", color: "#065f46" },
  // Storm (17-22)
  { id: 17, name: "Spark Whelp",     element: "storm",  rarity: "common",    color: "#a855f7" },
  { id: 18, name: "Zap Hatchling",   element: "storm",  rarity: "common",    color: "#8b5cf6" },
  { id: 19, name: "Thunder Pup",     element: "storm",  rarity: "common",    color: "#7c3aed" },
  { id: 20, name: "Bolt Wing",       element: "storm",  rarity: "rare",      color: "#6d28d9" },
  { id: 21, name: "Storm Dancer",    element: "storm",  rarity: "rare",      color: "#eab308" },
  { id: 22, name: "Tempest Lord",    element: "storm",  rarity: "legendary", color: "#4c1d95" },
  // Shadow (23-28)
  { id: 23, name: "Shade Whelp",     element: "shadow", rarity: "common",    color: "#6b7280" },
  { id: 24, name: "Dusk Hatchling",  element: "shadow", rarity: "common",    color: "#4b5563" },
  { id: 25, name: "Gloom Drake",     element: "shadow", rarity: "common",    color: "#374151" },
  { id: 26, name: "Night Wing",      element: "shadow", rarity: "rare",      color: "#1f2937" },
  { id: 27, name: "Phantom Fang",    element: "shadow", rarity: "rare",      color: "#111827" },
  { id: 28, name: "Void Wyrm",       element: "shadow", rarity: "legendary", color: "#0a0a0a" },
  // Light (29-33)
  { id: 29, name: "Glow Whelp",      element: "light",  rarity: "common",    color: "#fbbf24" },
  { id: 30, name: "Dawn Hatchling",  element: "light",  rarity: "common",    color: "#f59e0b" },
  { id: 31, name: "Halo Drake",      element: "light",  rarity: "common",    color: "#fde68a" },
  { id: 32, name: "Radiant Wing",    element: "light",  rarity: "rare",      color: "#fcd34d" },
  { id: 33, name: "Solar Wyrm",      element: "light",  rarity: "legendary", color: "#f5f5f4" },
  // Cosmic (34-36)
  { id: 34, name: "Star Whelp",      element: "cosmic", rarity: "common",    color: "#ec4899" },
  { id: 35, name: "Nebula Drake",    element: "cosmic", rarity: "rare",      color: "#d946ef" },
  { id: 36, name: "Celestial Wyrm",  element: "cosmic", rarity: "rare",      color: "#c084fc" },
];

/** Get dragon species by id (1-indexed) */
export function getDragonSpecies(id: number): DragonSpecies {
  return DRAGON_SPECIES[(id - 1) % DRAGON_SPECIES.length] || DRAGON_SPECIES[0];
}

/* ═══════════ ELEMENT STYLING ═══════════ */

export const ELEMENT_COLORS: Record<DragonElement, { bg: string; text: string; icon: string }> = {
  fire:   { bg: "#ef444418", text: "#ef4444", icon: "🔥" },
  water:  { bg: "#3b82f618", text: "#3b82f6", icon: "💧" },
  nature: { bg: "#22c55e18", text: "#22c55e", icon: "🌿" },
  storm:  { bg: "#a855f718", text: "#a855f7", icon: "⚡" },
  shadow: { bg: "#6b728018", text: "#9ca3af", icon: "🌑" },
  light:  { bg: "#fbbf2418", text: "#fbbf24", icon: "✨" },
  cosmic: { bg: "#ec489918", text: "#ec4899", icon: "🌌" },
};

export const RARITY_COLORS: Record<DragonRarity, { bg: string; text: string; border: string; label: string }> = {
  common:    { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.5)",  border: "rgba(255,255,255,0.1)",  label: "Common" },
  rare:      { bg: "rgba(99,102,241,0.1)",   text: "#818cf8",               border: "rgba(99,102,241,0.25)",  label: "Rare" },
  legendary: { bg: "rgba(250,204,21,0.1)",   text: "#fbbf24",               border: "rgba(250,204,21,0.25)",  label: "Legendary" },
};

/* ═══════════ SPECIES ASSIGNMENT ═══════════ */

/** Assign a random dragon species (1-36) for a new habit. */
export function rollDragonSpecies(): number {
  return Math.floor(Math.random() * DRAGON_COUNT) + 1;
}

/** Derive a deterministic dragon species from a habit id (fallback for old habits). */
export function deriveDragonFromId(habitId: string): number {
  let hash = 0;
  for (let i = 0; i < habitId.length; i++) {
    hash = ((hash << 5) - hash + habitId.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % DRAGON_COUNT) + 1;
}

/* ═══════════ SPECIES-BY-HABIT-TYPE (thematic mapping) ═══════════ */

/**
 * Keyword → element rules, checked in order; the FIRST rule with a matching
 * keyword (substring, case-insensitive) wins. Order encodes priority where a
 * habit could plausibly match two elements (e.g. "write" reads as focused
 * mental work → storm before cosmic). Tuned so the common habit vocabulary lands
 * on a dragon whose vibe fits the habit — a running habit hatches a Fire dragon,
 * hydration a Water dragon, meditation a Light dragon — so the collection you
 * grow actually *means* something instead of being random.
 */
const HABIT_ELEMENT_RULES: { element: DragonElement; keywords: string[] }[] = [
  { element: "fire",   keywords: ["run", "jog", "gym", "workout", "work out", "exercise", "fitness", "lift", "weight", "cardio", "hiit", "sprint", "box", "muscle", "strength", "pushup", "push-up", "pull-up", "situp", "sit-up", "crossfit", "train", "spin class", "burpee", "squat"] },
  { element: "water",  keywords: ["water", "hydrate", "hydration", "tea", "shower", "wash", "clean", "skincare", "floss", "brush teeth", "bath", "swim", "dishes", "laundry", "tidy"] },
  { element: "storm",  keywords: ["work", "study", "code", "program", "write", "focus", "deep work", "task", "productiv", "practice", "piano", "guitar", "music", "project", "email", "deadline", "language", "duolingo", "revise", "homework"] },
  { element: "cosmic", keywords: ["read", "book", "learn", "dream", "goal", "art", "draw", "paint", "create", "journal", "reflect", "sketch", "photo"] },
  { element: "light",  keywords: ["meditat", "mindful", "gratitude", "pray", "breathe", "breath", "calm", "relax", "rest", "sleep", "bed", "wake", "morning", "sun", "stretch", "yoga", "affirm", "smile"] },
  { element: "nature", keywords: ["walk", "hike", "outdoor", "nature", "garden", "plant", "tree", "vegetable", "veg", "fruit", "salad", "green", "cook", "meal", "eat", "nutrition", "diet", "grow", "vitamin", "supplement"] },
];

/**
 * Pick the thematically-fitting dragon ELEMENT for a habit from its name +
 * category. A keyword match always wins (works for build and quit alike); with
 * no match, quit habits default to `shadow` — the dark loop you're taming into a
 * dragon of your own — and everything else to `nature`, the "tend your garden"
 * growth metaphor at Tend's core.
 */
export function suggestElementForHabit(name: string, category: string): DragonElement {
  const n = (name || "").toLowerCase();
  for (const rule of HABIT_ELEMENT_RULES) {
    if (rule.keywords.some((k) => n.includes(k))) return rule.element;
  }
  return category === "quit" ? "shadow" : "nature";
}

/**
 * Suggest a concrete dragon species (1-36) for a new habit: pick the fitting
 * element, then a deterministic species WITHIN that element from a hash of the
 * name — stable (same name → same dragon) yet varied across different habits of
 * the same element. Used as the free-tier auto-assignment and the Pro egg-picker
 * default. Falls back to a random roll only if an element somehow has no species.
 */
export function suggestSpeciesForHabit(name: string, category: string): number {
  const element = suggestElementForHabit(name, category);
  const pool = DRAGON_SPECIES.filter((d) => d.element === element);
  if (pool.length === 0) return rollDragonSpecies();
  let hash = 0;
  const s = name || element;
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  return pool[Math.abs(hash) % pool.length].id;
}

/* ═══════════ SPRITE PATHS ═══════════ */

/** Get the sprite path for a dragon. Stage 0 = egg, Stage 1+ = dragon. */
export function getDragonSprite(stage: number, speciesId: number): string {
  const num = String(Math.max(1, Math.min(speciesId, DRAGON_COUNT))).padStart(2, "0");
  if (stage <= 0) return `/sprites/dragons/egg_${num}.png`;
  return `/sprites/dragons/dragon_${num}.png`;
}

/** Legacy compat — kept so existing imports don't break. */
export type CreatureColor = "default" | "red" | "blue" | "green" | "brown";

export function getCreatureColor(_hexColor: string): CreatureColor {
  return "default";
}

export function getCreatureSprite(stage: number, _color: CreatureColor, speciesId?: number): string {
  return getDragonSprite(stage, speciesId || 1);
}

/** Display size (px) for each creature stage ON THE PLANET. HD art = bigger sizes. */
export const CREATURE_SIZES: Record<number, number> = {
  0: 44,
  1: 52,
  2: 58,
  3: 66,
  4: 74,
};

/** Detail page hero size */
export const CREATURE_HERO_SIZE = 160;

/** Stage names — dragon-themed */
export const STAGE_NAMES = ["Egg", "Hatchling", "Whelp", "Drake", "Elder Dragon"] as const;

/* ═══════════ SHOP SPRITES ═══════════
 *
 * NOTE (2026-07-21): most of the Sprout Lands PNGs under public/sprites/{shop,world}
 * are raw, un-cropped spritesheets (multiple icons per file) or were mapped to the
 * wrong file entirely (e.g. "lantern" was pointing at a signpost sheet, "birdhouse"
 * at the well icon, flower items at tiny tree icons). Rather than guess pixel crops,
 * every current SHOP_ITEMS id below was removed from this map so it falls back to
 * the hand-drawn DecorGlyph vector icon (see components/decor-glyphs.tsx) on both
 * the shop card and the planet scene — that art is already correct and on-brand.
 *
 * "well" is kept: public/sprites/shop/well.png is a single, clean, correctly-cropped
 * icon — verified by inspection, safe to use as-is.
 *
 * If real per-item crops (or new commissioned/itch.io art) are added later, just add
 * the mapping back here and both surfaces will pick it up automatically.
 */
const SHOP_SPRITE_MAP: Record<string, string> = {
  "well": "/sprites/shop/well.png",
};

export function getShopSprite(itemId: string): string | null {
  return SHOP_SPRITE_MAP[itemId] || null;
}
