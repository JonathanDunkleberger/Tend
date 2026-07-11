import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TendApp } from "@/components/tend-app";
import { today, daysAgo, getStage } from "@/lib/utils";
import { getSeason } from "@/lib/constants";
import { ensureProfile } from "@/lib/ensure-profile";
import type { Habit, HabitLog, HabitWithStats, EarnedMilestones, QuitData, QuitProgressRow } from "@/types";

export default async function GardenPage() {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = await createServerSupabaseClient();

  // Fetch habits. A TRANSIENT read failure here must NOT silently render a
  // false-empty garden ("all my habits vanished!") — throw so the route's
  // error boundary (error.tsx) shows a reassuring, retryable state instead.
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true });

  if (habitsError) throw new Error(`Failed to load habits: ${habitsError.message}`);

  const habitIds = (habits || []).map((h: Habit) => h.id);

  // Fetch logs (last 90 days — sufficient for heatmaps and streak calc). Same
  // reasoning: a transient failure would render every streak at 0 (the emotional
  // core looking reset) — throw to the boundary rather than show wrong data.
  const logWindow = daysAgo(90);
  const { data: logs, error: logsError } = habitIds.length > 0
    ? await supabase.from("habit_logs").select("*").in("habit_id", habitIds).gte("log_date", logWindow)
    : { data: [], error: null };

  if (logsError) throw new Error(`Failed to load habit logs: ${logsError.message}`);

  // True LIFETIME completion count per habit. The 90-day window above is only for
  // heatmaps/streaks, but the client derives a build habit's "total days" AND its
  // dragon evolution stage from the total — which is cumulative and must NOT shrink
  // when old logs age out of the window (otherwise a returning user's grown dragon
  // reverts to an egg). An exact count per habit avoids Supabase's 1000-row select
  // cap; on a transient error we omit the entry and fall back to the windowed count
  // below, so a total is never spuriously 0.
  const totalDaysByHabit: Record<string, number> = {};
  await Promise.all(
    habitIds.map(async (id: string) => {
      const { count, error } = await supabase
        .from("habit_logs")
        .select("*", { count: "exact", head: true })
        .eq("habit_id", id);
      if (!error && typeof count === "number") totalDaysByHabit[id] = count;
    })
  );

  // Ensure profile exists (auto-creates if Clerk webhook didn't fire)
  const profile = await ensureProfile(supabase, userId);

  // Fetch earned milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .in("habit_id", habitIds.length > 0 ? habitIds : ["__none__"]);

  // Build earned map
  const earned: EarnedMilestones = {};
  (milestones || []).forEach((m: { habit_id: string; value: number }) => {
    earned[`${m.habit_id}:${m.value}`] = true;
  });

  // ── New: fetch quit_progress, user_inventory, user_preferences ──

  // Quit progress → convert DB rows to quitDataMap keyed by habit_id
  const initialQuitData: Record<string, QuitData> = {};
  {
    const { data: qpRows } = await supabase
      .from("quit_progress")
      .select("*")
      .eq("user_id", userId);
    if (qpRows && qpRows.length > 0) {
      for (const row of qpRows as QuitProgressRow[]) {
        initialQuitData[row.habit_id] = {
          quitDate: row.quit_date,
          dailyCost: row.daily_cost,
          reason: row.reason,
          urges: Array.isArray(row.urges) ? row.urges : [],
          bestStreak: row.best_streak,
        };
      }
    }
  }

  // User inventory → string[]
  let initialOwnedItems: string[] = [];
  {
    const { data: invRows } = await supabase
      .from("user_inventory")
      .select("item_id")
      .eq("user_id", userId)
      .order("created_at");
    if (invRows) {
      initialOwnedItems = invRows.map((r: { item_id: string }) => r.item_id);
    }
  }

  // User preferences
  let initialPreferences: {
    darkMode: boolean;
    season: string;
    earnedMilestoneCoins: Record<string, string[]>;
    onboardingComplete: boolean;
    lastCheckinDate: string | null;
    lastBonusDate: string | null;
    gratitudeEntries: { date: string; items: string[] }[];
  } = { darkMode: false, season: getSeason(), earnedMilestoneCoins: {}, onboardingComplete: false, lastCheckinDate: null, lastBonusDate: null, gratitudeEntries: [] };
  {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (prefs) {
      initialPreferences = {
        darkMode: prefs.dark_mode ?? false,
        season: prefs.season ?? getSeason(),
        earnedMilestoneCoins: (prefs.earned_milestone_coins as Record<string, string[]>) ?? {},
        onboardingComplete: prefs.onboarding_complete ?? false,
        lastCheckinDate: prefs.last_checkin_date ?? null,
        lastBonusDate: prefs.last_bonus_date ?? null,
        gratitudeEntries: (prefs.gratitude_entries as { date: string; items: string[] }[]) ?? [],
      };
    }
  }

  // Build paused habits map from habit.is_paused column
  const initialPausedHabits: Record<string, boolean> = {};
  (habits || []).forEach((h: Habit) => {
    if (h.is_paused) initialPausedHabits[h.id] = true;
  });

  const todayStr = today();

  // Compute stats per habit
  const habitsWithStats: HabitWithStats[] = (habits || []).map((habit: Habit) => {
    const habitLogs = (logs || []).filter((l: HabitLog) => l.habit_id === habit.id);
    const completedToday = habitLogs.some((l: HabitLog) => l.log_date === todayStr);

    // Compute streak
    let currentStreak = 0;
    let d = 0;
    const logDates = new Set(habitLogs.map((l: HabitLog) => l.log_date));
    // If today isn't complete yet, start from yesterday (don't break streak mid-day)
    if (!logDates.has(daysAgo(0))) d = 1;
    while (logDates.has(daysAgo(d))) {
      currentStreak++;
      d++;
    }

    // Lifetime total (never below the windowed count we actually shipped, so the
    // client's pre-window offset can't go negative).
    const totalDays = Math.max(totalDaysByHabit[habit.id] ?? 0, habitLogs.length);

    return {
      ...habit,
      currentStreak,
      totalDays,
      completedToday,
      stage: getStage(totalDays),
      logs: habitLogs as HabitLog[],
    };
  });

  return (
    <TendApp
      initialHabits={habitsWithStats}
      initialCoins={profile?.coins ?? 250}
      initialEarned={earned}
      initialStreakFreezes={(profile?.streak_freezes as Record<string, number>) ?? {}}
      initialIsPro={profile?.tier === "pro"}
      initialQuitData={initialQuitData}
      initialOwnedItems={initialOwnedItems}
      initialPausedHabits={initialPausedHabits}
      initialPreferences={initialPreferences}
    />
  );
}
