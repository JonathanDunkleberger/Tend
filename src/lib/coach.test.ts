import { describe, it, expect } from "vitest";
import { buildCoachNote, type CoachInput, type CoachHabitInput } from "./coach";

const MILESTONES = [
  { days: 1, label: "First step" },
  { days: 3, label: "3 days" },
  { days: 7, label: "One week" },
  { days: 14, label: "Two weeks" },
  { days: 21, label: "Habit formed" },
  { days: 30, label: "One month" },
];

const habit = (over: Partial<CoachHabitInput> = {}): CoachHabitInput => ({
  id: "h1",
  name: "Read",
  petName: null,
  isQuit: false,
  paused: false,
  streak: 5,
  bestStreak: 5,
  doneToday: true,
  daysSinceDone: 0,
  urgeDates: [],
  ...over,
});

const input = (over: Partial<CoachInput> = {}): CoachInput => ({
  todayStr: "2026-07-24",
  yesterdayStr: "2026-07-23",
  weekday: 5, // Friday
  habits: [habit()],
  thisWeekPct: 50,
  lastWeekPct: 50,
  dayRates: null,
  allDoneToday: false,
  ...over,
});

const note = (over: Partial<CoachInput> = {}) => buildCoachNote(input(over), MILESTONES);

describe("buildCoachNote — rule priority", () => {
  it("comeback outranks everything: a quit restart with real history", () => {
    const n = note({
      habits: [
        habit({ id: "q", name: "Nicotine-free", isQuit: true, streak: 0, bestStreak: 12, urgeDates: ["2026-07-24"] }),
      ],
      allDoneToday: true,
    });
    expect(n.kind).toBe("comeback");
    expect(n.text).toContain("12 days");
    expect(n.text).toContain("nicotine-free");
  });

  it("does NOT call it a comeback when the current run already beats history", () => {
    const n = note({
      habits: [habit({ isQuit: true, streak: 20, bestStreak: 12 })],
    });
    expect(n.kind).not.toBe("comeback");
  });

  it("does NOT call day 1 of a brand-new quit a comeback (no history yet)", () => {
    const n = note({
      habits: [habit({ isQuit: true, streak: 0, bestStreak: 0 })],
    });
    expect(n.kind).not.toBe("comeback");
  });

  it("milestone eve: streak+1 lands exactly on a milestone", () => {
    const n = note({ habits: [habit({ streak: 6, bestStreak: 6 })] });
    expect(n.kind).toBe("milestone-eve");
    expect(n.text).toContain("one week");
  });

  it("milestone eve uses the dragon's name when it has one", () => {
    const n = note({ habits: [habit({ streak: 6, petName: "Ember" })] });
    expect(n.text).toContain("Ember");
  });

  it("milestone eve phrases quit habits as clean days", () => {
    const n = note({ habits: [habit({ isQuit: true, streak: 6, bestStreak: 6 })] });
    expect(n.kind).toBe("milestone-eve");
    expect(n.text).toContain("7 days clean");
  });

  it("no anticlimactic milestone eve on a day-0 habit (tomorrow = day 1)", () => {
    // streak 0 → next milestone is day 1, but streak < 2 gate blocks it
    const n = note({ habits: [habit({ streak: 0, daysSinceDone: null, bestStreak: 0, doneToday: false })] });
    expect(n.kind).not.toBe("milestone-eve");
  });

  it("acknowledges an urge survived today", () => {
    const n = note({
      habits: [habit({ isQuit: true, streak: 5, bestStreak: 5, urgeDates: ["2026-07-24"] })],
    });
    expect(n.kind).toBe("urge");
    expect(n.text).toContain("today");
  });

  it("acknowledges an urge survived yesterday", () => {
    const n = note({
      habits: [habit({ isQuit: true, streak: 5, bestStreak: 5, urgeDates: ["2026-07-23"] })],
    });
    expect(n.kind).toBe("urge");
    expect(n.text).toContain("yesterday");
  });

  it("ignores paused habits entirely", () => {
    const n = note({
      habits: [
        habit({ id: "p", isQuit: true, streak: 0, bestStreak: 30, paused: true }),
        habit({ id: "ok", streak: 5, bestStreak: 5 }),
      ],
    });
    expect(n.kind).not.toBe("comeback");
  });
});

describe("buildCoachNote — hard day", () => {
  const rates = (fridayPct: number, fridayTotal: number) => {
    // Friday index 5; make the rest of the week strong so the spread is real.
    const base = { pct: 85, total: 20 };
    const r = Array.from({ length: 7 }, () => ({ ...base }));
    r[5] = { pct: fridayPct, total: fridayTotal };
    return r;
  };

  it("flags today when it's the statistically weakest weekday", () => {
    const n = note({ weekday: 5, dayRates: rates(30, 12) });
    expect(n.kind).toBe("hard-day");
    expect(n.text).toContain("Friday");
  });

  it("stays quiet without a real sample size", () => {
    const n = note({ weekday: 5, dayRates: rates(30, 4) });
    expect(n.kind).not.toBe("hard-day");
  });

  it("stays quiet when the spread is too small to mean anything", () => {
    const n = note({ weekday: 5, dayRates: rates(70, 12) });
    expect(n.kind).not.toBe("hard-day");
  });

  it("never calls it a hard day when everything is already tended", () => {
    const n = note({ weekday: 5, dayRates: rates(30, 12), allDoneToday: true });
    expect(n.kind).not.toBe("hard-day");
  });
});

describe("buildCoachNote — lower rungs", () => {
  it("closes the day gently when everything is tended", () => {
    const n = note({ allDoneToday: true });
    expect(n.kind).toBe("all-done");
  });

  it("names real week-over-week momentum", () => {
    const n = note({ thisWeekPct: 60, lastWeekPct: 40 });
    expect(n.kind).toBe("momentum");
    expect(n.text).toContain("20%");
  });

  it("does not fabricate momentum from an empty last week", () => {
    const n = note({ thisWeekPct: 40, lastWeekPct: 0 });
    expect(n.kind).not.toBe("momentum");
  });

  it("nudges (kindly) about a habit left waiting 3+ days", () => {
    const n = note({ habits: [habit({ streak: 0, doneToday: false, daysSinceDone: 4 })] });
    expect(n.kind).toBe("waiting");
    expect(n.text).toContain("4 days");
    expect(n.text).toContain("No guilt");
  });

  it("falls back to a gentle default", () => {
    const n = note({ habits: [habit({ streak: 1, bestStreak: 1 })] });
    expect(n.kind).toBe("gentle");
    expect(n.text.length).toBeGreaterThan(10);
  });

  it("is deterministic for a given day", () => {
    const a = note();
    const b = note();
    expect(a).toEqual(b);
  });

  it("rotates the gentle default across days", () => {
    const days = ["2026-07-20", "2026-07-21", "2026-07-22", "2026-07-23", "2026-07-24"];
    const texts = new Set(days.map((d) =>
      buildCoachNote(input({ todayStr: d, habits: [habit({ streak: 1, bestStreak: 1 })] }), MILESTONES).text,
    ));
    expect(texts.size).toBeGreaterThan(1);
  });
});
