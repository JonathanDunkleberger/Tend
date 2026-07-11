/**
 * One-time migration: moves localStorage data to Supabase.
 * Reads old localStorage keys and POSTs to the new API routes.
 * Sets "tend_data_migrated" flag on completion so it only runs once.
 */
export async function migrateLocalStorageToServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("tend_data_migrated") === "1") return false;

  let migrated = false;

  // fetch() only rejects on network errors, NOT on 4xx/5xx — so a plain `await
  // fetch()` swallows server failures and we'd still mark the migration complete
  // below, permanently losing the user's data (this is a one-shot, flag-guarded
  // migration). Throw on a non-ok response so the catch fires and the "done" flag
  // is never set → the migration honestly retries on the next load.
  const putJson = async (url: string, method: string, payload: unknown) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Migration ${method} ${url} failed: ${res.status}`);
  };

  try {
    // 1. Migrate quit data
    const quitRaw = localStorage.getItem("tend_quit_data");
    if (quitRaw) {
      const quitDataMap: Record<string, { quitDate: string; dailyCost: number; reason: string; urges: string[]; bestStreak: number }> = JSON.parse(quitRaw);
      for (const [habitId, qd] of Object.entries(quitDataMap)) {
        await putJson(`/api/quit-progress/${habitId}`, "PUT", qd);
      }
      migrated = true;
    }

    // 2. Migrate owned items
    const itemsRaw = localStorage.getItem("tend_owned_items");
    if (itemsRaw) {
      const items: string[] = JSON.parse(itemsRaw);
      for (const itemId of items) {
        await putJson("/api/inventory", "POST", { itemId });
      }
      migrated = true;
    }

    // 3. Migrate preferences (dark mode, season, milestone coins, stage drops)
    const prefs: Record<string, unknown> = {};
    const darkRaw = localStorage.getItem("tend_dark");
    if (darkRaw) prefs.dark_mode = darkRaw === "1";
    const seasonRaw = localStorage.getItem("tend_season");
    if (seasonRaw) prefs.season = seasonRaw;
    const milestoneRaw = localStorage.getItem("tend_milestone_coins");
    if (milestoneRaw) prefs.earned_milestone_coins = JSON.parse(milestoneRaw);
    const stageRaw = localStorage.getItem("tend_stage_drops");
    if (stageRaw) prefs.stage_drops = JSON.parse(stageRaw);

    // Migrate onboarding / checkin / bonus state
    const onboardingRaw = localStorage.getItem("tend_onboarding_complete");
    if (onboardingRaw === "1") prefs.onboarding_complete = true;
    const checkinRaw = localStorage.getItem("tend_checkin_date");
    if (checkinRaw) prefs.last_checkin_date = checkinRaw;
    const bonusRaw = localStorage.getItem("tend_last_bonus");
    if (bonusRaw) prefs.last_bonus_date = bonusRaw;

    if (Object.keys(prefs).length > 0) {
      await putJson("/api/preferences", "PUT", prefs);
      migrated = true;
    }

    // 4. Migrate paused habits
    const pausedRaw = localStorage.getItem("tend_paused_habits");
    if (pausedRaw) {
      const paused: Record<string, boolean> = JSON.parse(pausedRaw);
      for (const [habitId, isPaused] of Object.entries(paused)) {
        if (isPaused) {
          await putJson(`/api/habits/${habitId}`, "PATCH", { is_paused: true });
        }
      }
      migrated = true;
    }

    // Mark migration complete
    localStorage.setItem("tend_data_migrated", "1");

    if (migrated && process.env.NODE_ENV === "development") {
      console.log("[Tend] localStorage → Supabase migration complete");
    }
  } catch (err) {
    // Don't block the app — migration can retry next load
    if (process.env.NODE_ENV === "development") {
      console.error("[Tend] Migration error:", err);
    }
  }

  return migrated;
}
