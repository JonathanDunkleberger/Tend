export const PRESETS = [
  { name: "Meditate", iconName: "Brain", color: "#7c5cbf", cat: "mind" },
  { name: "Exercise", iconName: "Dumbbell", color: "#e8553a", cat: "body" },
  { name: "Read", iconName: "BookOpen", color: "#3a8fd6", cat: "mind" },
  { name: "Journal", iconName: "BookOpen", color: "#d4a03c", cat: "mind" },
  { name: "Hydrate", iconName: "Droplets", color: "#42b4d6", cat: "body" },
  { name: "Sleep well", iconName: "Moon", color: "#6b5b95", cat: "body" },
  { name: "Walk", iconName: "Footprints", color: "#27ae60", cat: "body" },
  { name: "Cook a meal", iconName: "Utensils", color: "#f39c12", cat: "body" },
  { name: "Create", iconName: "Palette", color: "#1abc9c", cat: "mind" },
  { name: "Deep work", iconName: "Target", color: "#34495e", cat: "focus" },
  { name: "No screens before bed", iconName: "Smartphone", color: "#95a5a6", cat: "reduce" },
  { name: "Alcohol-free day", iconName: "Wine", color: "#8e44ad", cat: "reduce" },
  { name: "Smoke-free day", iconName: "Cigarette", color: "#e74c3c", cat: "reduce" },
  { name: "Caffeine limit", iconName: "Coffee", color: "#795548", cat: "reduce" },
  { name: "No doom scrolling", iconName: "Eye", color: "#607d8b", cat: "reduce" },
  { name: "Screen time limit", iconName: "Clock", color: "#455a64", cat: "reduce" },
] as const;

export const PRESET_CATEGORIES = [
  { cat: "mind", label: "Mind" },
  { cat: "body", label: "Body" },
  { cat: "focus", label: "Focus" },
  { cat: "reduce", label: "Reduce" },
] as const;

export const MILESTONES: { days: number; coins: number; label: string; iconName: string }[] = [
  { days: 1, coins: 1, label: "First step", iconName: "Zap" },
  { days: 3, coins: 5, label: "3 days", iconName: "TrendingUp" },
  { days: 7, coins: 15, label: "One week", iconName: "Star" },
  { days: 14, coins: 30, label: "Two weeks", iconName: "Trophy" },
  { days: 21, coins: 50, label: "Habit formed", iconName: "Brain" },
  { days: 30, coins: 100, label: "One month", iconName: "Sparkles" },
  { days: 60, coins: 200, label: "Two months", iconName: "Heart" },
  { days: 90, coins: 500, label: "Quarter year", iconName: "Flame" },
];

export const STAGE_LABELS = ["Egg", "Hatchling", "Whelp", "Drake", "Elder Dragon"];
export const STAGE_THRESHOLDS = [0, 3, 7, 14, 30];

export const HABIT_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#06b6d4",
];

export const FREE_HABIT_LIMIT = 3;

/* ═══════════ SEASONS ═══════════ */
export type SeasonKey = "spring" | "summer" | "autumn" | "winter";

export interface SeasonTheme {
  skyTop: string;
  skyMid: string;
  ground1: string;
  ground2: string;
  ground3: string;
  dirt: string;
  flowerColors: string[];
  particleType: string;
  label: string;
}

export const SEASONS: Record<SeasonKey, SeasonTheme> = {
  spring: {
    skyTop: "#C8E6FF", skyMid: "#E8D5E8", ground1: "#8BC870", ground2: "#7ABF5E", ground3: "#6CB050", dirt: "#9B7653",
    flowerColors: ["#FFB6C1", "#FF85A2", "#DDA0DD", "#E8A0BF", "#F8C8DC"], particleType: "petals", label: "Spring",
  },
  summer: {
    skyTop: "#5AABE0", skyMid: "#93D68A", ground1: "#6DBF40", ground2: "#5CAF30", ground3: "#4B9F22", dirt: "#8B6D42",
    flowerColors: ["#FF6B9D", "#FFB347", "#F9D56E", "#FF5E5B", "#66D9EF"], particleType: "fireflies", label: "Summer",
  },
  autumn: {
    skyTop: "#D4A574", skyMid: "#C9B896", ground1: "#A0944E", ground2: "#8E8340", ground3: "#7D7232", dirt: "#6B5344",
    flowerColors: ["#E85D2C", "#D4741C", "#F0A030", "#C44B1A", "#E8A040"], particleType: "leaves", label: "Autumn",
  },
  winter: {
    skyTop: "#B8C8D8", skyMid: "#D0D8E0", ground1: "#C0D0C0", ground2: "#B0C4B0", ground3: "#A0B8A0", dirt: "#8A8A7A",
    flowerColors: ["#D0E0F0", "#C8D8E8", "#B0C8D8", "#E0E8F0", "#98B8D0"], particleType: "snow", label: "Winter",
  },
};

export function getSeason(): SeasonKey {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

/* ═══════════ DARK THEME ═══════════ */
export interface ThemeColors {
  bg: string;
  card: string;
  cardBorder: string;
  cardShadow: string;
  text: string;
  textSub: string;
  textMuted: string;
  textFaint: string;
  label: string;
  hoverBg: string;
  inputBg: string;
  inputBorder: string;
  checkBorder: string;
  progressBg: string;
  overlayBg: string;
  modalBg: string;
  dangerBg: string;
  dangerBorder: string;
  streakBg: string;
  streakActiveBg: string;
  coinBg: string;
  freezeBtnBg: string;
  freezeBtnOff: string;
  heatEmpty: string;
  glassHighlight: string;
}

export const THEME: Record<"light" | "dark", ThemeColors> = {
  light: {
    bg: "#FAF8F3", card: "white", cardBorder: "rgba(0,0,0,0.04)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.02),0 4px 16px rgba(0,0,0,0.015)",
    text: "#1a1a2e", textSub: "rgba(0,0,0,.55)", textMuted: "rgba(0,0,0,.42)", textFaint: "rgba(0,0,0,.2)",
    label: "rgba(0,0,0,.55)", hoverBg: "rgba(0,0,0,.01)", inputBg: "#FAFAF8", inputBorder: "rgba(0,0,0,.04)",
    checkBorder: "rgba(0,0,0,.08)", progressBg: "rgba(0,0,0,.04)", overlayBg: "rgba(0,0,0,.15)",
    modalBg: "white", dangerBg: "rgba(239,68,68,.02)", dangerBorder: "rgba(239,68,68,.1)",
    streakBg: "rgba(0,0,0,.02)", streakActiveBg: "rgba(245,158,11,.06)", coinBg: "rgba(245,158,11,.06)",
    freezeBtnBg: "rgba(66,180,214,.08)", freezeBtnOff: "rgba(0,0,0,.02)", heatEmpty: "rgba(0,0,0,0.025)",
    glassHighlight: "rgba(255,255,255,0.12)",
  },
  dark: {
    bg: "#0f0f1a", card: "#1a1a2e", cardBorder: "rgba(255,255,255,0.06)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.3),0 4px 16px rgba(0,0,0,0.2)",
    text: "#e8e6f0", textSub: "rgba(255,255,255,.6)", textMuted: "rgba(255,255,255,.42)", textFaint: "rgba(255,255,255,.2)",
    label: "rgba(255,255,255,.55)", hoverBg: "rgba(255,255,255,.03)", inputBg: "#12122a", inputBorder: "rgba(255,255,255,.08)",
    checkBorder: "rgba(255,255,255,.12)", progressBg: "rgba(255,255,255,.06)", overlayBg: "rgba(0,0,0,.5)",
    modalBg: "#1a1a2e", dangerBg: "rgba(239,68,68,.08)", dangerBorder: "rgba(239,68,68,.2)",
    streakBg: "rgba(255,255,255,.04)", streakActiveBg: "rgba(245,158,11,.12)", coinBg: "rgba(245,158,11,.1)",
    freezeBtnBg: "rgba(66,180,214,.12)", freezeBtnOff: "rgba(255,255,255,.04)", heatEmpty: "rgba(255,255,255,0.04)",
    glassHighlight: "rgba(255,255,255,0.06)",
  },
};

/* ═══════════ FAIL RECOVERY & WELCOME BACK ═══════════ */
export const WELCOME_MSGS = [
  { title: "Welcome back!", body: "Your creatures missed you. They've been napping — let's wake them up together.", vibe: "warm" },
  { title: "Hey, you came back!", body: "That's the hard part done. One check-in and your planet starts glowing again.", vibe: "proud" },
  { title: "Fresh start energy", body: "Streaks break. What matters is you're here now. Your creatures are stretching and ready.", vibe: "fresh" },
  { title: "Look who's back!", body: "Your planet kept spinning while you were away. Time to make it grow again.", vibe: "playful" },
] as const;

export const BOUNCE_BACK = [
  { d: 1, msg: "Day 1 again — you showed up", c: 3 },
  { d: 3, msg: "3 days strong! Bounce-back streak", c: 10 },
  { d: 7, msg: "Full week recovery! Your creatures are thriving", c: 25 },
] as const;

export const SYNERGY_NAMES: Record<string, string> = {
  "Meditate+Exercise": "Mind-Body", "Meditate+Read": "Deep Focus", "Meditate+Journal": "Inner Peace",
  "Exercise+Hydrate": "Body Care", "Exercise+Walk": "Active Life", "Read+Journal": "Reflection",
  "Journal+Meditate": "Mindfulness", "Sleep well+No screens before bed": "Rest Ritual",
  "Deep work+Read": "Scholar", "Cook a meal+Hydrate": "Nourish",
};

export function getSynergyName(a: string, b: string): string | null {
  return SYNERGY_NAMES[`${a}+${b}`] || SYNERGY_NAMES[`${b}+${a}`] || null;
}

/* ═══════════ QUIT PRESETS ═══════════ */
export const QUIT_PRESETS = [
  { name: "Smoke-free", iconName: "Cigarette", color: "#27ae60", cost: 15 },
  { name: "Nicotine-free", iconName: "Wind", color: "#607d8b", cost: 8 },
  { name: "Alcohol-free", iconName: "Wine", color: "#8e44ad", cost: 12 },
  { name: "Content-free", iconName: "Eye", color: "#e74c3c", cost: 0 },
  { name: "Mindful scrolling", iconName: "Smartphone", color: "#95a5a6", cost: 0 },
  { name: "Clean eating", iconName: "Utensils", color: "#f39c12", cost: 6 },
  { name: "No gambling", iconName: "Target", color: "#d35400", cost: 20 },
  { name: "Screen time limit", iconName: "Clock", color: "#455a64", cost: 0 },
  { name: "No energy drinks", iconName: "Coffee", color: "#e67e22", cost: 5 },
] as const;

/* ═══════════ HEALING TIMELINES ═══════════ */
export interface HealStep {
  d: number;
  t: string;
  desc: string;
}

export const HEAL: Record<string, HealStep[]> = {
  cannabis: [
    { d: 1, t: "THC levels dropping", desc: "Your body is starting to clear THC. Mood may fluctuate — that's normal." },
    { d: 3, t: "Sleep disruption peaks", desc: "Vivid dreams and restlessness are common. This passes." },
    { d: 7, t: "Appetite normalizing", desc: "Your natural hunger signals are returning." },
    { d: 14, t: "Mental clarity improving", desc: "Brain fog is lifting. Memory and focus sharpening." },
    { d: 30, t: "Lung function improving", desc: "If you smoked, your lungs are repairing. Coughing may increase temporarily as they clear out." },
    { d: 60, t: "Emotional regulation stabilizing", desc: "Your endocannabinoid system is recalibrating. Emotions feel more balanced." },
    { d: 90, t: "Full neurological recovery underway", desc: "Your brain's dopamine system is normalizing. Motivation and pleasure from everyday things returns." },
  ],
  nicotine: [
    { d: 0.08, t: "Heart rate normalizing", desc: "Within 2 hours, your heart rate and blood pressure drop." },
    { d: 1, t: "Carbon monoxide cleared", desc: "Oxygen levels in your blood return to normal." },
    { d: 3, t: "Nicotine leaves your body", desc: "The physical withdrawal peaks now — but it's the last time." },
    { d: 7, t: "Nerve endings regrowing", desc: "Taste and smell are coming back. Food tastes better." },
    { d: 14, t: "Circulation improving", desc: "Walking and physical activity gets easier." },
    { d: 30, t: "Lung cilia regenerating", desc: "Your lungs are cleaning themselves. Coughing decreases." },
    { d: 90, t: "Lung function up 30%", desc: "Your lung capacity has significantly increased." },
    { d: 365, t: "Heart disease risk halved", desc: "Your risk of coronary heart disease is now half that of a smoker." },
  ],
  alcohol: [
    { d: 1, t: "Blood sugar stabilizing", desc: "Your body is no longer processing alcohol. Hydration improving." },
    { d: 3, t: "Withdrawal window closing", desc: "The hardest physical part is passing. Your body is adjusting." },
    { d: 7, t: "Sleep quality improving", desc: "REM sleep is returning. You'll start feeling more rested." },
    { d: 14, t: "Liver begins healing", desc: "Liver fat can decrease by up to 15%. Skin starts clearing up." },
    { d: 30, t: "Blood pressure normalizing", desc: "Reduced risk of stroke. Liver fat continues decreasing." },
    { d: 60, t: "Immune system strengthening", desc: "Your body fights infections better. Energy levels noticeably higher." },
    { d: 90, t: "Mental health improving", desc: "Anxiety and depression symptoms often significantly reduce." },
  ],
  porn: [
    { d: 3, t: "Dopamine receptors recovering", desc: "Your brain is starting to recalibrate what feels rewarding." },
    { d: 7, t: "Urges peak then decline", desc: "The first week is the hardest. From here, it gets easier." },
    { d: 14, t: "Focus and motivation improving", desc: "Without the dopamine spikes, your brain finds other things more engaging." },
    { d: 30, t: "Rewiring underway", desc: "Neural pathways are weakening. New, healthier patterns forming." },
    { d: 60, t: "Emotional connections deepening", desc: "Intimacy and real human connection feel more natural and rewarding." },
    { d: 90, t: "Significant neurological recovery", desc: "Brain scans show measurable changes in prefrontal cortex activity. Self-control stronger." },
  ],
  default: [
    { d: 1, t: "First day complete", desc: "You showed up. That's the foundation everything else builds on." },
    { d: 7, t: "One week strong", desc: "Your brain is starting to form new patterns." },
    { d: 14, t: "Two weeks — habit weakening", desc: "The old habit's neural pathways are getting weaker." },
    { d: 30, t: "One month milestone", desc: "You're building real momentum. The hardest part is behind you." },
    { d: 60, t: "Two months — new normal forming", desc: "This is becoming who you are, not just something you're doing." },
    { d: 90, t: "Three months — deeply rooted", desc: "Neurological changes are now well-established." },
  ],
};

/* ═══════════ WORLD SHOP ═══════════ */
import type { ShopItem, ShopCategory } from "@/types";

export const SHOP_CATEGORIES: { key: ShopCategory; label: string }[] = [
  { key: "landscape", label: "Landscape" },
  { key: "trees", label: "Trees" },
  { key: "flowers", label: "Flowers" },
  { key: "decorations", label: "Decorations" },
];

export const SHOP_ITEMS: ShopItem[] = [
  // Landscape (all free)
  { id: "pond", name: "Pond", description: "A small reflective pool", price: 30, category: "landscape" },
  { id: "bridge", name: "Bridge", description: "A tiny wooden bridge", price: 40, category: "landscape", premium: true },
  { id: "bench", name: "Bench", description: "A cozy resting spot", price: 20, category: "landscape" },
  { id: "fence", name: "Fence", description: "A picket fence section", price: 15, category: "landscape" },
  { id: "stone-path", name: "Stone Path", description: "Stepping stones", price: 25, category: "landscape" },

  // Trees (Sakura free, rest premium)
  { id: "sakura", name: "Sakura", description: "Pink cherry blossoms", price: 60, category: "trees" },
  { id: "pine", name: "Pine", description: "An evergreen pine tree", price: 45, category: "trees", premium: true },
  { id: "willow", name: "Willow", description: "A graceful weeping willow", price: 55, category: "trees", premium: true },
  { id: "oak", name: "Oak", description: "A sturdy old oak", price: 75, category: "trees", premium: true },

  // Flowers (all free)
  { id: "tulips", name: "Tulips", description: "A patch of colorful tulips", price: 10, category: "flowers" },
  { id: "sunflowers", name: "Sunflowers", description: "Tall golden sunflowers", price: 15, category: "flowers" },
  { id: "roses", name: "Roses", description: "A rose bush in bloom", price: 18, category: "flowers" },
  { id: "lavender", name: "Lavender", description: "Fragrant purple lavender", price: 12, category: "flowers" },

  // Decorations (all premium)
  { id: "lantern", name: "Lantern", description: "A warm glowing lantern", price: 20, category: "decorations", premium: true },
  { id: "mushrooms", name: "Mushrooms", description: "A cluster of spotted caps", price: 8, category: "decorations", premium: true },
  { id: "rock-garden", name: "Rock Garden", description: "Zen stacked stones", price: 25, category: "decorations", premium: true },
  { id: "birdhouse", name: "Birdhouse", description: "A tiny house on a pole", price: 18, category: "decorations", premium: true },
];

export function getHealKey(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cannabis") || n.includes("weed") || n.includes("thc") || n.includes("marijuana") || n.includes("smoke-free")) return "cannabis";
  if (n.includes("juul") || n.includes("nicotine") || n.includes("vape") || n.includes("cigarette") || n.includes("smoking")) return "nicotine";
  if (n.includes("alcohol") || n.includes("drinking") || n.includes("booze") || n.includes("beer") || n.includes("wine")) return "alcohol";
  if (n.includes("porn") || n.includes("fap") || n.includes("nofap") || n.includes("content-free")) return "porn";
  return "default";
}
