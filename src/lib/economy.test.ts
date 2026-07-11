import { describe, it, expect } from "vitest";
import {
  clampCoinDelta,
  clampCoinTotal,
  applyCoinDelta,
  MAX_COIN_DELTA,
  MIN_COIN_DELTA,
  MAX_COIN_TOTAL,
} from "./economy";

// The coin-economy clamps. The regression these lock: the delta clamp used to cap
// at +100, silently truncating the 60-day (+200) and 90-day (+500) milestone
// rewards so users lost coins on reload (shift 14). The bound must stay above the
// largest legitimate single grant.

describe("clampCoinDelta", () => {
  it("passes small everyday grants through untouched", () => {
    expect(clampCoinDelta(5)).toBe(5);
    expect(clampCoinDelta(10)).toBe(10);
    expect(clampCoinDelta(0)).toBe(0);
  });

  it("does NOT truncate the 60-day milestone reward (+200)", () => {
    expect(clampCoinDelta(200)).toBe(200);
  });

  it("does NOT truncate the 90-day milestone reward (+500)", () => {
    expect(clampCoinDelta(500)).toBe(500);
  });

  it("does NOT truncate a first-load sweep of all build milestones (~901)", () => {
    // 1+5+15+30+50+100+200+500 = 901 — all crossed at once when a long-standing
    // streak is first computed. Must survive intact.
    expect(clampCoinDelta(901)).toBe(901);
  });

  it("caps absurd positive deltas at MAX_COIN_DELTA", () => {
    expect(clampCoinDelta(99999)).toBe(MAX_COIN_DELTA);
    expect(clampCoinDelta(MAX_COIN_DELTA + 1)).toBe(MAX_COIN_DELTA);
  });

  it("passes the grace-token spend (−50) through", () => {
    expect(clampCoinDelta(-50)).toBe(-50);
  });

  it("floors extreme negative deltas at MIN_COIN_DELTA", () => {
    expect(clampCoinDelta(-99999)).toBe(MIN_COIN_DELTA);
    expect(clampCoinDelta(MIN_COIN_DELTA - 1)).toBe(MIN_COIN_DELTA);
  });
});

describe("clampCoinTotal", () => {
  it("passes normal balances through", () => {
    expect(clampCoinTotal(250)).toBe(250);
    expect(clampCoinTotal(0)).toBe(0);
  });

  it("never goes negative", () => {
    expect(clampCoinTotal(-1)).toBe(0);
    expect(clampCoinTotal(-9999)).toBe(0);
  });

  it("caps at MAX_COIN_TOTAL", () => {
    expect(clampCoinTotal(MAX_COIN_TOTAL + 1)).toBe(MAX_COIN_TOTAL);
    expect(clampCoinTotal(999999)).toBe(MAX_COIN_TOTAL);
  });
});

describe("applyCoinDelta", () => {
  it("adds a clamped delta to the current balance", () => {
    expect(applyCoinDelta(250, 10)).toBe(260);
    expect(applyCoinDelta(300, -50)).toBe(250);
  });

  it("credits the FULL 90-day milestone (250 -> 750), no truncation", () => {
    expect(applyCoinDelta(250, 500)).toBe(750);
  });

  it("floors the resulting balance at 0 (can't go negative)", () => {
    expect(applyCoinDelta(30, -50)).toBe(0);
    expect(applyCoinDelta(0, -500)).toBe(0);
  });

  it("still clamps the delta before applying it", () => {
    // A malicious +99999 is clamped to the max grant, not applied whole.
    expect(applyCoinDelta(0, 99999)).toBe(MAX_COIN_DELTA);
  });
});
