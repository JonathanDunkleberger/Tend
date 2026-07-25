// ── Daily Coach ───────────────────────────────────────────────────────────
// The rule engine behind the "Coach's note" card on the Garden — one kind,
// specific, data-driven line each day, in the voice of a friend who's been
// paying attention. Whoop-style personalization, recovery-style tone: the
// coach names real patterns (comebacks, milestone eves, survived urges, your
// statistically hardest weekday) but never scolds. Pure + framework-free like
// its siblings (progress.ts, streak.ts) so every rule is unit-testable; the
// caller assembles CoachInput from live app state and renders the note.
//
// Priority order matters: the most emotionally important true thing wins.
// A comeback after a slip outranks everything — that's the moment the app
// exists for.

export interface CoachHabitInput {
  id: string;
  /** Habit name, e.g. "Nicotine-free" */
  name: string;
  /** Dragon's given name, if the user named it */
  petName: string | null;
  isQuit: boolean;
  paused: boolean;
  /** Build: grace-aware current streak · quit: current clean days */
  streak: number;
  /** Best run ever achieved (survives resets) */
  bestStreak: number;
  /** Build only: completed today */
  doneToday: boolean;
  /** Build only: days since last completion (0 = today), null = never done */
  daysSinceDone: number | null;
  /** Quit only: ISO dates (YYYY-MM-DD) urges were survived */
  urgeDates: readonly string[];
}

export interface CoachInput {
  /** Local YYYY-MM-DD */
  todayStr: string;
  yesterdayStr: string;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  habits: readonly CoachHabitInput[];
  /** Completion % this week / last week (same math as Insights momentum) */
  thisWeekPct: number;
  lastWeekPct: number;
  /** Global build-habit day-of-week tallies (0=Sun), null if no build habits */
  dayRates: readonly { pct: number; total: number }[] | null;
  allDoneToday: boolean;
}

export type CoachNoteKind =
  | "comeback" | "milestone-eve" | "urge" | "hard-day"
  | "all-done" | "momentum" | "waiting" | "gentle";

export interface CoachNote {
  kind: CoachNoteKind;
  text: string;
}

/** Deterministic small hash so the note is stable across re-renders in a day. */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Stable pick from a candidate list, seeded by date + rule so it varies day to day. */
function pick<T>(items: readonly T[], seedStr: string): T {
  return items[hashStr(seedStr) % items.length];
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const GENTLE_POOL = [
  "Show up small today. A two-minute tend still counts as showing up.",
  "You don\u2019t need a perfect day. You need this day, tended.",
  "Progress you can\u2019t feel yet is still progress. Keep going.",
  "One day at a time isn\u2019t a clich\u00e9 here \u2014 it\u2019s the whole design.",
  "Your dragons don\u2019t need you to be impressive. They just need you to come back.",
];

/** Display name preference: the dragon's given name makes it personal. */
function nameOf(h: CoachHabitInput): string {
  return h.petName || h.name;
}

/**
 * Build today's coach note from live habit state.
 *
 * @param input       assembled app state (see CoachInput)
 * @param milestones  ordered milestone defs — pass MILESTONES from constants
 */
export function buildCoachNote(
  input: CoachInput,
  milestones: readonly { days: number; label: string }[],
): CoachNote {
  const { todayStr, yesterdayStr, weekday, habits, thisWeekPct, lastWeekPct, dayRates, allDoneToday } = input;
  const active = habits.filter((h) => !h.paused);

  // ── 1. Comeback — a quit habit restarting after a real previous run.
  // The single most important message the app can send: your history is
  // strength, not shame.
  const comeback = active.filter((h) => h.isQuit && h.streak <= 1 && h.bestStreak >= 3 && h.bestStreak > h.streak);
  if (comeback.length > 0) {
    const h = pick(comeback, todayStr + "comeback");
    return {
      kind: "comeback",
      text: `You once went ${h.bestStreak} days without ${h.name.toLowerCase()}. That strength didn\u2019t go anywhere \u2014 today is just where it starts again.`,
    };
  }

  // ── 2. Milestone eve — tomorrow crosses a milestone. streak >= 2 so a
  // brand-new habit doesn't get an anticlimactic "tomorrow is day 1".
  const eve = active
    .map((h) => ({ h, m: milestones.find((m) => m.days === h.streak + 1) }))
    .filter((x): x is { h: CoachHabitInput; m: { days: number; label: string } } => !!x.m && x.h.streak >= 2);
  if (eve.length > 0) {
    const { h, m } = pick(eve, todayStr + "eve");
    const what = h.isQuit ? `${m.days} days clean` : m.label.toLowerCase();
    return {
      kind: "milestone-eve",
      text: `One more day makes ${what} for ${nameOf(h)}. Nothing heroic tonight \u2014 just get to tomorrow.`,
    };
  }

  // ── 3. Urge survived — acknowledge the invisible work.
  const urgedToday = active.some((h) => h.isQuit && h.urgeDates.includes(todayStr));
  const urgedYesterday = active.some((h) => h.isQuit && h.urgeDates.includes(yesterdayStr));
  if (urgedToday) {
    return { kind: "urge", text: "You rode out an urge today and stayed clean. That was the hard part \u2014 and you did it." };
  }
  if (urgedYesterday) {
    return { kind: "urge", text: "You survived an urge yesterday and woke up clean. That\u2019s the real work \u2014 be a little proud today." };
  }

  // ── 4. Hard day — today is the user's statistically weakest weekday.
  // Needs a real sample (>= 8 habit-days on this weekday) and a meaningful
  // spread so young accounts don't get fabricated "you slip on Tuesdays".
  if (dayRates && dayRates.length === 7 && !allDoneToday) {
    const today = dayRates[weekday];
    const bestPct = Math.max(...dayRates.map((d) => d.pct));
    const worstPct = Math.min(...dayRates.filter((d) => d.total > 0).map((d) => d.pct));
    if (today.total >= 8 && today.pct === worstPct && bestPct - today.pct >= 25 && today.pct < 60) {
      return {
        kind: "hard-day",
        text: `${WEEKDAYS[weekday]}s are usually your toughest day. Plan one tiny win \u2014 even two minutes counts.`,
      };
    }
  }

  // ── 5. Everything tended — let the day close gently.
  if (allDoneToday && active.length > 0) {
    return { kind: "all-done", text: "Everything is tended and the garden is quiet. Let today end soft \u2014 you did well." };
  }

  // ── 6. Momentum — real week-over-week lift, worth naming.
  const delta = thisWeekPct - lastWeekPct;
  if (lastWeekPct > 0 && delta >= 8) {
    return {
      kind: "momentum",
      text: `You\u2019re tending ${delta}% more than last week. Quiet, steady progress \u2014 the kind that lasts.`,
    };
  }

  // ── 7. A habit left waiting — the kindest possible nudge.
  const waiting = active.filter((h) => !h.isQuit && h.daysSinceDone !== null && h.daysSinceDone >= 3);
  if (waiting.length > 0) {
    const h = pick(waiting, todayStr + "waiting");
    return {
      kind: "waiting",
      text: `${nameOf(h)} has been waiting ${h.daysSinceDone} days. No guilt \u2014 one small tend tonight and the story continues.`,
    };
  }

  // ── 8. Gentle default — rotates daily.
  return { kind: "gentle", text: pick(GENTLE_POOL, todayStr + "gentle") };
}
