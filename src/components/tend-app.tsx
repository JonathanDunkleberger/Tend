"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Plus, X, Flame, ChevronLeft, ChevronRight, Coins, Sparkles,
  Pencil, Shield, Crown,
  Users, RefreshCw, Wind, DollarSign, Heart,
  Sunrise, SunMedium, MoonStar, Store, Pause, Play,
  Share2,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Creature } from "@/components/creature";
import { TerrariumScene } from "@/components/terrarium-scene";
import { Heatmap } from "@/components/heatmap";
import { Confetti } from "@/components/confetti";
import { UndoToast, CoinToast } from "@/components/toast";
import { Gallery } from "@/components/gallery";
import { WelcomeBack } from "@/components/welcome-back";
import { Constellation } from "@/components/constellation";
import { BreathingTimer } from "@/components/breathing-timer";
import { HealingTimeline } from "@/components/healing-timeline";
import { UrgeTrend } from "@/components/urge-trend";
import { RelapseModal } from "@/components/relapse-modal";
import { ReasonEditor } from "@/components/reason-editor";
import { Shop } from "@/components/shop";
import { UrgeSupport } from "@/components/urge-support";
import { TendPlusScreen, TendPlusMiniPrompt, SevenDayCelebration } from "@/components/tend-plus-screen";
import { Onboarding } from "@/components/onboarding";
import { BottomNav, type NavTab } from "@/components/bottom-nav";
import { WellnessHub } from "@/components/wellness-hub";
import { YouScreen } from "@/components/you-screen";
import { MultiHabitHeatmap } from "@/components/multi-habit-heatmap";
import { TendWrapped } from "@/components/tend-wrapped";
import { MilestoneCelebration, CoinBadge, CoinRow, MILESTONE_COINS } from "@/components/milestone-coin";
import type { CoinTier } from "@/components/milestone-coin";
import { MorningCheckin } from "@/components/morning-checkin";
import { CreatureNamingModal } from "@/components/creature-naming-modal";
import { Ceremony } from "@/components/ceremony";
import { ShareCard } from "@/components/share-card";
import { EggPicker } from "@/components/egg-picker";
import { getStage, getIcon, today, daysAgo, fmtDuration, fmtMoney, fmtQuitDate, haptic, getGreeting, formatLiveTimer, clickable } from "@/lib/utils";
import { computeStreak, computeGraceActive, computeBestStreak } from "@/lib/streak";
import { selectNewMilestones, selectNewCoinTiers } from "@/lib/progress";
import { computeCleanDays, computeMoneySaved, computeTotalSaved, computeQuitBest, computeQuitStage } from "@/lib/quit";
import {
  MILESTONES, STAGE_LABELS, STAGE_THRESHOLDS,
  PRESETS, PRESET_CATEGORIES, HABIT_COLORS, FREE_HABIT_LIMIT,
  getSeason, THEME, BOUNCE_BACK,
  QUIT_PRESETS, SHOP_ITEMS,
} from "@/lib/constants";
import type { HabitWithStats, EarnedMilestones, QuitData } from "@/types";
import { getDragonSprite, suggestSpeciesForHabit } from "@/lib/sprites";
import { migrateLocalStorageToServer } from "@/lib/migrate-local-data";
import { apiCall, apiSync } from "@/lib/api";
import type { LucideIcon } from "lucide-react";
import type { SeasonKey } from "@/lib/constants";

type Page = "main" | "detail" | "add" | "gallery" | "constellation" | "social" | "shop" | "wellness" | "you";

interface TendAppProps {
  initialHabits: HabitWithStats[];
  initialCoins: number;
  initialEarned: EarnedMilestones;
  initialStreakFreezes: Record<string, number>;
  initialQuitData: Record<string, QuitData>;
  initialOwnedItems: string[];
  initialPausedHabits: Record<string, boolean>;
  initialIsPro: boolean;
  initialPreferences: {
    darkMode: boolean;
    season: string;
    earnedMilestoneCoins: Record<string, string[]>;
    onboardingComplete: boolean;
    lastCheckinDate: string | null;
    lastBonusDate: string | null;
    gratitudeEntries?: GratitudeEntry[];
  };
}

export interface GratitudeEntry { date: string; items: string[] }

export function TendApp({
  initialHabits, initialCoins, initialEarned, initialStreakFreezes,
  initialQuitData, initialOwnedItems, initialPausedHabits, initialIsPro, initialPreferences,
}: TendAppProps) {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [habits, setHabits] = useState<HabitWithStats[]>(initialHabits);
  const [coins, setCoins] = useState(initialCoins);
  const [earned, setEarned] = useState<EarnedMilestones>(initialEarned);
  const [streakFreezes, setStreakFreezes] = useState<Record<string, number>>(initialStreakFreezes);
  // Ref mirror of streakFreezes so grace-token grants that fire in parallel — e.g.
  // two build habits both crossing a 7/21/60-day milestone in one "all good" tap,
  // whose checkMilestones() timeouts each close over the same stale render snapshot
  // — merge against the freshest map instead of clobbering each other. Without this
  // the last writer wins in BOTH React state and the server payload (the coins route
  // replaces streak_freezes wholesale), durably eating the other habit's token.
  const streakFreezesRef = useRef(streakFreezes);
  const setGraceTokens = useCallback((habitId: string, count: number) => {
    const merged = { ...streakFreezesRef.current, [habitId]: count };
    streakFreezesRef.current = merged;
    setStreakFreezes(merged);
    return merged;
  }, []);
  const [pausedHabits, setPausedHabits] = useState<Record<string, boolean>>(initialPausedHabits);
  const [earnedMilestoneCoins, setEarnedMilestoneCoins] = useState<Record<string, string[]>>(initialPreferences.earnedMilestoneCoins);
  const [milestoneCelebration, setMilestoneCelebration] = useState<{ tier: CoinTier; habitName: string; coinReward: number } | null>(null);
  const [darkMode, setDarkMode] = useState(initialPreferences.darkMode);
  const [season, setSeason] = useState<SeasonKey>((initialPreferences.season as SeasonKey) || getSeason());
  const [gratitudeLog, setGratitudeLog] = useState<GratitudeEntry[]>(initialPreferences.gratitudeEntries ?? []);
  const th = THEME[darkMode ? "dark" : "light"];
  const [page, setPageRaw] = useState<Page>("main");
  const prevPageRef = useRef<string>("main");
  const [pageAnim, setPageAnim] = useState<string>("");

  // Wrap setPage to track transitions
  const setPage = useCallback((next: Page) => {
    const prev = prevPageRef.current;
    if (next === prev) return;
    // Determine animation direction
    const goingDeeper = next !== "main";
    const goingBack = next === "main" && prev !== "main";
    setPageAnim(
      goingBack ? "pageSlideInLeft .3s ease both" :
      goingDeeper ? "pageSlideInRight .3s ease both" :
      "pageSlideInUp .3s ease both"
    );
    prevPageRef.current = next;
    setPageRaw(next);
  }, []);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [coinToast, setCoinToast] = useState<{ msg: string; icon: LucideIcon } | null>(null);
  const [undoToast, setUndoToast] = useState<{ msg: string; onUndo: () => void } | null>(null);
  // Gentle recovery when a save fails: tell the user, then re-sync from the server.
  // NOTE: all server data is held in useState(initial…) seeded ONCE at mount and
  // never reconciled from props, so router.refresh() (a soft server re-render) would
  // silently drop the fresh props and leave the failed optimistic state on screen.
  // A hard reload is the only thing that actually restores truth here.
  const syncError = useCallback(() => {
    setCoinToast({ msg: "Couldn't save — bringing you back in sync", icon: X });
    if (typeof window !== "undefined") window.location.reload();
  }, []);
  const [confetti, setConfetti] = useState(false);
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [cName, setCName] = useState("");
  const [cColor, setCColor] = useState("#6366f1");
  const [mounted, setMounted] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [daysAwayCnt, setDaysAwayCnt] = useState(0);
  const [bounceBackDay, setBounceBackDay] = useState(0);
  const [quitDataMap, setQuitDataMap] = useState<Record<string, QuitData>>(initialQuitData);
  const [breathingHabit, setBreathingHabit] = useState<HabitWithStats | null>(null);
  const [showBreathe, setShowBreathe] = useState(false);
  const [relapseHabit, setRelapseHabit] = useState<HabitWithStats | null>(null);
  const [urgeSupportHabit, setUrgeSupportHabit] = useState<HabitWithStats | null>(null);
  const [ownedItems, setOwnedItems] = useState<string[]>(initialOwnedItems);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terRef = useRef<HTMLDivElement>(null);

  // ── Egg callout tooltip for first quit habit ──
  const [showEggCallout, setShowEggCallout] = useState(false);

  // ── Egg picker state (Pro feature: choose your dragon) ──
  const [pendingHabit, setPendingHabit] = useState<{ name: string; color: string; iconName: string; cat: string; dailyCost: number } | null>(null);
  const [pickedEgg, setPickedEgg] = useState<number | null>(null);
  const [rePickEggId, setRePickEggId] = useState<string | null>(null); // habit id for re-picking egg on detail page

  // ── Creature naming state ──
  const [namingHabit, setNamingHabit] = useState<{ id: string; name: string; stage: number; color: string; creatureType?: number | null } | null>(null);
  // ── Hatch / evolution ceremony state (the full-screen dragon-art payoff) ──
  const [ceremony, setCeremony] = useState<{
    kind: "hatch" | "evolve"; id: string; name: string; stage: number; color: string;
    creatureType?: number | null; creatureName?: string | null; thenName?: boolean;
  } | null>(null);
  const prevStagesRef = useRef<Record<string, number>>({});
  // Habit ids already offered the naming ceremony this session — so a hatch that's
  // skipped isn't re-offered when the build total dips back below the stage-1
  // threshold (uncheck) and re-crosses it (re-check).
  const namingOfferedRef = useRef<Set<string>>(new Set());

  // ── Share card state ──
  const [shareCardData, setShareCardData] = useState<{
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
  } | null>(null);

  // ── Tend+ tier state (server-verified via profiles.tier) ──
  const [isPro, setIsPro] = useState(initialIsPro);
  const [lastBonusDate, setLastBonusDate] = useState<string | null>(initialPreferences.lastBonusDate);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showWrapped, setShowWrapped] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [sevenDayCelebration, setSevenDayCelebration] = useState<{ habitName: string; moneySaved: number; urgeCount: number } | null>(null);
  const logoTapRef = useRef<{ count: number; timer: ReturnType<typeof setTimeout> | null }>({ count: 0, timer: null });

  // ── Onboarding state ──
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [showMorningCheckin, setShowMorningCheckin] = useState(false);

  // ── All-done celebration state ──
  const [showAurora, setShowAurora] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState(false);
  const [celebrationBannerFading, setCelebrationBannerFading] = useState(false);
  const [shootingStar, setShootingStar] = useState(false);
  // null until the first celebration effect run adopts the current state as its
  // baseline — so an app that opens ALREADY all-done (notably a quit-only user,
  // whose quit habits read "done" every day) doesn't replay the confetti/banner and
  // re-run the +10 grant on every reload as if the user just flipped everything done.
  const prevAllDoneRef = useRef<boolean | null>(null);
  // Set when a pause/resume toggle is pending, so the all-done effect can adopt the
  // new baseline WITHOUT celebrating — pausing the last undone habit shrinks the
  // active set to all-done, which must not fire confetti or grant the daily +10.
  const pauseToggledRef = useRef(false);
  // Pending habit-DELETE timers, keyed by habit id. removeHabit defers the
  // destructive server call by the undo window so "Undo" can actually cancel it.
  const pendingDeletesRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Coin sync helper — uses delta-based API to prevent race conditions ──
  const syncCoins = useCallback((delta: number, extraPayload?: Record<string, unknown>) => {
    apiSync("/api/coins", "POST", { delta, ...extraPayload });
  }, []);

  // ── Live timer for quit detail ──
  const [liveNow, setLiveNow] = useState(Date.now());

  const isTendPlus = useCallback((): boolean => {
    return isPro;
  }, [isPro]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);

    // Dark mode and season are now loaded from server props (user_preferences table)
    // localStorage still used as fallback cache in persistence effects below

    // Welcome back detection
    if (typeof window !== "undefined") {
      const lastVisit = localStorage.getItem("tend_last_visit");
      const now = today();
      if (lastVisit && lastVisit !== now) {
        const diff = Math.round((new Date(now + "T12:00:00").getTime() - new Date(lastVisit + "T12:00:00").getTime()) / 86400000);
        if (diff >= 2) {
          setDaysAwayCnt(diff);
          setShowWelcomeBack(true);
          // Seed the bounce-back banner from the PERSISTED ramp position (bb_day),
          // not a hardcoded day 1 — the actual coin grant runs off bb_day (see the
          // effect near line 1152), so a returning mid-ramp or completed user was
          // being shown a "Day 1 · +3 coins" banner that never matched the real
          // grant. Show the day they're about to reach today (= storedBB + 1, the
          // same newBB the grant effect computes); -1 = ramp already done → no banner.
          let bb = 0;
          try { bb = parseInt(localStorage.getItem("bb_day") || "0", 10); } catch { bb = 0; }
          if (Number.isFinite(bb) && bb >= 0 && bb < 7) setBounceBackDay(bb + 1);
        }
      }
      localStorage.setItem("tend_last_visit", now);

      // Tend+ state is now server-verified via initialIsPro prop
      // Bonus date is now server-persisted in user_preferences

      // Check onboarding — use server-persisted flag (fallback to localStorage for migration)
      const onboardingDone = initialPreferences.onboardingComplete || localStorage.getItem("tend_onboarding_complete") === "1";
      if (!onboardingDone && initialHabits.length === 0) {
        setShowOnboarding(true);
      }

      // Morning check-in — show once per day if user has habits.
      // Must use the LOCAL date (today()) to match what onDismiss persists as
      // last_checkin_date; a UTC slice here re-shows the check-in the same
      // evening for users west of UTC (todayNow rolls to tomorrow before they do).
      const todayNow = today();
      const lastCheckin = initialPreferences.lastCheckinDate || localStorage.getItem("tend_checkin_date");
      if (lastCheckin !== todayNow && initialHabits.length > 0 && onboardingDone) {
        setShowMorningCheckin(true);
      }

      setAppLoading(false);

      // One-time migration: move localStorage data to Supabase (no-op if already done)
      migrateLocalStorageToServer();
    }
  }, []);

  // Live timer — updates every 10s for quit detail pages (shows minutes)
  useEffect(() => {
    const interval = setInterval(() => setLiveNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Write-through persistence: server API + localStorage cache ──
  // Quit data and paused habits use point-of-action syncing (see updateQuitData, togglePause)
  // Preferences use effect-based syncing since multiple sources update them
  // First-render skip flags for the effect-based preference sync below. NOTE: a
  // single shared "hasHydrated" ref set in its own useEffect does NOT work — passive
  // effects run in definition order, so that setter fires BEFORE the guarded effects
  // on the first commit and the guard is already true (dead). Each guarded effect
  // therefore owns a ref it flips AFTER its own first run, so the mount PUT (which
  // would echo the just-hydrated props back to the server) is truly skipped.
  const milestoneCoinsHydrated = useRef(false);
  const prefsHydrated = useRef(false);

  // Keep quit data localStorage cache in sync (server sync happens at point of action)
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tend_quit_data", JSON.stringify(quitDataMap));
  }, [quitDataMap]);

  // Persist owned items → localStorage cache (server sync happens at buyItem call site)
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tend_owned_items", JSON.stringify(ownedItems));
  }, [ownedItems]);

  // Keep paused habits localStorage cache in sync (server sync happens at togglePause)
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tend_paused_habits", JSON.stringify(pausedHabits));
  }, [pausedHabits]);

  // Persist preferences (milestone coins) → server + localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tend_milestone_coins", JSON.stringify(earnedMilestoneCoins));
    if (!milestoneCoinsHydrated.current) { milestoneCoinsHydrated.current = true; return; }
    apiSync("/api/preferences", "PUT", {
      earned_milestone_coins: earnedMilestoneCoins,
    });
  }, [earnedMilestoneCoins]);

  // Persist dark mode & season → server + localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tend_dark", darkMode ? "1" : "0");
    localStorage.setItem("tend_season", season);
    if (!prefsHydrated.current) { prefsHydrated.current = true; return; }
    apiSync("/api/preferences", "PUT", { dark_mode: darkMode, season });
  }, [darkMode, season]);

  // Save a gratitude entry (from the Wellness hub) → local state, server, localStorage cache
  const saveGratitude = useCallback((entry: GratitudeEntry) => {
    setGratitudeLog((prev) => {
      // One entry per day — replace today's if it exists
      const next = [...prev.filter((e) => e.date !== entry.date), entry].slice(-60);
      try { localStorage.setItem("tend_gratitude", JSON.stringify(next)); } catch { /* storage may be unavailable */ }
      apiSync("/api/preferences", "PUT", { gratitude_entries: next });
      return next;
    });
  }, []);

  // Handle ?upgraded=true URL param from Stripe redirect
  // Also poll the server to confirm the webhook has landed
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const justUpgraded = params.get("upgraded") === "true";

    if (justUpgraded) {
      // Activate pro immediately so UI feels instant
      setIsPro(true);
      setShowPaywall(false);
      setCoinToast({ msg: "Welcome to Tend+!", icon: Sparkles });
      // Clean the URL
      window.history.replaceState({}, "", window.location.pathname);

      // Poll server to confirm webhook has landed (profile.tier = "pro")
      // Stripe webhooks can take a few seconds — retry up to 5 times
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch("/api/pro-status");
          const data = await res.json();
          if (data.isPro) {
            clearInterval(poll);
            // Server confirmed — pro is now durable
            return;
          }
        } catch { /* ignore network errors during polling */ }

        if (attempts >= 5) {
          clearInterval(poll);
          // Webhook hasn't landed after 10s — verify directly with Stripe
          // This bypasses the webhook entirely and updates the DB
          try {
            const verifyRes = await fetch("/api/verify-subscription", { method: "POST" });
            const verifyData = await verifyRes.json();
            if (verifyData.isPro) {
              setIsPro(true);
              // DB is now updated — pro is durable
            } else {
              // Stripe says no active subscription — payment may have failed
              setIsPro(false);
              setCoinToast({ msg: "Subscription not found — payment may not have completed", icon: X });
            }
          } catch {
            // Network error — keep optimistic pro, will re-verify on next mount
          }
        }
      }, 2000);

      return () => clearInterval(poll);
    }

    // On every mount: verify pro status with the server.
    // First check DB (fast), then if DB says free, verify with Stripe directly
    // in case webhooks were missed.
    fetch("/api/pro-status")
      .then((r) => r.json())
      .then((data) => {
        if (data.isPro) {
          if (!isPro) setIsPro(true);
        } else {
          // DB says free — but maybe a webhook was missed.
          // Only verify with Stripe if the user was previously showing as pro
          // (avoids unnecessary Stripe API calls for actual free users)
          if (isPro) {
            fetch("/api/verify-subscription", { method: "POST" })
              .then((r) => r.json())
              .then((v) => {
                if (v.isPro) {
                  setIsPro(true);
                } else {
                  setIsPro(false);
                }
              })
              .catch(() => { setIsPro(false); });
          }
        }
      })
      .catch(() => { /* offline — trust server-rendered initialIsPro */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Daily bonus coins for Tend+ users
  useEffect(() => {
    if (!mounted) return;
    const todayVal = today();
    if (isTendPlus() && lastBonusDate !== todayVal) {
      setCoins((c) => c + 5);
      setLastBonusDate(todayVal);
      apiSync("/api/preferences", "PUT", { last_bonus_date: todayVal });
      setCoinToast({ msg: "+5 daily Tend+ coins", icon: Coins });
      syncCoins(5);
    }
    // today() in the deps so a session left open across midnight re-grants the next
    // day's bonus (the lastBonusDate gate still prevents any same-day double grant);
    // the 10s liveNow tick re-renders past midnight so the new date string is seen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isPro, today()]);

  // Dev toggle: tap logo 5x (disabled in production)
  const onLogoTap = useCallback(() => {
    if (process.env.NODE_ENV === "production") return;
    const ref = logoTapRef.current;
    ref.count++;
    if (ref.timer) clearTimeout(ref.timer);
    ref.timer = setTimeout(() => { ref.count = 0; }, 2000);
    if (ref.count >= 5) {
      ref.count = 0;
      const newPro = !isPro;
      setIsPro(newPro);
      setCoinToast({ msg: newPro ? "Tend+ enabled (dev)" : "Tend+ disabled (dev)", icon: Sparkles });
    }
  }, [isPro]);

  const todayStr = today();
  const yesterdayStr = daysAgo(1);

  // Build completions map from habits logs
  const completions: Record<string, boolean> = {};
  habits.forEach((h) => {
    h.logs.forEach((l) => {
      completions[`${h.id}:${l.log_date}`] = true;
    });
  });

  // ── Quit-habit helpers ──────────────────────────────
  const isQuit = useCallback((h: HabitWithStats) => h.category === "quit", []);

  const getQuitData = useCallback(
    (hId: string): QuitData | undefined => quitDataMap[hId],
    [quitDataMap]
  );

  const getCleanDays = useCallback(
    (hId: string): number => computeCleanDays(quitDataMap[hId]?.quitDate, todayStr),
    [quitDataMap, todayStr]
  );

  const updateQuitData = useCallback(
    (hId: string, patch: Partial<QuitData>) => {
      setQuitDataMap((prev) => {
        const updated = { ...prev[hId], ...patch } as QuitData;
        // Point-of-action server sync — only the changed habit
        apiSync(`/api/quit-progress/${hId}`, "PUT", updated);
        return { ...prev, [hId]: updated };
      });
    },
    []
  );

  const logUrge = useCallback(
    (hId: string) => {
      setQuitDataMap((prev) => {
        const cur = prev[hId];
        if (!cur) return prev;
        const urges = [...(cur.urges || []), todayStr];
        const updated = { ...cur, urges };
        // Point-of-action server sync
        apiSync(`/api/quit-progress/${hId}`, "PUT", updated);
        return { ...prev, [hId]: updated };
      });
    },
    [todayStr]
  );

  const resetQuit = useCallback(
    (hId: string) => {
      // Save bestStreak before resetting
      const qd = quitDataMap[hId];
      const currentClean = getCleanDays(hId);
      const newBest = computeQuitBest(currentClean, qd?.bestStreak);
      // The clean run restarts at 0, so clear this habit's per-milestone dedup flags —
      // otherwise the 24h/72h/7d encouragement toasts, the 7-day nudge, and the streak
      // milestones would NEVER fire again for this habit after a single slip, which
      // contradicts the soul (self-healing, never-shaming — "recovery is a spiral, you're
      // still moving upward"). Re-earning them requires genuinely re-accumulating clean
      // days, so this isn't farmable. Keyed per-habit; only touches this hId's entries.
      if (typeof window !== "undefined") {
        const clearHabit = (key: string) => {
          try {
            const store = JSON.parse(localStorage.getItem(key) || "{}") as Record<string, unknown>;
            if (hId in store) {
              delete store[hId];
              localStorage.setItem(key, JSON.stringify(store));
            }
          } catch { /* corrupt store — leave it; the guarded readers above heal it */ }
        };
        clearHabit("tend_quit_celebrations");
        clearHabit("tend_7day_shown");
        // Milestone grants are keyed `${hId}:${days}` in a shared store.
        try {
          const granted = JSON.parse(localStorage.getItem("tend_granted_milestones") || "{}") as Record<string, unknown>;
          let touched = false;
          for (const k of Object.keys(granted)) {
            if (k.startsWith(`${hId}:`)) { delete granted[k]; touched = true; }
          }
          if (touched) localStorage.setItem("tend_granted_milestones", JSON.stringify(granted));
        } catch { /* corrupt store — leave it */ }
      }
      // Also drop this habit's in-session earned badges so the rebuilt run can re-light them.
      setEarned((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) if (k.startsWith(`${hId}:`)) delete next[k];
        return next;
      });
      // Store exact ISO timestamp so "Started today at 6:04 PM" works
      updateQuitData(hId, { quitDate: new Date().toISOString(), bestStreak: newBest });
    },
    [updateQuitData, quitDataMap, getCleanDays]
  );

  const updateReason = useCallback(
    (hId: string, text: string) => {
      updateQuitData(hId, { reason: text });
    },
    [updateQuitData]
  );

  const totalSaved = useMemo(() => {
    return computeTotalSaved(
      habits.filter((h) => h.category === "quit").map((h) => quitDataMap[h.id] || {}),
      todayStr,
    );
  }, [habits, quitDataMap, todayStr]);

  const isComplete = useCallback(
    (hId: string, date: string) => !!completions[`${hId}:${date}`],
    [completions]
  );

  // Streak with freeze support
  const getStreak = useCallback(
    (hId: string) => {
      // Quit habits: streak = clean days
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        return getCleanDays(hId);
      }
      // Delegate to the pure, unit-tested core-loop math (src/lib/streak.ts).
      return computeStreak((n) => isComplete(hId, daysAgo(n)), streakFreezes[hId] || 0);
    },
    [isComplete, streakFreezes, habits, getCleanDays]
  );

  // Grace token — is a freeze currently bridging a gap and actively saving this streak?
  // True when the streak-with-freezes exceeds the raw consecutive (no-freeze) streak.
  const isGraceProtected = useCallback(
    (hId: string) => {
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") return false;
      return computeGraceActive((n) => isComplete(hId, daysAgo(n)), streakFreezes[hId] || 0);
    },
    [habits, streakFreezes, isComplete]
  );

  // Best streak — compute historical maximum consecutive run from logs
  const getBestStreak = useCallback(
    (hId: string) => {
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        const qd = quitDataMap[hId];
        return Math.max(getCleanDays(hId), qd?.bestStreak ?? 0);
      }
      // Historical best from logs (pure, tested) ∪ the current live streak.
      const best = computeBestStreak((h?.logs || []).map((l) => l.log_date));
      return Math.max(best, getStreak(hId));
    },
    [habits, quitDataMap, getCleanDays, getStreak]
  );

  // Per-build-habit count of completions OLDER than the 90-day window the server
  // ships in `logs`. Server sends the true lifetime `totalDays`; the difference is the
  // immutable pre-window remainder (old logs never change in-session). getTotal adds it
  // to the live windowed `logs.length` so lifetime totals + dragon stage are correct AND
  // still track today's optimistic check/uncheck. Computed once from the mount snapshot.
  const preWindowTotals = useMemo(() => {
    const m: Record<string, number> = {};
    for (const h of initialHabits) {
      if (h.category !== "quit") m[h.id] = Math.max(0, (h.totalDays ?? 0) - (h.logs?.length ?? 0));
    }
    return m;
  }, [initialHabits]);

  const getTotal = useCallback(
    (hId: string) => {
      // Quit habits: total = clean days (same as streak)
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        return getCleanDays(hId);
      }
      return (h?.logs.length ?? 0) + (preWindowTotals[hId] ?? 0);
    },
    [habits, getCleanDays, preWindowTotals]
  );

  const isHappy = useCallback(
    (hId: string) => {
      // Quit habits are "done" every day they remain clean
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        const qd = quitDataMap[hId];
        // quitDate is a full ISO timestamp; todayStr is a date-only local key. An
        // ISO string is lexically GREATER than its own date prefix, so the raw
        // `quitDate <= todayStr` was false on the day a quit is started/reset —
        // marking it "not done today" (wrong header count, mood, all-done
        // celebration, and an unhappy creature) on a day the user is in fact clean.
        // Compare date-only so the start/reset day reads as clean.
        return !!(qd?.quitDate && qd.quitDate.slice(0, 10) <= todayStr);
      }
      return isComplete(hId, todayStr);
    },
    [isComplete, todayStr, habits, quitDataMap]
  );

  const getStageForId = useCallback(
    (hId: string) => {
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        const qd = quitDataMap[hId];
        // Best-ever clean run drives evolution; a relapse gently slips one tier below the
        // peak and heals as the current clean run rebuilds (see computeQuitStage).
        return computeQuitStage(qd?.quitDate, qd?.bestStreak, todayStr);
      }
      return getStage(getTotal(hId));
    },
    [getTotal, habits, quitDataMap, todayStr]
  );

  const buildHabits = habits.filter((h) => h.category !== "quit");
  const activeHabits = habits.filter((h) => !pausedHabits[h.id]);
  const totalToday = activeHabits.filter((h) => isHappy(h.id)).length;
  const todayPct = activeHabits.length ? totalToday / activeHabits.length : 0;
  const allDone = todayPct >= 1 && activeHabits.length > 0;

  // Which bottom-nav tab reads as "active" for the current page
  const navActiveTab: NavTab | null =
    page === "main" || page === "detail" ? "garden"
    : page === "constellation" ? "insights"
    : page === "wellness" ? "wellness"
    : page === "you" || page === "gallery" || page === "shop" ? "you"
    : null;

  // A pause/resume can flip `allDone` by shrinking the active-habit set — that must
  // NOT trigger the completion celebration or the once-daily reward. When a pause
  // toggle is pending, adopt the new allDone as the baseline (consuming the flag)
  // BEFORE the celebration effect below runs, so it sees no fresh false→true flip.
  // Defined before the celebration effect so it runs first in the same commit.
  useEffect(() => {
    if (!pauseToggledRef.current) return;
    pauseToggledRef.current = false;
    prevAllDoneRef.current = allDone;
  }, [pausedHabits, allDone]);

  // All-done celebration + aurora
  useEffect(() => {
    setShowAurora(allDone);
    if (prevAllDoneRef.current === null) {
      // First run after mount: adopt the current state as the baseline so an app
      // that opens already all-done isn't mistaken for a fresh false→true flip.
      prevAllDoneRef.current = allDone;
      return;
    }
    if (allDone && !prevAllDoneRef.current) {
      // Trigger one-time celebration sequence
      haptic("success");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
      // Shooting star at 500ms
      setTimeout(() => { setShootingStar(true); setTimeout(() => setShootingStar(false), 900); }, 500);
      // Banner at 800ms
      setTimeout(() => {
        setCelebrationBanner(true);
        // Auto-dismiss after 4s
        setTimeout(() => {
          setCelebrationBannerFading(true);
          setTimeout(() => { setCelebrationBanner(false); setCelebrationBannerFading(false); }, 300);
        }, 4000);
      }, 800);
      // +10 coins at 1200ms — gated to ONCE PER DAY (localStorage, like the
      // bounce-back reward). Without this, unchecking + re-checking the last
      // habit flips allDone false→true again and re-grants +10 endlessly.
      setTimeout(() => {
        const lastAllDone = typeof window !== "undefined" ? localStorage.getItem("tend_alldone_date") : null;
        if (lastAllDone !== todayStr) {
          try { localStorage.setItem("tend_alldone_date", todayStr); } catch { /* noop */ }
          setCoins((p) => p + 10);
          syncCoins(10);
          setCoinToast({ msg: "+10 all habits done!", icon: Sparkles });
        }
      }, 1200);
    }
    prevAllDoneRef.current = allDone;
  }, [allDone]);

  // Milestones that also gift a free grace token (the public "milestone rewards
  // → a grace token so one slip never stings" promise). Capped by MAX_GRACE.
  const GRACE_MILESTONE_DAYS = new Set([7, 21, 60]);
  const NO_GRACE_DAYS = new Set<number>();
  // giftGrace defaults on for build habits. Pass false for QUIT habits: their
  // "streak" is clean-days and never consumes streakFreezes (getStreak ignores
  // them for quit, and the shield UI is build-only), so a gifted token would be
  // invisible + unusable — a promised reward the user can never actually access.
  const checkMilestones = (habitId: string, streak: number, giftGrace = true) => {
    const ne = { ...earned };
    // Durable dedup, localStorage-backed. WHY: build-habit milestones persist to
    // the server `milestones` table (via the log route) and rehydrate into
    // `earned`, but QUIT habits never create logs — so their `earned` is always
    // empty on load and the passive quit-milestone effect re-grants coins + grace
    // tokens on EVERY reload (a farmable exploit). This set records every granted
    // milestone on-device so a grant fires once ever, matching build-habit
    // behaviour. (`earned` still drives in-session UI checkmarks.)
    const granted: Record<string, true> = (() => {
      if (typeof window === "undefined") return {};
      try { return JSON.parse(localStorage.getItem("tend_granted_milestones") || "{}"); }
      catch { return {}; }
    })();
    // Pure kernel decides which milestones are newly reached + their coin/grace
    // rewards (see lib/progress.ts); the loop below just fires the side effects.
    const { reached, coins: nc, graceGifts: graceGift } = selectNewMilestones(
      streak,
      (days) => !!ne[`${habitId}:${days}`] || !!granted[`${habitId}:${days}`],
      MILESTONES,
      giftGrace ? GRACE_MILESTONE_DAYS : NO_GRACE_DAYS,
    );
    const newlyEarned: Record<string, true> = {};
    for (const m of reached) {
      ne[`${habitId}:${m.days}`] = true;
      newlyEarned[`${habitId}:${m.days}`] = true;
      granted[`${habitId}:${m.days}`] = true;
      const Ic = getIcon(m.iconName);
      setCoinToast({ msg: `${m.label} +${m.coins}`, icon: Ic });
    }
    if (nc > 0) {
      // Record the durable grant BEFORE any async state work so a fast reload
      // can't slip a re-grant through.
      if (typeof window !== "undefined") {
        try { localStorage.setItem("tend_granted_milestones", JSON.stringify(granted)); } catch { /* noop */ }
      }
      haptic("medium");
      setCoins((prev) => prev + nc);
      // Gift grace token(s) alongside coins, capped — persist together.
      const held = streakFreezesRef.current[habitId] || 0;
      const newHeld = Math.min(MAX_GRACE, held + graceGift);
      if (graceGift > 0 && newHeld > held) {
        const newFreezes = setGraceTokens(habitId, newHeld);
        syncCoins(nc, { streakFreezes: newFreezes });
        setTimeout(() => setCoinToast({ msg: "Grace token gifted 🛡️", icon: Shield }), 1400);
      } else {
        syncCoins(nc);
      }
      // Functional merge (not setEarned(ne)) so two habits crossing a milestone in
      // the same synchronous batch — e.g. the passive quit loop, or markAllGood's
      // timeouts sharing one stale `earned` snapshot — don't clobber each other's
      // newly-earned badges.
      setEarned((prev) => ({ ...prev, ...newlyEarned }));
    }
  };

  // Check AA-style milestone coins
  const checkMilestoneCoins = useCallback((habitId: string, habitName: string, isQuitHabit: boolean, days: number, hours?: number) => {
    const current = earnedMilestoneCoins[habitId] || [];
    // Pure kernel picks the newly-unlocked tiers + the highest for celebration
    // (see lib/progress.ts). Build habits ignore sub-day tiers; quit habits use
    // hours when available.
    const { newKeys, highest: newlyEarned } = selectNewCoinTiers(MILESTONE_COINS, {
      isQuit: isQuitHabit,
      days,
      hours,
      earnedKeys: current,
    });

    if (newKeys.length > 0) {
      const updated = [...current, ...newKeys];
      setEarnedMilestoneCoins((prev) => ({ ...prev, [habitId]: updated }));
      // Show celebration for the highest newly earned coin
      if (newlyEarned) {
        // Map coin tier to a coin reward (use the existing MILESTONES coin value if matching, otherwise 0)
        const matchingMilestone = MILESTONES.find((m) => m.days === newlyEarned.days);
        setMilestoneCelebration({
          tier: newlyEarned,
          habitName,
          coinReward: matchingMilestone?.coins || 0,
        });
        haptic("success");
      }
    }
  }, [earnedMilestoneCoins]);

  // Check milestone coins for quit habits (passive time growth)
  useEffect(() => {
    if (!mounted) return;
    habits.filter((h) => h.category === "quit").forEach((h) => {
      const qd = getQuitData(h.id);
      if (!qd?.quitDate) return;
      const cleanDays = getCleanDays(h.id);
      const hoursSinceQuit = Math.floor((Date.now() - new Date(qd.quitDate).getTime()) / (1000 * 60 * 60));
      checkMilestoneCoins(h.id, h.name, true, cleanDays, hoursSinceQuit);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, todayStr]);

  // Check milestones for quit habits (their streaks grow passively with time)
  useEffect(() => {
    if (!mounted) return;
    habits.filter((h) => h.category === "quit").forEach((h) => {
      const cleanDays = getCleanDays(h.id);
      if (cleanDays > 0) checkMilestones(h.id, cleanDays, false); // quit: no grace gift
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, todayStr]);

  // First-day celebration toasts for quit habits (24h, 72h, 7d)
  useEffect(() => {
    if (!mounted) return;
    // Guarded parse: a corrupt value would otherwise throw on every mount and
    // permanently suppress the 24h/72h/7d quit celebrations + their coin grants
    // (every other localStorage JSON read in this file is already try/caught).
    let fired: Record<string, number[]> = {};
    try { fired = JSON.parse(localStorage.getItem("tend_quit_celebrations") || "{}"); } catch { fired = {}; }
    let changed = false;
    habits.filter((h) => h.category === "quit").forEach((h) => {
      const cd = getCleanDays(h.id);
      const prev = fired[h.id] || [];
      const celebrations = [
        { day: 1, msg: "24 hours clean. Your body is already healing.", bonus: 5 },
        { day: 3, msg: "72 hours. The hardest part is behind you.", bonus: 10 },
        { day: 7, msg: "One week. You\u2019re rewriting your story.", bonus: 25 },
      ];
      for (const c of celebrations) {
        if (cd >= c.day && !prev.includes(c.day)) {
          prev.push(c.day);
          changed = true;
          setCoinToast({ msg: `${c.msg} +${c.bonus}`, icon: Sparkles });
          setCoins((p) => p + c.bonus);
          syncCoins(c.bonus);
        }
      }
      fired[h.id] = prev;
    });
    if (changed) localStorage.setItem("tend_quit_celebrations", JSON.stringify(fired));

    // 7-day Tend+ nudge — show SevenDayCelebration once per quit habit
    if (!isTendPlus()) {
      let shown7: Record<string, boolean> = {};
      try { shown7 = JSON.parse(localStorage.getItem("tend_7day_shown") || "{}"); } catch { shown7 = {}; }
      for (const h of habits.filter((h) => h.category === "quit")) {
        const cd = getCleanDays(h.id);
        if (cd >= 7 && !shown7[h.id]) {
          shown7[h.id] = true;
          localStorage.setItem("tend_7day_shown", JSON.stringify(shown7));
          const qd = quitDataMap[h.id];
          const cost = qd?.dailyCost ?? 0;
          const urgeCount = (qd?.urges ?? []).length;
          setSevenDayCelebration({ habitName: h.name, moneySaved: computeMoneySaved(cost, cd), urgeCount });
          break; // only show one at a time
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, todayStr]);

  const toggleCompletion = async (hId: string) => {
    const wasComplete = isHappy(hId);

    haptic("light");
    setBouncingId(hId);
    setTimeout(() => setBouncingId(null), 600);

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== hId) return h;
        if (wasComplete) {
          return {
            ...h,
            completedToday: false,
            totalDays: h.totalDays - 1,
            logs: h.logs.filter((l) => l.log_date !== todayStr),
          };
        } else {
          return {
            ...h,
            completedToday: true,
            totalDays: h.totalDays + 1,
            logs: [...h.logs, { id: "temp", habit_id: hId, log_date: todayStr, value: 1, created_at: new Date().toISOString() }],
          };
        }
      })
    );

    const result = await apiCall<{ action: string }>(`/api/habits/${hId}/log`, {
      method: "POST",
      body: { date: todayStr },
      onError: syncError,
    });
    if (result.ok && !wasComplete && result.data?.action === "logged") {
      const streak = getStreak(hId) + 1;
      setTimeout(() => checkMilestones(hId, streak), 100);
      // Check AA-style milestone coins for build habits
      const habit = habits.find((h) => h.id === hId);
      if (habit && habit.category !== "quit") {
        setTimeout(() => checkMilestoneCoins(hId, habit.name, false, streak), 200);
      }
    }
  };

  // ── Assumes-best one-tap: "everything went well today" ──
  // Marks every active build habit that isn't already done as complete in one
  // satisfying tap. Flipping all habits done triggers the all-done celebration
  // effect (confetti + shooting star + banner + coins) automatically.
  const [allGoodPulse, setAllGoodPulse] = useState(false);
  const markAllGood = async () => {
    const targets = activeHabits.filter((h) => h.category !== "quit" && !isHappy(h.id));
    if (targets.length === 0) return;
    haptic("success");
    setAllGoodPulse(true);
    setTimeout(() => setAllGoodPulse(false), 500);
    const ids = new Set(targets.map((h) => h.id));

    // Optimistic: mark all target habits done at once
    setHabits((prev) =>
      prev.map((h) =>
        ids.has(h.id)
          ? {
              ...h,
              completedToday: true,
              totalDays: h.totalDays + 1,
              logs: [...h.logs, { id: "temp", habit_id: h.id, log_date: todayStr, value: 1, created_at: new Date().toISOString() }],
            }
          : h
      )
    );

    // Persist each in parallel + run per-habit milestone checks
    await Promise.all(
      targets.map((h) =>
        apiCall<{ action: string }>(`/api/habits/${h.id}/log`, {
          method: "POST",
          body: { date: todayStr },
          onError: syncError,
        }).then((result) => {
          if (result.ok && result.data?.action === "logged") {
            const streak = getStreak(h.id) + 1;
            setTimeout(() => checkMilestones(h.id, streak), 100);
            setTimeout(() => checkMilestoneCoins(h.id, h.name, false, streak), 200);
          }
        })
      )
    );
  };

  const [addError, setAddError] = useState("");

  const addHabit = async (name: string, color: string, iconName: string, cat: string = "general", dailyCost: number = 0, creatureType?: number) => {
    setAddError("");
    const result = await apiCall<HabitWithStats>("/api/habits", {
      method: "POST",
      body: { name, color, icon_name: iconName, category: cat, creature_type: creatureType },
      onError: (msg) => {
        setAddError(msg);
        // Close egg picker if open so user sees the error
        setPendingHabit(null);
        setPickedEgg(null);
        // If server says free plan limit, verify subscription directly with Stripe
        // This fixes the case where webhook didn't fire but payment went through
        if (msg.toLowerCase().includes("free plan") || msg.toLowerCase().includes("upgrade")) {
          setCoinToast({ msg: "Verifying your subscription...", icon: Sparkles });
          fetch("/api/verify-subscription", { method: "POST" })
            .then((r) => r.json())
            .then((data) => {
              if (data.isPro) {
                setIsPro(true);
                setCoinToast({ msg: "Subscription verified! Please try again.", icon: Sparkles });
                setAddError("");
              } else {
                setIsPro(false);
                setCoinToast({ msg, icon: X });
              }
            })
            .catch(() => {
              setCoinToast({ msg, icon: X });
            });
        } else {
          setCoinToast({ msg, icon: X });
        }
      },
    });
    if (result.ok && result.data) {
      const newHabit = result.data;
      setHabits((prev) => [
        ...prev,
        { ...newHabit, currentStreak: 0, totalDays: 0, completedToday: false, stage: 0, logs: [] },
      ]);
      // Initialise quit data for quit habits
      if (cat === "quit") {
        updateQuitData(newHabit.id, { quitDate: new Date().toISOString(), dailyCost, reason: "", urges: [], bestStreak: 0 });
        // Show egg callout if first quit habit
        const eggSeen = localStorage.getItem("tend_egg_callout_shown");
        if (!eggSeen) {
          setTimeout(() => setShowEggCallout(true), 600);
          localStorage.setItem("tend_egg_callout_shown", "1");
        }
      }
      setPage("main");
      setCName("");
      setPendingHabit(null);
      setPickedEgg(null);
    }
    return result.ok;
  };

  /** Route habit creation through egg picker for pro users */
  const startAddHabit = (name: string, color: string, iconName: string, cat: string = "general", dailyCost: number = 0) => {
    if (isTendPlus()) {
      // Pro: show egg picker first, pre-selecting the dragon that thematically
      // fits the habit (they can still pick any other). A smart, on-brand default.
      setPendingHabit({ name, color, iconName, cat, dailyCost });
      setPickedEgg(suggestSpeciesForHabit(name, cat));
    } else {
      // Free: random egg, create immediately
      addHabit(name, color, iconName, cat, dailyCost);
    }
  };

  /** Called when pro user picks an egg and confirms */
  const confirmEggPick = (speciesId: number) => {
    if (!pendingHabit) return;
    const { name, color, iconName, cat, dailyCost } = pendingHabit;
    addHabit(name, color, iconName, cat, dailyCost, speciesId);
  };

  // ── Creature naming: save name to server ──
  const nameCreature = useCallback((habitId: string, creatureName: string) => {
    setHabits((prev) => prev.map((h) => h.id === habitId ? { ...h, creature_name: creatureName } : h));
    apiSync(`/api/habits/${habitId}`, "PATCH", { creature_name: creatureName });
    setNamingHabit(null);
    haptic("success");
    setCoinToast({ msg: `${creatureName} is ready to grow!`, icon: Sparkles });
    setCoins((p) => p + 5);
    syncCoins(5);
  }, [syncCoins]);

  // ── Creature stage-change detection: play the hatch / evolution ceremony ──
  useEffect(() => {
    if (!mounted) return;
    const currentStages: Record<string, number> = {};
    habits.forEach((h) => {
      currentStages[h.id] = getStageForId(h.id);
    });
    // One ceremony at a time — the first upward transition we see this render.
    // A downward move (a slip de-evolving the dragon) is deliberately silent.
    for (const h of habits) {
      const prev = prevStagesRef.current[h.id];
      const curr = currentStages[h.id];
      if (prev === undefined || curr <= prev) continue;
      if (prev === 0) {
        // HATCH (0 → 1+): spectacle first, then the naming bond if still unnamed.
        const needName = !h.creature_name && !namingOfferedRef.current.has(h.id);
        if (needName) namingOfferedRef.current.add(h.id);
        setCeremony({
          kind: "hatch", id: h.id, name: h.name, stage: curr, color: h.color,
          creatureType: h.creature_type, creatureName: h.creature_name, thenName: needName,
        });
      } else {
        // EVOLUTION (stage up): the dragon grows into its next form.
        setCeremony({
          kind: "evolve", id: h.id, name: h.name, stage: curr, color: h.color,
          creatureType: h.creature_type, creatureName: h.creature_name,
        });
      }
      haptic("success");
      break;
    }
    prevStagesRef.current = currentStages;
  }, [mounted, habits, getStageForId]);

  // Dismissing the ceremony chains into the naming bond for a fresh hatch.
  const dismissCeremony = useCallback(() => {
    setCeremony((c) => {
      if (c?.thenName) {
        setNamingHabit({ id: c.id, name: c.name, stage: c.stage, color: c.color, creatureType: c.creatureType });
      }
      return null;
    });
  }, []);

  // ── Share card launcher ──
  const openShareCard = useCallback((h: HabitWithStats) => {
    const dq = h.category === "quit";
    const qd = quitDataMap[h.id];
    setShareCardData({
      creatureName: h.creature_name,
      habitName: h.name,
      stage: getStageForId(h.id),
      color: h.color,
      streak: getStreak(h.id),
      totalDays: getTotal(h.id),
      isQuit: dq,
      cleanDays: dq ? getCleanDays(h.id) : undefined,
      moneySaved: dq && qd ? (qd.dailyCost || 0) * getCleanDays(h.id) : undefined,
      creatureType: h.creature_type,
      habitId: h.id,
    });
  }, [quitDataMap, getStageForId, getStreak, getTotal, getCleanDays]);

  const removeHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    const habitLogs = habit?.logs || [];
    const savedQuitData = quitDataMap[id];

    setHabits((p) => p.filter((h) => h.id !== id));
    // Clean up quit data for this habit
    if (savedQuitData) {
      setQuitDataMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    if (detailId === id) {
      setDetailId(null);
      setPage("main");
    }

    setUndoToast({
      msg: `Removed "${habit?.name}"`,
      onUndo: () => {
        // Cancel the deferred server DELETE — the row still exists, so restoring
        // client state fully un-does the removal.
        const t = pendingDeletesRef.current[id];
        if (t) { clearTimeout(t); delete pendingDeletesRef.current[id]; }
        if (habit) setHabits((p) => [...p, { ...habit, logs: habitLogs }]);
        if (savedQuitData) setQuitDataMap((prev) => ({ ...prev, [id]: savedQuitData }));
        setUndoToast(null);
      },
    });

    // Defer the DESTRUCTIVE delete until just after the 5s undo window closes.
    // Previously it fired immediately and "Undo" only restored client state, so the
    // server row (+ its cascaded logs / quit_progress) was already gone — the
    // "restored" habit then vanished for good on the next reload or log attempt.
    if (pendingDeletesRef.current[id]) clearTimeout(pendingDeletesRef.current[id]);
    pendingDeletesRef.current[id] = setTimeout(() => {
      delete pendingDeletesRef.current[id];
      apiCall(`/api/habits/${id}`, { method: "DELETE", onError: syncError });
    }, 5200);
  };

  const saveEdit = async () => {
    const trimmed = editName.trim().slice(0, 30);
    if (!trimmed || !detailId) return;
    setHabits((p) =>
      p.map((h) => (h.id === detailId ? { ...h, name: trimmed, color: editColor } : h))
    );
    setEditMode(false);
    await apiCall(`/api/habits/${detailId}`, {
      method: "PATCH",
      body: { name: trimmed, color: editColor },
      onError: syncError,
    });
  };

  const saveRename = async (hId: string) => {
    const trimmed = renameValue.trim().slice(0, 30);
    if (!trimmed) { setRenamingId(null); return; }
    setHabits((p) => p.map((h) => (h.id === hId ? { ...h, name: trimmed } : h)));
    setRenamingId(null);
    const h = habits.find((x) => x.id === hId);
    await apiCall(`/api/habits/${hId}`, {
      method: "PATCH",
      body: { name: trimmed, color: h?.color || "#6366f1" },
      onError: syncError,
    });
  };

  const GRACE_COST = 50;
  const MAX_GRACE = 3;
  const buyFreeze = async (hId: string) => {
    const held = streakFreezesRef.current[hId] || 0;
    if (coins < GRACE_COST || held >= MAX_GRACE) return;
    const newFreezes = setGraceTokens(hId, held + 1);
    haptic("success");
    setCoinToast({ msg: "Grace token earned 🛡️", icon: Shield });
    setCoins((prev) => Math.max(0, prev - GRACE_COST));
    syncCoins(-GRACE_COST, { streakFreezes: newFreezes });
  };

  const togglePause = (hId: string) => {
    const wasPaused = !!pausedHabits[hId];
    pauseToggledRef.current = true;
    setPausedHabits((prev) => ({ ...prev, [hId]: !wasPaused }));
    // Point-of-action server sync — only the toggled habit
    apiSync(`/api/habits/${hId}`, "PATCH", { is_paused: !wasPaused });
    haptic("light");
    if (!wasPaused) {
      setCoinToast({ msg: "Habit paused. Streak preserved.", icon: Pause });
    } else {
      setCoinToast({ msg: "Habit resumed. Welcome back!", icon: Play });
    }
  };

  const buyItem = async (itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || ownedItems.includes(itemId)) return;
    if (coins < item.price) return;

    // Optimistic UI update
    setOwnedItems((prev) => [...prev, itemId]);
    setCoins((prev) => Math.max(0, prev - item.price));
    haptic("light");
    setCoinToast({ msg: `${item.name} placed on your planet!`, icon: Store });

    // Server validates coins & deducts atomically
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) {
        // Revert optimistic update on failure
        setOwnedItems((prev) => prev.filter((id) => id !== itemId));
        setCoins((prev) => prev + item.price);
      } else {
        const data = await res.json();
        // Sync server coin balance to prevent drift
        if (typeof data.coins === "number") setCoins(data.coins);
      }
    } catch {
      // Revert on network error
      setOwnedItems((prev) => prev.filter((id) => id !== itemId));
      setCoins((prev) => prev + item.price);
    }
  };

  // Bounce-back recovery ramp: advance at most once per calendar day when any
  // habit is completed. WHY the counter is sourced from localStorage and not the
  // `bounceBackDay` React state: that state is session-scoped, so it reset to 0 on
  // every reload — the day-1 (+3) reward re-granted EVERY day forever (an unbounded
  // coin faucet), while the day-3 (+10) / day-7 (+25) tiers, which need a single
  // session kept alive across midnights, were effectively unreachable. Persisting
  // the counter (and the -1 "completed, never again" sentinel) like the other
  // durable reward gates (shift 14) makes the ramp advance once/day and pay out
  // exactly once, ever. `bounceBackDay` state now only drives the banner display.
  useEffect(() => {
    if (!mounted || !habits.length || typeof window === "undefined") return;
    let storedBB: number;
    try { storedBB = parseInt(localStorage.getItem("bb_day") || "0", 10); } catch { storedBB = 0; }
    if (!Number.isFinite(storedBB) || storedBB < 0) return; // ramp already completed
    const anyDoneToday = habits.some((h) => isHappy(h.id));
    if (!anyDoneToday) return;
    let lastBBDate = "";
    try { lastBBDate = localStorage.getItem("bb_date") || ""; } catch { /* noop */ }
    if (lastBBDate === todayStr) return; // already advanced today
    const newBB = storedBB + 1;
    const nextBB = newBB >= 7 ? -1 : newBB; // -1 = ramp complete, never again
    try {
      localStorage.setItem("bb_date", todayStr);
      localStorage.setItem("bb_day", String(nextBB));
    } catch { /* noop */ }
    setBounceBackDay(nextBB);
    const recovery = BOUNCE_BACK.find((b) => b.d === newBB);
    if (recovery) {
      setCoins((p) => p + recovery.c);
      setCoinToast({ msg: recovery.msg, icon: RefreshCw });
      syncCoins(recovery.c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, mounted, todayStr]);

  useEffect(() => {
    if (page === "add" && inputRef.current) setTimeout(() => inputRef.current?.focus(), 120);
  }, [page]);

  useEffect(() => {
    if (editMode && editRef.current) setTimeout(() => editRef.current?.focus(), 120);
  }, [editMode]);

  useEffect(() => {
    if (renamingId && renameRef.current) setTimeout(() => { renameRef.current?.focus(); renameRef.current?.select(); }, 50);
  }, [renamingId]);

  const detailHabit = habits.find((h) => h.id === detailId);
  const fs = mounted
    ? { opacity: 1, transform: "translateY(0)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }
    : { opacity: 0, transform: "translateY(5px)" };

  // ── Onboarding completion handler ──
  const onboardingSubmittingRef = useRef(false);
  const handleOnboardingComplete = async (
    quitPick: { name: string; color: string; iconName: string; cost: number } | null,
    buildPick: { name: string; color: string; iconName: string } | null,
  ): Promise<boolean> => {
    // Re-entrancy guard: the "Enter your garden" tap awaits two /api/habits
    // POSTs, during which the overlay stays mounted; a double-tap would otherwise
    // create duplicate starter habits (the habits route has no dedup).
    if (onboardingSubmittingRef.current) return false;
    onboardingSubmittingRef.current = true;
    try {
      // Starting coins are already 250 by the profile default (ensureProfile), so
      // show it optimistically but DON'T POST an absolute {coins:250} overwrite —
      // that legacy path would reset a real balance to 250 on any re-entry.
      setCoins(250);

      // Create the starter habits. addHabit does NOT throw on a failed POST (it
      // surfaces an error toast and returns false), so gate the completion flag on
      // actual success — otherwise a transient failure would leave an empty garden
      // AND permanently suppress onboarding (the localStorage flag never re-shows it).
      let ok = true;
      if (quitPick) {
        ok = (await addHabit(quitPick.name, quitPick.color, quitPick.iconName, "quit", quitPick.cost)) !== false && ok;
      }
      if (buildPick) {
        ok = (await addHabit(buildPick.name, buildPick.color, buildPick.iconName)) !== false && ok;
      }

      if (!ok) return false; // a create failed → let the user retry; toast already shown

      // Mark onboarding complete — persist to server + localStorage fallback
      apiSync("/api/preferences", "PUT", { onboarding_complete: true });
      localStorage.setItem("tend_onboarding_complete", "1");
      setShowOnboarding(false);
      return true;
    } finally {
      onboardingSubmittingRef.current = false;
    }
  };

  const overallHeatData = useCallback(
    (date: string) => {
      // Only build habits have per-day completion logs; quit habits never log a
      // completion, so counting them in the denominator would permanently cap
      // intensity below 100% (dead weight). Heatmap = build-habit activity.
      const buildForHeat = habits.filter((h) => h.category !== "quit");
      if (!buildForHeat.length) return 0;
      return buildForHeat.filter((h) => isComplete(h.id, date)).length / buildForHeat.length;
    },
    [habits, isComplete]
  );

  const detailHeatData = useCallback(
    (date: string) => {
      if (!detailId) return 0;
      return isComplete(detailId, date) ? 1 : 0;
    },
    [detailId, isComplete]
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: th.bg,
      fontFamily: "'DM Sans',-apple-system,sans-serif",
      color: th.text,
      transition: "background .4s, color .4s",
    }}>
      {/* Onboarding flow */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Loading skeleton */}
      {appLoading && (
        <div style={{
          position: "fixed", inset: 0, background: "#0a0e18", zIndex: 9998,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{ maxWidth: 520, width: "100%", padding: "0 14px" }}>
            {/* Header skeleton */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 2px 10px" }}>
              <div style={{ width: 70, height: 24, borderRadius: 8, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              </div>
            </div>
            {/* Planet skeleton */}
            <div style={{ width: "100%", aspectRatio: "1/1", maxHeight: 380, borderRadius: 22, background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: 16 }} />
            {/* Habit rows skeleton */}
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", opacity: 1 - i * 0.25 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", animationDelay: `${i * 0.15}s` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: 100 + i * 20, height: 12, borderRadius: 6, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", animationDelay: `${i * 0.15}s`, marginBottom: 6 }} />
                  <div style={{ width: 60, height: 8, borderRadius: 4, background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", animationDelay: `${i * 0.15}s` }} />
                </div>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", animationDelay: `${i * 0.15}s` }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Morning check-in */}
      {showMorningCheckin && (
        <MorningCheckin
          habits={habits}
          quitDataMap={quitDataMap}
          getCleanDays={getCleanDays}
          getStreak={getStreak}
          isComplete={isComplete}
          todayStr={todayStr}
          yesterdayStr={yesterdayStr}
          onDismiss={() => {
            setShowMorningCheckin(false);
            const checkinDay = todayStr;
            apiSync("/api/preferences", "PUT", { last_checkin_date: checkinDay });
            localStorage.setItem("tend_checkin_date", checkinDay);
            setCoins((p) => p + 2);
            syncCoins(2);
            setCoinToast({ msg: "Checked in! +2", icon: Sunrise });
          }}
          th={th}
        />
      )}

      <Confetti active={confetti} />
      {coinToast && <CoinToast {...coinToast} onDone={() => setCoinToast(null)} />}
      {undoToast && <UndoToast {...undoToast} onDone={() => setUndoToast(null)} />}

      {/* Breathing timer overlay */}
      {(breathingHabit || showBreathe) && (
        <BreathingTimer
          habit={breathingHabit}
          onComplete={() => { setBreathingHabit(null); setShowBreathe(false); setCoinToast({ msg: breathingHabit ? "Urge surfed!" : "Centered. +2 coins.", icon: Wind }); const amt = breathingHabit ? 0 : 2; if (amt > 0) { setCoins((p) => p + amt); syncCoins(amt); } }}
          onClose={() => { setBreathingHabit(null); setShowBreathe(false); }}
          th={th}
        />
      )}

      {/* Hatch / evolution ceremony — the dragon-art payoff, shown before naming */}
      {ceremony && (
        <Ceremony
          kind={ceremony.kind}
          stage={ceremony.stage}
          color={ceremony.color}
          creatureType={ceremony.creatureType}
          habitId={ceremony.id}
          habitName={ceremony.name}
          creatureName={ceremony.creatureName}
          onDone={dismissCeremony}
        />
      )}

      {/* Creature naming ceremony */}
      {namingHabit && (
        <CreatureNamingModal
          habitId={namingHabit.id}
          habitName={namingHabit.name}
          stage={namingHabit.stage}
          color={namingHabit.color}
          creatureType={namingHabit.creatureType}
          onName={(name) => nameCreature(namingHabit.id, name)}
          onSkip={() => setNamingHabit(null)}
        />
      )}

      {/* Share milestone card */}
      {shareCardData && (
        <ShareCard {...shareCardData} onClose={() => setShareCardData(null)} />
      )}

      {/* Egg picker (Pro feature) — new habit creation */}
      {pendingHabit && (
        <EggPicker
          selected={pickedEgg}
          isPro={isTendPlus()}
          th={th}
          onSelect={(speciesId) => {
            setPickedEgg(speciesId);
          }}
          onPick={(speciesId) => {
            setPickedEgg(speciesId);
            confirmEggPick(speciesId);
          }}
          onClose={() => { setPendingHabit(null); setPickedEgg(null); }}
          onProTap={() => { setPendingHabit(null); setPickedEgg(null); setShowPaywall(true); }}
        />
      )}

      {/* Egg picker (Pro feature) — re-pick on detail page */}
      {rePickEggId && (
        <EggPicker
          selected={pickedEgg}
          isPro={isTendPlus()}
          th={th}
          onSelect={(speciesId) => {
            setPickedEgg(speciesId);
          }}
          onPick={(speciesId) => {
            // Update creature_type on the existing habit
            setHabits((prev) => prev.map((h) => h.id === rePickEggId ? { ...h, creature_type: speciesId } : h));
            apiSync(`/api/habits/${rePickEggId}`, "PATCH", { creature_type: speciesId });
            setRePickEggId(null);
            setPickedEgg(null);
            haptic("success");
            setCoinToast({ msg: "Egg swapped! 🥚", icon: Sparkles });
          }}
          onClose={() => { setRePickEggId(null); setPickedEgg(null); }}
          onProTap={() => { setRePickEggId(null); setPickedEgg(null); setShowPaywall(true); }}
        />
      )}

      {/* Urge support full screen */}
      {urgeSupportHabit && (
        <UrgeSupport
          habit={urgeSupportHabit}
          urgesToday={
            Object.values(quitDataMap).reduce((sum, qd) => sum + (qd.urges || []).filter((d) => d === todayStr).length, 0)
          }
          onComplete={(data) => {
            haptic("success");
            logUrge(urgeSupportHabit.id);
            setCoins((p) => p + 3);
            syncCoins(3);
            // Persist urge entry with method, tags, and note
            apiSync("/api/urge-entries", "POST", {
              habit_id: urgeSupportHabit.id,
              method: data.method,
              tags: data.tags,
              note: data.note,
            });
            setUrgeSupportHabit(null);
          }}
          onClose={() => setUrgeSupportHabit(null)}
          th={th}
        />
      )}

      {/* Relapse modal */}
      {relapseHabit && (
        <RelapseModal
          habit={relapseHabit}
          cleanDays={getCleanDays(relapseHabit.id)}
          bestStreak={quitDataMap[relapseHabit.id]?.bestStreak}
          onConfirm={() => {
            // The dragon gently slips one tier below its peak (handled by computeQuitStage:
            // resetQuit zeroes the current clean run) and heals as the run rebuilds.
            const hId = relapseHabit.id;
            resetQuit(hId);
            setRelapseHabit(null);
            // +5 coins for honesty
            setCoins((p) => p + 5);
            syncCoins(5);
            setCoinToast({ msg: "Brave honesty. +5 coins. You've got this.", icon: Heart });
          }}
          onClose={() => setRelapseHabit(null)}
          th={th}
        />
      )}

      {/* Tend+ paywall screen */}
      {showWrapped && (
        <TendWrapped
          habits={habits}
          isDone={isComplete}
          getBestStreak={getBestStreak}
          getTotal={getTotal}
          getCleanDays={getCleanDays}
          getStage={getStageForId}
          coins={coins}
          totalSaved={totalSaved}
          onClose={() => setShowWrapped(false)}
        />
      )}

      {showPaywall && (
        <TendPlusScreen
          onClose={() => setShowPaywall(false)}
          onSubscribe={async (plan) => {
            const activateLocally = () => {
              setIsPro(true);
              setShowPaywall(false);
              setCoinToast({ msg: "Welcome to Tend+!", icon: Sparkles });
            };
            const result = await apiCall<{ url?: string; devMode?: boolean }>("/api/checkout", {
              method: "POST",
              body: { plan },
              onError: (msg) => {
                setCoinToast({ msg: `Checkout error: ${msg}`, icon: X });
              },
            });
            if (result.ok && result.data?.url) {
              // Real Stripe: redirect to checkout
              window.location.href = result.data.url;
            } else if (result.ok && result.data?.devMode) {
              // Dev mode: no Stripe configured, activate locally
              activateLocally();
            }
            // On error: don't activate — user needs to retry
          }}
          onRestore={async () => {
            // Re-check the user's subscription with Stripe directly (in case a
            // webhook was missed) and reflect the result — the same idempotent
            // verify the app runs on mount, but forced regardless of current tier.
            setCoinToast({ msg: "Checking your subscription…", icon: Sparkles });
            try {
              const res = await fetch("/api/verify-subscription", { method: "POST" });
              const v = await res.json();
              if (v.isPro) {
                setIsPro(true);
                setShowPaywall(false);
                setCoinToast({ msg: "Welcome back to Tend+!", icon: Sparkles });
              } else {
                setCoinToast({ msg: "No active subscription found", icon: X });
              }
            } catch {
              setCoinToast({ msg: "Couldn't reach the server — try again", icon: X });
            }
          }}
        />
      )}

      {/* Premium shop item mini-prompt */}
      {showPremiumPrompt && (
        <TendPlusMiniPrompt
          onSeeTendPlus={() => { setShowPremiumPrompt(false); setShowPaywall(true); }}
          onDismiss={() => setShowPremiumPrompt(false)}
        />
      )}

      {/* 7-day celebration */}
      {sevenDayCelebration && (
        <SevenDayCelebration
          habitName={sevenDayCelebration.habitName}
          moneySaved={sevenDayCelebration.moneySaved}
          urgeCount={sevenDayCelebration.urgeCount}
          onTryTendPlus={() => { setSevenDayCelebration(null); setShowPaywall(true); }}
          onKeepGoingFree={() => setSevenDayCelebration(null)}
        />
      )}

      {/* AA-style milestone coin celebration */}
      {milestoneCelebration && (
        <MilestoneCelebration
          tier={milestoneCelebration.tier}
          habitName={milestoneCelebration.habitName}
          coinReward={milestoneCelebration.coinReward}
          onDismiss={() => setMilestoneCelebration(null)}
        />
      )}

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 14px 90px" }} key={page} >
        <div style={{ animation: pageAnim || undefined }}>
        {/* HEADER */}
        <div style={{ ...fs, padding: "14px 2px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, background: th.bg, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
          {page !== "main" ? (
            <button
              onClick={() => { setPage("main"); setDetailId(null); setEditMode(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 3, background: "none",
                border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                color: th.textSub, fontFamily: "inherit",
              }}
            >
              <ChevronLeft size={16} />Back
            </button>
          ) : (
            <h1
              onClick={onLogoTap}
              style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: th.text, cursor: "default", userSelect: "none" }}
            >
              tend<span style={{ color: "#4caf50" }}>.</span>
              {isTendPlus() && <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", marginLeft: 3, verticalAlign: "super" }}>+</span>}
            </h1>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {page === "main" && habits.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: allDone ? "#4caf50" : th.textMuted,
                background: allDone ? "rgba(76,175,80,.08)" : th.progressBg,
                padding: "3px 10px", borderRadius: 100,
                display: "flex", alignItems: "center", gap: 3, transition: "all .3s",
              }}>
                <Flame size={11} />{totalToday}/{activeHabits.length}
              </span>
            )}
            <div
              onClick={() => { setPage("shop"); }}
              {...clickable(() => setPage("shop"), { label: `${coins} coins — open shop` })}
              style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "3px 10px", borderRadius: 100,
              background: th.coinBg, color: "#d97706",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}>
              <Coins size={11} />{coins}
            </div>
            {totalSaved > 0 && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                padding: "3px 10px", borderRadius: 100,
                background: "rgba(76,175,80,0.08)", color: "#4caf50",
                fontSize: 11, fontWeight: 700,
              }}>
                <DollarSign size={11} />{fmtMoney(totalSaved)} saved
              </div>
            )}
          </div>
        </div>


        {/* ═══ MAIN ═══ */}
        {page === "main" && (
          <div style={{ ...fs, paddingBottom: 90 }}>
            <div ref={terRef} style={{ position: "relative" }}>
              <TerrariumScene
                habits={habits} getStage={getStageForId} isHappy={isHappy}
                getStreak={getStreak}
                pct={todayPct} bouncingId={bouncingId} season={season} darkMode={darkMode}
                ownedItems={ownedItems}
                onCreatureTap={(hId) => { setDetailId(hId); setPage("detail"); }}
              />
              {/* Aurora effect — visible when all habits done */}
              {showAurora && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 80,
                  pointerEvents: "none", zIndex: 4,
                  opacity: showAurora ? 1 : 0, transition: "opacity 0.3s ease",
                }}>
                  <div style={{
                    position: "absolute", top: 10, left: "10%", right: "10%", height: 20,
                    borderRadius: "50%", background: "rgba(74, 222, 128, 0.15)",
                    filter: "blur(8px)", animation: "auroraWave 3s ease-in-out infinite",
                  }} />
                  <div style={{
                    position: "absolute", top: 20, left: "15%", right: "15%", height: 16,
                    borderRadius: "50%", background: "rgba(147, 130, 255, 0.12)",
                    filter: "blur(6px)", animation: "auroraWave 3s ease-in-out infinite 0.3s",
                  }} />
                  <div style={{
                    position: "absolute", top: 30, left: "20%", right: "20%", height: 12,
                    borderRadius: "50%", background: "rgba(255, 200, 100, 0.10)",
                    filter: "blur(5px)", animation: "auroraWave 3s ease-in-out infinite 0.6s",
                  }} />
                </div>
              )}
              {/* Shooting star */}
              {shootingStar && (
                <div style={{
                  position: "absolute", top: 20, left: 0, right: 0, height: 40,
                  pointerEvents: "none", zIndex: 4, overflow: "hidden",
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "white", boxShadow: "0 0 8px white, -12px 3px 12px rgba(255,255,255,0.3)",
                    animation: "shootingStar 0.8s linear forwards",
                  }} />
                </div>
              )}
              {/* Celebration banner */}
              {celebrationBanner && (
                <div style={{
                  position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                  zIndex: 10, animation: celebrationBannerFading ? "bannerFadeOut 0.3s ease forwards" : "bannerSlideDown 0.4s ease",
                  background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)",
                  borderRadius: 10, padding: "8px 16px", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                    <path d="M12 3l1.5 5.5L19 10l-4.5 2.5L16 18l-4-3-4 3 1.5-5.5L5 10l5.5-1.5z" />
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>All habits complete today</span>
                </div>
              )}
              {/* Mood indicator — minimal pill with SVG icon */}
              {habits.length > 0 && (() => {
                const status = allDone ? { label: "Thriving", color: "#66FFAA", glow: true } :
                  todayPct >= 0.5 ? { label: "Growing", color: "rgba(255,255,255,0.5)", glow: false } :
                  todayPct > 0 ? { label: "Waking up", color: "rgba(255,255,255,0.35)", glow: false } :
                  { label: "Resting", color: "rgba(255,255,255,0.2)", glow: false };
                return (
                <div style={{
                  position: "absolute", bottom: 8, left: 8,
                  background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", borderRadius: 8,
                  padding: "3px 10px", fontSize: 9, fontWeight: 600, color: status.color,
                  display: "flex", alignItems: "center", gap: 4, zIndex: 5, letterSpacing: 0.3,
                  boxShadow: status.glow ? "0 0 8px rgba(102,255,170,0.15)" : "none",
                }}>
                  {allDone ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#66FFAA" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  ) : todayPct >= 0.5 ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  ) : todayPct > 0 ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M12 22c-4-4-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-4 8-8 12z"/><line x1="12" y1="10" x2="12" y2="14"/></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.2)"/></svg>
                  )}
                  {status.label}
                </div>
                );
              })()}
            </div>

            {/* Egg callout tooltip for first quit habit */}
            {showEggCallout && page === "main" && (
              <div style={{
                position: "relative", display: "flex", justifyContent: "center",
                marginTop: -6, marginBottom: 8, zIndex: 20,
                animation: "tooltipPop 0.4s cubic-bezier(.16,1,.3,1)",
              }}>
                {/* Arrow pointing up to planet */}
                <div style={{
                  position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                  borderBottom: `6px solid ${th.card}`,
                }} />
                <div style={{
                  background: th.card, borderRadius: 14, padding: "10px 16px",
                  border: `1px solid ${th.cardBorder}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  display: "flex", alignItems: "center", gap: 10,
                  maxWidth: 300, cursor: "pointer",
                  animation: "tooltipPulse 3s ease-in-out infinite",
                }}
                  onClick={() => setShowEggCallout(false)}
                  {...clickable(() => setShowEggCallout(false), { label: "Dismiss tip" })}
                >
                  <span style={{ fontSize: 22 }}>🥚</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: th.text, marginBottom: 1 }}>
                      Your egg has appeared!
                    </div>
                    <div style={{ fontSize: 11, color: th.textSub, lineHeight: 1.4 }}>
                      Each clean day helps it grow. Tap your creature to see its progress.
                    </div>
                  </div>
                  <X size={14} style={{ color: th.textMuted, flexShrink: 0 }} />
                </div>
              </div>
            )}

            {/* Progress bar */}
            {habits.length > 0 && (
              <div style={{ padding: "10px 2px 4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, padding: "0 2px" }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: th.textMuted, letterSpacing: 0.3 }}>
                    {allDone ? "All done!" : "Today's progress"}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: allDone ? "#4caf50" : th.textMuted }}>
                    {totalToday}/{activeHabits.length}
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: th.progressBg, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: allDone
                      ? "linear-gradient(90deg,#66bb6a,#43a047)"
                      : "linear-gradient(90deg,#81c784,#4caf50)",
                    width: `${todayPct * 100}%`,
                    transition: "width 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    ...(allDone ? {
                      boxShadow: "0 0 12px rgba(74, 222, 128, 0.4)",
                      animation: "progressGlow 1.5s ease-in-out",
                    } : {}),
                  }} />
                </div>
              </div>
            )}

            {/* ── Assumes-best one-tap check-in ── */}
            {(() => {
              const buildRemaining = activeHabits.filter((h) => h.category !== "quit" && !isHappy(h.id));
              if (buildRemaining.length === 0) return null;
              return (
                <button
                  onClick={markAllGood}
                  style={{
                    width: "100%", marginTop: 10, padding: "13px 16px", borderRadius: 16,
                    border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 12,
                    background: "linear-gradient(135deg, rgba(76,175,80,0.14), rgba(102,255,170,0.08))",
                    boxShadow: allGoodPulse ? "0 0 0 3px rgba(76,175,80,0.25)" : `inset 0 0 0 1px ${darkMode ? "rgba(102,255,170,0.14)" : "rgba(76,175,80,0.16)"}`,
                    transform: allGoodPulse ? "scale(0.98)" : "scale(1)",
                    transition: "transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease",
                  }}
                >
                  <span style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg,#4caf50,#2e7d32)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(76,175,80,0.3)",
                  }}>
                    <Check size={20} color="#fff" strokeWidth={3} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: th.text }}>
                      Everything went well today
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: th.textSub, marginTop: 1 }}>
                      {buildRemaining.length === activeHabits.filter((h) => h.category !== "quit").length
                        ? "One tap — we assume the best in you"
                        : `Tend the last ${buildRemaining.length} in one tap`}
                    </span>
                  </span>
                  <Sparkles size={16} color="#4caf50" />
                </button>
              );
            })()}

            {/* Bounce-back recovery banner */}
            {bounceBackDay > 0 && bounceBackDay <= 7 && !allDone && (
              <div style={{
                margin: "8px 2px 0", padding: "10px 14px", borderRadius: 12,
                background: "linear-gradient(135deg,rgba(76,175,80,0.08),rgba(102,255,170,0.05))",
                border: "1px solid rgba(76,175,80,0.15)", display: "flex", alignItems: "center", gap: 10,
              }}>
                <RefreshCw size={16} color="#4caf50" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>
                    {bounceBackDay === 1 ? "You showed up. That's everything." : bounceBackDay <= 3 ? "Building momentum — keep it rolling!" : "You're back in the groove. Your creatures are so happy!"}
                  </div>
                  <div style={{ fontSize: 10, color: th.textSub }}>
                    {bounceBackDay >= 6 ? "Almost there!" : bounceBackDay >= 4 ? `${7 - bounceBackDay} more days` : `Day ${bounceBackDay} of 7`}{(() => { const c = BOUNCE_BACK.find((b) => b.d === bounceBackDay)?.c; return c ? ` • +${c} coins today` : ""; })()}
                  </div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#4caf50",
                  background: "rgba(76,175,80,0.1)", borderRadius: 8, padding: "3px 8px",
                }}>
                  Day {bounceBackDay}/7
                </div>
              </div>
            )}

            {/* Gentle time-of-day nudge */}
            {buildHabits.length > 0 && buildHabits.filter((h) => isHappy(h.id)).length === 0 && (() => {
              const hr = new Date().getHours();
              const nudge = hr >= 5 && hr < 12
                ? { Icon: Sunrise, msg: "Good morning! A small step forward today?" }
                : hr >= 12 && hr < 17
                  ? { Icon: SunMedium, msg: "Afternoon check-in — any habits to tend?" }
                  : hr >= 17 && hr < 21
                    ? { Icon: MoonStar, msg: "Evening wind-down — still time to grow today" }
                    : { Icon: MoonStar, msg: "Late night. Be gentle with yourself." };
              return (
                <div style={{
                  margin: "8px 2px 0", padding: "10px 14px", borderRadius: 12,
                  background: th.card, border: `1px solid ${th.cardBorder}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <nudge.Icon size={18} color={th.textSub} />
                  <span style={{ fontSize: 12, color: th.textSub, fontWeight: 500 }}>{nudge.msg}</span>
                </div>
              );
            })()}

            {/* Today's habits */}
            <div className="cd" style={{
              padding: "8px 4px", marginTop: 8,
              background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
            }}>
              <div style={{ padding: "4px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="lb" style={{ color: th.label }}>Today</span>
                <span style={{ fontSize: 10, color: th.textMuted, fontWeight: 500 }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
              </div>
              {/* Compassionate welcome message */}
              {habits.length > 0 && (
                  <div style={{ padding: "0 14px 8px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontStyle: "italic", color: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}>{getGreeting()}</span>
                  </div>
              )}
              {habits.length === 0 ? (
                <div style={{ padding: "34px 24px 30px", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getDragonSprite(0, 3)}
                    alt="A dragon egg waiting to be tended"
                    width={64}
                    height={64}
                    style={{
                      imageRendering: "pixelated",
                      animation: "float 6s ease-in-out infinite",
                      filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.25))",
                      marginBottom: 4,
                    }}
                  />
                  <p style={{ fontSize: 15, fontWeight: 600, color: th.text, margin: "8px 0 4px" }}>
                    Your garden is ready
                  </p>
                  <p style={{ fontSize: 12.5, color: th.textSub, lineHeight: 1.5, maxWidth: 240, margin: "0 auto 14px" }}>
                    Add your first habit to plant an egg. Tend it each day and watch your dragon hatch and grow.
                  </p>
                  <button
                    onClick={() => { haptic("light"); setPage("add"); }}
                    style={{
                      padding: "9px 20px", borderRadius: 100, border: "none",
                      background: "linear-gradient(135deg,#4caf50,#2e7d32)", color: "#fff",
                      fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      display: "inline-flex", alignItems: "center", gap: 6,
                      boxShadow: "0 4px 16px rgba(76,175,80,0.32)",
                    }}
                  >
                    <Plus size={15} strokeWidth={2.5} /> Plant your first egg
                  </button>
                </div>
              ) : (
                habits.map((h, idx) => {
                  const quit = isQuit(h);
                  const isPaused = !!pausedHabits[h.id];
                  const done = !quit && !isPaused && isHappy(h.id);
                  const streak = quit ? 0 : getStreak(h.id);
                  const graceTokens = !quit ? (streakFreezes[h.id] || 0) : 0;
                  const graceOn = graceTokens > 0 && isGraceProtected(h.id);
                  const cleanDays = quit ? getCleanDays(h.id) : 0;
                  const qd = quit ? getQuitData(h.id) : undefined;
                  const moneySaved = quit && qd ? (qd.dailyCost || 0) * cleanDays : 0;
                  const stage = getStageForId(h.id);
                  const total = getTotal(h.id);
                  const isLast = idx === habits.length - 1;

                  // Hours and minutes clean for quit habits in first 24h
                  const msSinceQuit = quit && qd?.quitDate
                    ? Date.now() - new Date(qd.quitDate).getTime()
                    : 0;
                  const hoursSinceQuit = Math.floor(msSinceQuit / (1000 * 60 * 60));
                  const minutesSinceQuit = Math.floor(msSinceQuit / (1000 * 60));

                  // Build subtitle
                  let subtitle = "";
                  if (isPaused) {
                    subtitle = "Paused";
                  } else if (quit && qd?.quitDate) {
                    const timeStr = cleanDays === 0
                      ? (hoursSinceQuit > 0 ? `${hoursSinceQuit}h clean` : `${Math.max(minutesSinceQuit, 0)}m clean`)
                      : cleanDays === 1 ? "1d clean" : `${fmtDuration(cleanDays)} clean`;
                    subtitle = timeStr;
                    if (moneySaved > 0) subtitle += ` · ${fmtMoney(moneySaved)} saved`;
                    subtitle += ` · ${STAGE_LABELS[stage]}`;
                  } else if (!quit && done) {
                    subtitle = `${streak}d streak · ${STAGE_LABELS[stage]}`;
                  } else if (!quit) {
                    // Unchecked build habit — show stage and evolution timer
                    const nextThreshold = stage < 4 ? STAGE_THRESHOLDS[stage + 1] : null;
                    const remaining = nextThreshold ? nextThreshold - total : 0;
                    const verb = stage === 0 ? "hatches" : "evolves";
                    subtitle = remaining > 0 ? `${STAGE_LABELS[stage]} · ${verb} in ${remaining}d` : STAGE_LABELS[stage];
                  }

                  return (
                    <div key={h.id} className="rw" style={{
                      background: th.card, animation: "fadeUp 0.3s ease",
                      borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
                      borderRadius: isLast ? undefined : 0,
                      opacity: isPaused ? 0.5 : 1,
                    }}>
                        {isPaused ? (
                          /* Paused: pause icon */
                          <div
                            style={{
                              width: 26, height: 26, borderRadius: 8,
                              background: "rgba(255,255,255,0.05)",
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}
                            onClick={() => { setDetailId(h.id); setPage("detail"); }}
                          >
                            <Pause size={14} color={th.textMuted} strokeWidth={2} />
                          </div>
                        ) : quit ? (
                          /* Quit habit: green shield indicator */
                          <div
                            style={{
                              width: 26, height: 26, borderRadius: 8,
                              background: `${h.color}18`,
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}
                            onClick={() => { setDetailId(h.id); setPage("detail"); }}
                          >
                            <svg viewBox="0 0 20 20" fill="#4ade80" width="20" height="20">
                              <path d="M10 1L3 4.5V9.5C3 14.2 6 17.5 10 19C14 17.5 17 14.2 17 9.5V4.5L10 1Z"/>
                            </svg>
                          </div>
                        ) : (
                          <div
                            className={`ck ${done ? "d" : ""} ${bouncingId === h.id && done ? "burst" : ""}`}
                            role="checkbox"
                            aria-checked={done}
                            aria-label={done ? `Mark ${h.name} as not done today` : `Mark ${h.name} done today`}
                            tabIndex={0}
                            style={{
                              background: done ? h.color : "transparent",
                              borderColor: done ? "transparent" : th.checkBorder,
                              ["--ck-color" as string]: h.color,
                            }}
                            onClick={(e) => { e.stopPropagation(); toggleCompletion(h.id); }}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); toggleCompletion(h.id); } }}
                          >
                            <Check size={14} color="white" strokeWidth={3} />
                          </div>
                        )}
                        <div
                          style={{ flex: 1, cursor: "pointer", minWidth: 0 }}
                          {...clickable(() => { if (renamingId !== h.id) { setDetailId(h.id); setPage("detail"); } }, { label: `Open ${h.name}` })}
                          onClick={() => { if (renamingId !== h.id) { setDetailId(h.id); setPage("detail"); } }}
                          onTouchStart={() => { longPressTimer.current = setTimeout(() => { setRenamingId(h.id); setRenameValue(h.name); }, 500); }}
                          onTouchEnd={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                          onTouchMove={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                          onMouseDown={() => { longPressTimer.current = setTimeout(() => { setRenamingId(h.id); setRenameValue(h.name); }, 500); }}
                          onMouseUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                          onMouseLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                        >
                          {renamingId === h.id ? (
                            <input
                              ref={renameRef}
                              value={renameValue}
                              maxLength={30}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") saveRename(h.id); if (e.key === "Escape") setRenamingId(null); }}
                              onBlur={() => saveRename(h.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: 15, fontWeight: 500, color: th.text,
                                background: th.inputBg, border: `1px solid ${th.inputBorder}`,
                                borderRadius: 6, padding: "2px 6px", width: "100%",
                                outline: "none", fontFamily: "inherit",
                              }}
                            />
                          ) : (
                          <>
                          <div style={{
                            fontSize: 15, fontWeight: h.creature_name ? 600 : 500,
                            textDecoration: !h.creature_name && done ? "line-through" : "none",
                            color: isPaused ? th.textMuted : (done && !h.creature_name ? th.textMuted : th.text),
                            transition: "all 0.2s",
                            lineHeight: 1.2,
                          }}>
                            {h.creature_name || h.name}
                          </div>
                          {h.creature_name && (
                            <div style={{
                              fontSize: 11, fontWeight: 500, marginTop: 1,
                              color: isPaused ? th.textMuted : th.textSub,
                              transition: "all 0.2s",
                            }}>
                              {h.name}
                            </div>
                          )}
                          </>
                          )}
                          {subtitle && (
                            <div style={{
                              fontSize: 11, fontWeight: 500, marginTop: 1,
                              color: isPaused ? "#60a5fa" : (quit ? (darkMode ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)") : th.textSub),
                            }}>
                              {subtitle}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                          {/* Milestone coin badge */}
                          {!isPaused && (earnedMilestoneCoins[h.id] || []).length > 0 && (
                            <div onClick={() => { setDetailId(h.id); setPage("detail"); }} style={{ cursor: "pointer", flexShrink: 0 }}>
                              <CoinBadge earnedCoins={earnedMilestoneCoins[h.id]} isQuit={quit} />
                            </div>
                          )}
                          {!isPaused && quit && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setUrgeSupportHabit(h); }}
                              style={{
                                fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 100,
                                background: `${h.color}12`, color: h.color,
                                border: "none", cursor: "pointer", fontFamily: "inherit",
                                display: "inline-flex", alignItems: "center", gap: 3,
                              }}
                            >
                              <Wind size={9} /> Urge
                            </button>
                          )}
                          {!isPaused && !quit && graceTokens > 0 && (
                            <span
                              title={graceOn ? "A grace day is protecting your streak" : `${graceTokens} grace ${graceTokens === 1 ? "day" : "days"} banked`}
                              style={{
                                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                                background: graceOn ? "rgba(74,222,128,0.16)" : "rgba(96,165,250,0.12)",
                                color: graceOn ? "#4ade80" : "#60a5fa",
                                display: "inline-flex", alignItems: "center", gap: 2,
                                boxShadow: graceOn ? "0 0 8px rgba(74,222,128,0.35)" : "none",
                              }}>
                              <Shield size={9} fill={graceOn ? "#4ade80" : "none"} />{graceTokens}
                            </span>
                          )}
                          {!isPaused && !quit && streak >= 7 && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                              background: th.streakActiveBg, color: "#d97706",
                              display: "inline-flex", alignItems: "center", gap: 2,
                            }}>
                              <Flame size={9} />{streak}d
                            </span>
                          )}
                        </div>
                        {/* Gray × delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(h.id); }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                            color: "rgba(255,255,255,0.15)", fontSize: 14, fontWeight: 400,
                            flexShrink: 0, padding: 0, marginLeft: 2, lineHeight: 1,
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
                          aria-label={`Remove ${h.name}`}
                        >
                          <X size={12} />
                        </button>
                        {/* Ambient egg-warming progress — fills toward the next hatch/evolution */}
                        {!isPaused && !quit && stage < 4 && (() => {
                          const pv = STAGE_THRESHOLDS[stage];
                          const nx = STAGE_THRESHOLDS[stage + 1];
                          const pct = Math.max(0, Math.min(((total - pv) / (nx - pv)) * 100, 100));
                          const warming = pct >= 66; // egg is glowing hot, close to hatch
                          const label = stage === 0 ? "warming toward hatch" : "growing toward next form";
                          return (
                            <div
                              aria-hidden="true"
                              title={`${Math.round(pct)}% — ${label}`}
                              style={{
                                position: "absolute", left: 12, right: 12, bottom: 3,
                                height: 2.5, borderRadius: 2, overflow: "hidden",
                                background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                              }}
                            >
                              <div style={{
                                height: "100%", width: `${pct}%`, borderRadius: 2,
                                background: `linear-gradient(90deg,${h.color}55,${h.color})`,
                                boxShadow: warming ? `0 0 6px ${h.color}` : "none",
                                animation: warming ? "eggWarm 2.4s ease-in-out infinite" : "none",
                                transition: "width 0.5s ease",
                              }} />
                            </div>
                          );
                        })()}
                    </div>
                  );
                })
              )}
            </div>

            {/* All activity heatmap */}
            {buildHabits.length > 0 && (() => {
              // Streak-at-risk alerts
              const atRisk = buildHabits.filter((h) => !isHappy(h.id) && getStreak(h.id) >= 3);
              return atRisk.length > 0 ? (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {atRisk.slice(0, 2).map((h) => (
                    <div key={h.id} onClick={() => toggleCompletion(h.id)}
                      {...clickable(() => toggleCompletion(h.id), { label: `Mark ${h.name} done to protect your ${getStreak(h.id)} day streak` })}
                      style={{
                      padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                      background: `linear-gradient(90deg,${h.color}08,${h.color}03)`,
                      border: `1px solid ${h.color}18`,
                      display: "flex", alignItems: "center", gap: 8, transition: "all .15s",
                    }}>
                      <Flame size={12} color={h.color} />
                      <span style={{ flex: 1, fontSize: 11, color: th.text }}>
                        <b>{h.name}</b> — tap to protect your <span style={{ color: h.color, fontWeight: 700 }}>{getStreak(h.id)}d streak</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}



            {habits.length > 0 && (
              <div className="cd" style={{
                padding: "12px 10px", marginTop: 10,
                background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, padding: "0 4px 8px", color: "rgba(255,255,255,0.25)" }}>Activity</div>
                <Heatmap getData={overallHeatData} weeks={12} color="#4caf50" heatEmpty={th.heatEmpty} labelColor={th.label} legendColor={th.textFaint} />
              </div>
            )}
          </div>
        )}

        {/* ═══ DETAIL ═══ */}
        {page === "detail" && detailHabit && (() => {
          const dq = isQuit(detailHabit);
          const cleanD = dq ? getCleanDays(detailHabit.id) : 0;
          const dqd = dq ? getQuitData(detailHabit.id) : undefined;
          const urges = dqd?.urges || [];
          return (
          <div style={{ animation: "fadeUp 0.28s ease", paddingBottom: 100 }}>
            <div
              className="cd"
              style={{
                padding: "28px 22px 22px", textAlign: "center", marginBottom: 10,
                background: th.card,
                borderColor: th.cardBorder, boxShadow: th.cardShadow,
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Vignette glow behind creature */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 200,
                background: `radial-gradient(circle at 50% 40%, ${detailHabit.color}22 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* Single hero creature — 140px, centered */}
              <div style={{ position: "relative", zIndex: 1 }}>
                {dq ? (
                  // Use the shared stage function (STAGE_THRESHOLDS 0/3/7/14/30 + the
                  // self-healing computeQuitStage floor) so the hero matches its own
                  // "Quitting · <stage label>" caption and every other quit surface —
                  // a raw Math.floor(cleanD/7) disagreed with all of them.
                  <Creature stage={getStageForId(detailHabit.id)} color={detailHabit.color} happy={cleanD > 0} size={140} creatureType={detailHabit.creature_type} habitId={detailHabit.id} />
                ) : (
                  <Creature stage={getStageForId(detailHabit.id)} color={detailHabit.color} happy={isHappy(detailHabit.id)} size={140} creatureType={detailHabit.creature_type} habitId={detailHabit.id} />
                )}
              </div>

              {editMode ? (
                <div style={{ marginTop: 8, maxWidth: 260, margin: "8px auto 0" }}>
                  <input
                    ref={editRef} className="inp" value={editName} maxLength={30}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); }}
                    style={{
                      textAlign: "center", marginBottom: 8,
                      background: th.inputBg, borderColor: th.inputBorder, color: th.text,
                    }}
                  />
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {HABIT_COLORS.map((c) => (
                      <div key={c} className={`ct ${editColor === c ? "sl" : ""}`} style={{ background: c }} onClick={() => setEditColor(c)} {...clickable(() => setEditColor(c), { role: "radio", checked: editColor === c, label: `Colour ${c}` })} />
                    ))}
                    {isTendPlus() ? (
                      <label style={{ position: "relative", cursor: "pointer" }}>
                        <div className={`ct ${!HABIT_COLORS.includes(editColor) ? "sl" : ""}`} style={{
                          background: HABIT_COLORS.includes(editColor) ? "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)" : editColor,
                          position: "relative",
                        }} />
                        <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)}
                          style={{ position: "absolute", opacity: 0, width: 0, height: 0, top: 0, left: 0 }} />
                      </label>
                    ) : (
                      <div
                        onClick={() => setShowPaywall(true)}
                        {...clickable(() => setShowPaywall(true), { label: "Custom colours with Tend+" })}
                        className="ct"
                        title="Custom colors with Tend+"
                        style={{ background: "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)", opacity: 0.4, cursor: "pointer", position: "relative" }}
                      >
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "white", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>+</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <button className="btn-s" onClick={() => setEditMode(false)} style={{ background: th.progressBg, color: th.textSub }}>Cancel</button>
                    <button className="btn-s" onClick={saveEdit} style={{ background: darkMode ? "#4caf50" : "#1a1a2e", color: "white" }}>Save</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Creature name — the hero identity */}
                  {detailHabit.creature_name && (
                    <div style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "white",
                      marginTop: 8,
                      letterSpacing: "-0.3px",
                    }}>
                      {detailHabit.creature_name}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: detailHabit.creature_name ? 2 : 6 }}>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: detailHabit.creature_name ? 14 : 19, fontWeight: 600, color: detailHabit.creature_name ? th.textSub : th.text }}>{detailHabit.name}</h2>
                    <button
                      onClick={() => { setEditMode(true); setEditName(detailHabit.name); setEditColor(detailHabit.color); }}
                      style={{ background: th.progressBg, border: "none", borderRadius: 6, padding: 4, cursor: "pointer", display: "flex" }}
                    >
                      <Pencil size={12} color={th.textSub} />
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: th.textSub, marginTop: 2 }}>
                    {dq ? `Quitting · ${STAGE_LABELS[getStageForId(detailHabit.id)]}` : `Building · ${STAGE_LABELS[getStageForId(detailHabit.id)]}`}
                  </p>
                  {dq && dqd?.quitDate && (
                    <p style={{ fontSize: 10, color: th.textFaint, marginTop: 1 }}>
                      {fmtQuitDate(dqd.quitDate)}
                    </p>
                  )}
                  {/* Name your creature prompt — if not yet named and stage >= 1 */}
                  {!detailHabit.creature_name && getStageForId(detailHabit.id) >= 1 && (
                    <button
                      onClick={() => setNamingHabit({ id: detailHabit.id, name: detailHabit.name, stage: getStageForId(detailHabit.id), color: detailHabit.color, creatureType: detailHabit.creature_type })}
                      style={{
                        marginTop: 6, padding: "5px 14px", borderRadius: 100,
                        background: `${detailHabit.color}15`, border: `1px solid ${detailHabit.color}25`,
                        color: detailHabit.color, fontSize: 11, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      ✨ Name your creature
                    </button>
                  )}
                  {/* Re-pick egg — only for unhatched (stage 0) */}
                  {getStageForId(detailHabit.id) === 0 && (
                    <button
                      onClick={() => {
                        if (isTendPlus()) {
                          setRePickEggId(detailHabit.id);
                          setPickedEgg(detailHabit.creature_type);
                        } else {
                          setShowPaywall(true);
                        }
                      }}
                      style={{
                        marginTop: 6, padding: "5px 14px", borderRadius: 100,
                        background: isTendPlus() ? `${detailHabit.color}15` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isTendPlus() ? `${detailHabit.color}25` : "rgba(255,255,255,0.08)"}`,
                        color: isTendPlus() ? detailHabit.color : "rgba(255,255,255,0.4)",
                        fontSize: 11, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 4,
                        margin: "6px auto 0",
                      }}
                    >
                      🥚 {isTendPlus() ? "Change egg" : "Choose egg"}
                      {!isTendPlus() && <Crown size={10} color="#fbbf24" />}
                    </button>
                  )}
                </>
              )}

              {/* Quit hero numbers + live timer */}
              {dq && !editMode && (() => {
                const timer = dqd?.quitDate ? formatLiveTimer(dqd.quitDate, liveNow) : null;
                return (
                <div style={{ marginTop: 14 }}>
                  {cleanD === 0 && timer && timer.totalHours >= 1 ? (
                    <>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 56, fontWeight: 700, color: "white", letterSpacing: "-1px", lineHeight: 1 }}>
                        {timer.totalHours}
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>
                        {timer.totalHours === 1 ? "hour clean" : "hours clean"}
                      </div>
                      <div style={{
                        fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 4,
                        animation: "livePulse 4s ease infinite",
                      }}>
                        {timer.totalHours}h {timer.minutes}m
                      </div>
                      {dqd?.quitDate && (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
                          {fmtQuitDate(dqd.quitDate)}
                        </div>
                      )}
                    </>
                  ) : cleanD === 0 && timer ? (
                    <>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 56, fontWeight: 700, color: "white", letterSpacing: "-1px", lineHeight: 1 }}>
                        {timer.minutes}
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>
                        {timer.minutes === 1 ? "minute clean" : "minutes clean"}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 4, fontStyle: "italic" }}>
                        you got this
                      </div>
                    </>
                  ) : cleanD === 0 ? (
                    <>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 600, color: detailHabit.color, lineHeight: 1.2 }}>
                        Just started
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 4 }}>
                        you got this
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 56, fontWeight: 700, color: "white", letterSpacing: "-1px", lineHeight: 1 }}>
                        {cleanD}
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>
                        {cleanD === 1 ? "day clean" : "days clean"}
                      </div>
                      {timer && (
                        <div style={{
                          fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 4,
                          animation: "livePulse 4s ease infinite",
                        }}>
                          {timer.totalHours.toLocaleString()} hours · {timer.minutes} minutes
                        </div>
                      )}
                    </>
                  )}
                  {dqd && (dqd.dailyCost || 0) > 0 && cleanD > 0 && (
                    <div style={{ fontSize: 14, color: "#4caf50", fontWeight: 600, marginTop: 6 }}>
                      {fmtMoney((dqd.dailyCost || 0) * cleanD)} saved
                    </div>
                  )}
                </div>
                );
              })()}

              {/* Stats — build habits only (before evolution bar) */}
              {!editMode && !dq && (
                <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 18 }}>
                  {[
                    { l: "Streak", v: `${getStreak(detailHabit.id)}d` },
                    { l: "Total", v: getTotal(detailHabit.id) },
                    { l: "Best", v: `${getBestStreak(detailHabit.id)}d` },
                  ].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces',serif", color: th.text }}>{s.v}</div>
                      <div className="lb" style={{ marginTop: 2, color: th.label }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Evolution progress */}
              {!editMode && getStageForId(detailHabit.id) < 4 &&
                (() => {
                  const st = getStageForId(detailHabit.id);
                  const tot = getTotal(detailHabit.id);
                  const nx = STAGE_THRESHOLDS[st + 1];
                  const pv = STAGE_THRESHOLDS[st];
                  const pct = Math.min(((tot - pv) / (nx - pv)) * 100, 100);
                  const remaining = nx - tot;
                  return (
                    <div style={{ maxWidth: 240, margin: "14px auto 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: th.textMuted, marginBottom: 3 }}>
                        <span>{STAGE_LABELS[st]}</span><span>{STAGE_LABELS[st + 1]} in {remaining} {remaining === 1 ? "day" : "days"}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: th.progressBg, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3, width: `${pct}%`,
                          background: `linear-gradient(90deg,${detailHabit.color}88,${detailHabit.color})`,
                          transition: "width 0.4s",
                        }} />
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* Share progress card */}
            {(getStageForId(detailHabit.id) >= 1 || (isQuit(detailHabit) && getCleanDays(detailHabit.id) >= 1)) && (
              <button
                onClick={() => openShareCard(detailHabit)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12, marginBottom: 10,
                  border: `1px solid ${detailHabit.color}20`,
                  background: `${detailHabit.color}08`, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 14, fontWeight: 600,
                  color: detailHabit.color,
                  transition: "all 0.15s",
                }}
              >
                <Share2 size={16} />
                Share {detailHabit.creature_name ? `${detailHabit.creature_name}'s` : "your"} progress
              </button>
            )}

            {/* Pause / Resume toggle — all habit types */}
            <button
              onClick={() => togglePause(detailHabit.id)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12, marginBottom: 10,
                border: `1px solid ${pausedHabits[detailHabit.id] ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.08)"}`,
                background: "transparent", cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 14, fontWeight: 500,
                color: pausedHabits[detailHabit.id] ? "#4ade80" : th.textMuted,
                transition: "all 0.15s",
              }}
            >
              {pausedHabits[detailHabit.id] ? <Play size={16} /> : <Pause size={16} />}
              {pausedHabits[detailHabit.id] ? "Resume this habit" : "Pause this habit"}
            </button>

            {/* ── Streak shield / grace token — build habits only ── */}
            {!dq && !editMode && (() => {
              const tokens = streakFreezes[detailHabit.id] || 0;
              const protectedNow = isGraceProtected(detailHabit.id);
              const full = tokens >= MAX_GRACE;
              const canAfford = coins >= GRACE_COST;
              return (
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: tokens > 0 ? "rgba(74,222,128,0.14)" : "rgba(255,255,255,0.05)",
                      boxShadow: protectedNow ? "0 0 12px rgba(74,222,128,0.4)" : "none",
                    }}>
                      <Shield size={20} color={tokens > 0 ? "#4ade80" : th.textMuted} fill={protectedNow ? "#4ade80" : "none"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.text }}>Streak shield</div>
                      <div style={{ fontSize: 11, color: th.textSub, marginTop: 2, lineHeight: 1.4 }}>
                        {tokens > 0
                          ? `${tokens} grace ${tokens === 1 ? "day" : "days"} banked — one slip won't break your streak`
                          : "Earn one free at 7-, 21- & 60-day streaks, or bank one now so a slip never stings"}
                      </div>
                      {protectedNow && (
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", marginTop: 4 }}>
                          🛡️ A grace day is protecting your streak right now
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { if (!full && canAfford) buyFreeze(detailHabit.id); }}
                    disabled={full || !canAfford}
                    style={{
                      width: "100%", padding: "11px 16px", borderRadius: 12, marginTop: 12,
                      border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                      cursor: full || !canAfford ? "default" : "pointer",
                      opacity: full || !canAfford ? 0.5 : 1,
                      background: "rgba(74,222,128,0.12)", color: "#4ade80",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    {full ? (
                      "Shield full — 3 grace days banked"
                    ) : !canAfford ? (
                      <>Need {GRACE_COST} <Coins size={13} /> to bank a grace day</>
                    ) : (
                      <>Bank a grace day · {GRACE_COST} <Coins size={13} /></>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* ── Quit-specific sections ── */}
            {dq && (
              <>
                {/* Breathing + Reset buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button
                    onClick={() => setBreathingHabit(detailHabit)}
                    className="cd"
                    style={{
                      flex: 1, padding: "14px 10px", textAlign: "center", cursor: "pointer",
                      background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <Wind size={16} color={detailHabit.color} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.text }}>Breathe</div>
                      <div style={{ fontSize: 10, color: th.textSub }}>Urge surfing</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setRelapseHabit(detailHabit)}
                    className="cd"
                    style={{
                      flex: 1, padding: "14px 10px", textAlign: "center", cursor: "pointer",
                      background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <RefreshCw size={16} color="#ef4444" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.text }}>Reset</div>
                      <div style={{ fontSize: 10, color: th.textSub }}>Start over</div>
                    </div>
                  </button>
                </div>

                {/* Reason editor */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <ReasonEditor
                    value={dqd?.reason}
                    onSave={(text) => updateReason(detailHabit.id, text)}
                    color={detailHabit.color}
                    th={th}
                  />
                </div>

                {/* Activity heatmap — compact 12 weeks */}
                <div className="cd" style={{
                  padding: "12px 10px", marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, padding: "0 4px 8px", color: "rgba(255,255,255,0.25)" }}>Activity</div>
                  <Heatmap getData={detailHeatData} color={detailHabit.color} weeks={12} heatEmpty={th.heatEmpty} labelColor={th.label} legendColor={th.textFaint} />
                </div>

                {/* Healing timeline */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <HealingTimeline habit={detailHabit} cleanDays={cleanD} th={th} />
                </div>

                {/* AA-style milestone coins */}
                {(earnedMilestoneCoins[detailHabit.id] || []).length > 0 && (
                  <div className="cd" style={{
                    padding: 14, marginBottom: 10,
                    background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 8, color: "rgba(255,255,255,0.25)" }}>Milestone Coins</div>
                    <CoinRow habitId={detailHabit.id} earnedCoins={earnedMilestoneCoins[detailHabit.id] || []} isQuit />
                  </div>
                )}

                {/* Milestones */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 8, color: "rgba(255,255,255,0.25)" }}>Milestones</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {MILESTONES.map((m) => {
                      const e = !!earned[`${detailHabit.id}:${m.days}`];
                      const Ic = getIcon(m.iconName);
                      return (
                        <div key={m.days} style={{
                          display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                          borderRadius: 10, fontSize: 11, fontWeight: 600,
                          background: e ? th.streakActiveBg : th.hoverBg,
                          color: e ? "#d97706" : th.textMuted,
                          border: `1px solid ${e ? "rgba(245,158,11,.1)" : th.cardBorder}`,
                          transition: "all 0.2s",
                        }}>
                          <Ic size={12} />{m.label}{e && <span style={{ opacity: 0.5 }}>+{m.coins}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Urge trend */}
                {urges.length > 0 && (
                  <div className="cd" style={{
                    padding: 14, marginBottom: 10,
                    background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                  }}>
                    <UrgeTrend urgeLog={urges} color={detailHabit.color} th={th} />
                  </div>
                )}

                {/* Delete this habit — muted red text */}
                <button
                  onClick={() => setConfirmDeleteId(detailHabit.id)}
                  style={{
                    width: "100%", padding: 16, borderRadius: 12,
                    border: "none", background: "transparent",
                    color: "rgba(255,100,100,0.6)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.12s",
                    textAlign: "center",
                  }}
                >
                  Delete this habit
                </button>
              </>
            )}

            {/* ── Build-specific sections ── */}
            {!dq && (
              <>
                {/* Activity heatmap — compact 12 weeks */}
                <div className="cd" style={{
                  padding: "12px 10px", marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, padding: "0 4px 8px", color: "rgba(255,255,255,0.25)" }}>Activity</div>
                  <Heatmap getData={detailHeatData} color={detailHabit.color} weeks={12} heatEmpty={th.heatEmpty} labelColor={th.label} legendColor={th.textFaint} />
                </div>

                {/* AA-style milestone coins */}
                {(earnedMilestoneCoins[detailHabit.id] || []).length > 0 && (
                  <div className="cd" style={{
                    padding: 14, marginBottom: 10,
                    background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 8, color: "rgba(255,255,255,0.25)" }}>Milestone Coins</div>
                    <CoinRow habitId={detailHabit.id} earnedCoins={earnedMilestoneCoins[detailHabit.id] || []} isQuit={false} />
                  </div>
                )}

                {/* Milestones */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 8, color: "rgba(255,255,255,0.25)" }}>Milestones</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {MILESTONES.map((m) => {
                      const e = !!earned[`${detailHabit.id}:${m.days}`];
                      const Ic = getIcon(m.iconName);
                      return (
                        <div key={m.days} style={{
                          display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                          borderRadius: 10, fontSize: 11, fontWeight: 600,
                          background: e ? th.streakActiveBg : th.hoverBg,
                          color: e ? "#d97706" : th.textMuted,
                          border: `1px solid ${e ? "rgba(245,158,11,.1)" : th.cardBorder}`,
                          transition: "all 0.2s",
                        }}>
                          <Ic size={12} />{m.label}{e && <span style={{ opacity: 0.5 }}>+{m.coins}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delete this habit — muted red text */}
                <button
                  onClick={() => setConfirmDeleteId(detailHabit.id)}
                  style={{
                    width: "100%", padding: 16, borderRadius: 12,
                    border: "none", background: "transparent",
                    color: "rgba(255,100,100,0.6)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.12s",
                    textAlign: "center",
                  }}
                >
                  Delete this habit
                </button>
              </>
            )}
          </div>
          );
        })()}

        {/* ═══ GALLERY ═══ */}
        {page === "gallery" && (
          <Gallery habits={habits} getStage={getStageForId} getTotal={getTotal} isHappy={isHappy} th={th}
            onCreatureTap={(hId) => { setDetailId(hId); setPage("detail"); }}
            earnedMilestoneCoins={earnedMilestoneCoins}
          />
        )}

        {/* ═══ CONSTELLATION ═══ */}
        {page === "constellation" && (
          <div style={{ animation: "fadeUp 0.28s ease" }}>
            {/* Tend Wrapped launcher — the shareable story reel */}
            {habits.length > 0 && (
              <button
                onClick={() => { haptic("medium"); setShowWrapped(true); }}
                style={{
                  width: "100%", marginBottom: 12, padding: "16px 18px", borderRadius: 18,
                  border: "1px solid rgba(139,92,246,0.3)", cursor: "pointer", textAlign: "left",
                  fontFamily: "inherit",
                  background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(74,222,128,0.12))",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: "0 6px 22px rgba(139,92,246,0.15)",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                  background: "linear-gradient(135deg, #8B5CF6, #4ade80)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
                }}>
                  {"✨"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: th.text }}>Your Tend Story</div>
                  <div style={{ fontSize: 12, color: th.textSub, marginTop: 1 }}>A shareable look at everything you&rsquo;ve tended</div>
                </div>
                <ChevronRight size={18} color={th.textMuted} />
              </button>
            )}
            {/* Multi-habit heatmap — first section */}
            {habits.length > 0 && (
              <MultiHabitHeatmap habits={habits} isDone={isComplete} getCleanDays={getCleanDays} th={th} />
            )}
            <Constellation habits={habits} isDone={isComplete} getStreak={getStreak} getTotal={getTotal} getCleanDays={getCleanDays} getBestStreak={getBestStreak} getStage={getStageForId} th={th} isPro={isTendPlus()} onUpgrade={() => setShowPaywall(true)} gratitudeLog={gratitudeLog} />
          </div>
        )}

        {/* ═══ SOCIAL ═══ */}
        {page === "social" && (
          <div style={{ animation: "fadeUp 0.28s ease", textAlign: "center", padding: "60px 20px" }}>
            <Users size={32} color="#4caf50" style={{ marginBottom: 12, opacity: 0.5 }} />
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text, marginBottom: 6 }}>Tend Together</h2>
            <p style={{ fontSize: 13, color: th.textSub }}>Coming Soon</p>
          </div>
        )}

        {/* ═══ SHOP ═══ */}
        {page === "shop" && (
          <Shop coins={coins} ownedItems={ownedItems} onBuy={buyItem} th={th}
            isPro={isTendPlus()}
            onPremiumTap={() => setShowPremiumPrompt(true)}
            onOwnedTap={() => { setPage("main"); setTimeout(() => terRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); }}
          />
        )}

        {/* ═══ WELLNESS ═══ */}
        {page === "wellness" && (
          <WellnessHub th={th} darkMode={darkMode} onBreathe={() => { setBreathingHabit(null); setShowBreathe(true); }} onSaveGratitude={saveGratitude} />
        )}

        {/* ═══ YOU ═══ */}
        {page === "you" && (
          <YouScreen
            th={th}
            darkMode={darkMode}
            season={season}
            profile={{
              firstName: user?.firstName,
              imageUrl: user?.imageUrl,
              email: user?.primaryEmailAddress?.emailAddress,
            }}
            isPro={isTendPlus()}
            coins={coins}
            dragonCount={habits.length}
            bestStreak={habits.reduce((m, h) => Math.max(m, getBestStreak(h.id)), 0)}
            onSeasonChange={setSeason}
            onToggleDark={() => setDarkMode((d) => !d)}
            onOpenGallery={() => setPage("gallery")}
            onOpenShop={() => setPage("shop")}
            onOpenSettings={() => router.push("/settings")}
            onManageSubscription={async () => {
              try {
                const res = await fetch("/api/portal", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              } catch { /* ignore */ }
            }}
            onUpgrade={() => setShowPaywall(true)}
            onSignOut={() => signOut({ redirectUrl: "/" })}
          />
        )}
      </div>

      {/* FAB — lifted above the bottom nav + safe area */}
      {page === "main" && (
        <div style={{ position: "fixed", bottom: "calc(84px + env(safe-area-inset-bottom, 0px))", right: 20, zIndex: 55 }}>
          <button className="fab" aria-label="Add a new habit" onClick={() => {
            if (habits.length >= FREE_HABIT_LIMIT && !isTendPlus()) {
              setShowPaywall(true);
              return;
            }
            setPage("add");
          }}>
            <Plus size={22} />
          </button>
        </div>
      )}

      {/* ═══ BOTTOM NAV — primary thumb-first navigation ═══ */}
      {page !== "add" && (
        <BottomNav
          th={th}
          darkMode={darkMode}
          active={navActiveTab}
          onNavigate={(tab) => {
            if (tab === "garden") { setPage("main"); }
            else if (tab === "insights") { setPage("constellation"); }
            else if (tab === "wellness") { setPage("wellness"); }
            else if (tab === "you") { setPage("you"); }
          }}
        />
      )}

      {/* ADD */}
      {page === "add" && (
        <div className="mbg" style={{ background: th.overlayBg }} onClick={(e) => { if (e.target === e.currentTarget) setPage("main"); }}>
          <div className="ml" style={{ background: th.modalBg }} onClick={(e) => e.stopPropagation()}>
            {/* Fixed header */}
            <div style={{ padding: "20px 18px 12px", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text }}>Add habit</h2>
              <button
                onClick={() => setPage("main")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", color: th.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable presets */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", WebkitOverflowScrolling: "touch" }}>

            {/* ── Quit presets ── */}
            {(() => {
              const quits = QUIT_PRESETS.filter((p) => !habits.find((h) => h.name === p.name));
              if (!quits.length) return null;
              return (
                <div style={{ marginBottom: 12 }}>
                  <div className="lb" style={{ marginBottom: 2, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
                    <Shield size={10} /> Quit a habit
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2, marginBottom: 8 }}>
                    Tap to add. You can rename any habit.
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {quits.map((p) => {
                      const Ic = getIcon(p.iconName);
                      return (
                        <button key={p.name} className="pb" style={{
                          background: th.card, borderColor: th.cardBorder, color: th.text,
                        }} onClick={() => startAddHabit(p.name, p.color, p.iconName, "quit", p.cost)}>
                          <Ic size={14} color={p.color} />{p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── Build presets ── */}
            {PRESET_CATEGORIES.map((gr) => {
              const its = PRESETS.filter(
                (p) => p.cat === gr.cat && !habits.find((h) => h.name === p.name)
              );
              if (!its.length) return null;
              return (
                <div key={gr.cat} style={{ marginBottom: 12 }}>
                  <div className="lb" style={{ marginBottom: 5, color: th.label }}>{gr.label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {its.map((p) => {
                      const Ic = getIcon(p.iconName);
                      return (
                        <button key={p.name} className="pb" style={{
                          background: th.card, borderColor: th.cardBorder, color: th.text,
                        }} onClick={() => startAddHabit(p.name, p.color, p.iconName)}>
                          <Ic size={14} color={p.color} />{p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </div>{/* end scrollable presets */}

            {/* Fixed footer — custom input */}
            <div style={{ padding: "12px 18px 28px", flexShrink: 0, borderTop: `1px solid ${th.cardBorder}` }}>
              <div className="lb" style={{ marginBottom: 5, color: th.label }}>Custom</div>
              <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                {HABIT_COLORS.map((c) => (
                  <div key={c} className={`ct ${cColor === c ? "sl" : ""}`} style={{ background: c }} onClick={() => setCColor(c)} {...clickable(() => setCColor(c), { role: "radio", checked: cColor === c, label: `Colour ${c}` })} />
                ))}
                {isTendPlus() ? (
                  <label style={{ position: "relative", cursor: "pointer" }}>
                    <div className={`ct ${!HABIT_COLORS.includes(cColor) ? "sl" : ""}`} style={{
                      background: HABIT_COLORS.includes(cColor) ? "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)" : cColor,
                      position: "relative",
                    }} />
                    <input type="color" value={cColor} onChange={(e) => setCColor(e.target.value)}
                      style={{ position: "absolute", opacity: 0, width: 0, height: 0, top: 0, left: 0 }} />
                  </label>
                ) : (
                  <div
                    onClick={() => setShowPaywall(true)}
                    {...clickable(() => setShowPaywall(true), { label: "Custom colours with Tend+" })}
                    className="ct"
                    title="Custom colors with Tend+"
                    style={{ background: "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)", opacity: 0.4, cursor: "pointer", position: "relative" }}
                  >
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "white", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>+</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <input
                  ref={inputRef} className="inp" placeholder="Habit name..." value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && cName.trim()) startAddHabit(cName.trim(), cColor, "Target"); }}
                  style={{ background: th.inputBg, borderColor: th.inputBorder, color: th.text }}
                />
                <button
                  onClick={() => { if (cName.trim()) startAddHabit(cName.trim(), cColor, "Target"); }}
                  style={{
                    padding: "0 18px", borderRadius: 12,
                    background: cName.trim() ? "linear-gradient(135deg,#4caf50,#2e7d32)" : th.progressBg,
                    color: cName.trim() ? "white" : th.textMuted,
                    border: "none", fontSize: 13, fontWeight: 600,
                    cursor: cName.trim() ? "pointer" : "default",
                    fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s",
                  }}
                >
                  Add
                </button>
              </div>
              {addError && (
                <div
                  onClick={() => { if (habits.length >= FREE_HABIT_LIMIT && !isTendPlus()) { setPage("main"); setShowPaywall(true); } }}
                  style={{
                    marginTop: 8, fontSize: 12, fontWeight: 500, lineHeight: 1.5,
                    color: habits.length >= FREE_HABIT_LIMIT && !isTendPlus() ? "#4ade80" : th.textMuted,
                    cursor: habits.length >= FREE_HABIT_LIMIT && !isTendPlus() ? "pointer" : "default",
                  }}
                >
                  {habits.length >= FREE_HABIT_LIMIT && !isTendPlus()
                    ? "Unlock unlimited habits with Tend+ →"
                    : addError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Back modal */}
      {showWelcomeBack && (
        <WelcomeBack daysAway={daysAwayCnt} onClose={() => setShowWelcomeBack(false)} th={th} />
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (() => {
        const habit = habits.find(h => h.id === confirmDeleteId);
        return (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
          }} onClick={() => setConfirmDeleteId(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: th.card, borderRadius: 16, padding: "24px 20px", maxWidth: 320,
              width: "100%", textAlign: "center",
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: th.text, marginBottom: 4 }}>
                Remove &ldquo;{habit?.name}&rdquo;?
              </div>
              <div style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5, marginBottom: 20 }}>
                Your creature and all progress for this habit will be permanently deleted.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setConfirmDeleteId(null)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                  background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                  color: th.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>Cancel</button>
                <button onClick={() => { removeHabit(confirmDeleteId); setConfirmDeleteId(null); }} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                  background: "transparent", color: "#ef4444", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Remove</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
    </div>
  );
}
