import { describe, it, expect } from "vitest";
import {
  suggestElementForHabit,
  suggestSpeciesForHabit,
  getDragonSpecies,
  DRAGON_SPECIES,
} from "./sprites";

// The species-by-habit-type mapping: a new habit hatches a dragon whose element
// fits what the habit IS (fire for a workout, water for hydration, …) so the
// collection you grow is meaningful, not random. Pure + deterministic → locked here.

describe("suggestElementForHabit", () => {
  it("maps fitness habits to fire", () => {
    expect(suggestElementForHabit("Morning run", "build")).toBe("fire");
    expect(suggestElementForHabit("Go to the gym", "build")).toBe("fire");
    expect(suggestElementForHabit("Lift weights", "build")).toBe("fire");
    expect(suggestElementForHabit("Daily workout", "general")).toBe("fire");
  });

  it("maps hydration / cleanliness habits to water", () => {
    expect(suggestElementForHabit("Drink water", "build")).toBe("water");
    expect(suggestElementForHabit("Skincare routine", "build")).toBe("water");
    expect(suggestElementForHabit("Floss", "build")).toBe("water");
  });

  it("maps focused-work habits to storm", () => {
    expect(suggestElementForHabit("Deep work block", "build")).toBe("storm");
    expect(suggestElementForHabit("Practice piano", "build")).toBe("storm");
    expect(suggestElementForHabit("Study for exam", "build")).toBe("storm");
  });

  it("maps learning / creative habits to cosmic", () => {
    expect(suggestElementForHabit("Read 10 pages", "build")).toBe("cosmic");
    expect(suggestElementForHabit("Draw something", "build")).toBe("cosmic");
    expect(suggestElementForHabit("Journal", "build")).toBe("cosmic");
  });

  it("maps calm / mindfulness / sleep habits to light", () => {
    expect(suggestElementForHabit("Meditate", "build")).toBe("light");
    expect(suggestElementForHabit("Sleep by 11", "build")).toBe("light");
    expect(suggestElementForHabit("Morning gratitude", "build")).toBe("light");
    expect(suggestElementForHabit("Yoga", "build")).toBe("light");
  });

  it("maps outdoors / nutrition habits to nature", () => {
    expect(suggestElementForHabit("Walk the dog", "build")).toBe("nature");
    expect(suggestElementForHabit("Eat vegetables", "build")).toBe("nature");
    expect(suggestElementForHabit("Water the garden", "build")).toBe("water"); // "water" wins by priority order
    expect(suggestElementForHabit("Cook a meal", "build")).toBe("nature");
  });

  it("defaults an unmatched build/general habit to nature (the growth metaphor)", () => {
    expect(suggestElementForHabit("Call my mum", "build")).toBe("nature");
    expect(suggestElementForHabit("", "general")).toBe("nature");
  });

  it("defaults an unmatched quit habit to shadow (the loop you're taming)", () => {
    expect(suggestElementForHabit("No smoking", "quit")).toBe("shadow");
    expect(suggestElementForHabit("Quit vaping", "quit")).toBe("shadow");
    expect(suggestElementForHabit("Stop late-night snacking", "quit")).toBe("shadow");
  });

  it("lets a keyword override the quit-category default", () => {
    // a quit habit explicitly about sleep still reads as light
    expect(suggestElementForHabit("No phone before bed", "quit")).toBe("light");
  });

  it("is case-insensitive", () => {
    expect(suggestElementForHabit("MORNING RUN", "build")).toBe("fire");
    expect(suggestElementForHabit("Drink Water", "build")).toBe("water");
  });
});

describe("suggestSpeciesForHabit", () => {
  it("returns a valid species id in 1..36", () => {
    for (const name of ["Morning run", "Drink water", "Meditate", "No smoking", "", "Read"]) {
      const id = suggestSpeciesForHabit(name, "build");
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(36);
    }
  });

  it("picks a species whose element matches the suggested element", () => {
    const cases: [string, string][] = [
      ["Morning run", "fire"],
      ["Drink water", "water"],
      ["Meditate", "light"],
      ["Read a book", "cosmic"],
      ["Deep work", "storm"],
      ["Walk outside", "nature"],
    ];
    for (const [name, element] of cases) {
      const species = getDragonSpecies(suggestSpeciesForHabit(name, "build"));
      expect(species.element).toBe(element);
    }
  });

  it("gives quit habits a shadow dragon by default", () => {
    expect(getDragonSpecies(suggestSpeciesForHabit("Quit smoking", "quit")).element).toBe("shadow");
  });

  it("is deterministic — same name+category always yields the same dragon", () => {
    expect(suggestSpeciesForHabit("Morning run", "build")).toBe(suggestSpeciesForHabit("Morning run", "build"));
    expect(suggestSpeciesForHabit("Read 10 pages", "build")).toBe(suggestSpeciesForHabit("Read 10 pages", "build"));
  });

  it("varies across different habits of the same element", () => {
    // several distinct fitness habits shouldn't all collapse to one species
    const fireHabits = ["Morning run", "Gym session", "Lift weights", "Sprint intervals", "Boxing"];
    const ids = new Set(fireHabits.map((h) => suggestSpeciesForHabit(h, "build")));
    // all land on fire, but not all identical
    fireHabits.forEach((h) => expect(getDragonSpecies(suggestSpeciesForHabit(h, "build")).element).toBe("fire"));
    expect(ids.size).toBeGreaterThan(1);
  });

  it("only ever returns ids that exist in the species table", () => {
    const valid = new Set(DRAGON_SPECIES.map((d) => d.id));
    expect(valid.has(suggestSpeciesForHabit("Anything", "build"))).toBe(true);
  });
});
