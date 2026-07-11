/* ═══════════ SOFT CHIME FEEDBACK (sound-optional, OFF by default) ═══════════
 *
 * Gentle, synthesized chimes for the satisfying moments — a daily check-off,
 * a coin, a hatch, an evolution. Everything is generated on the fly with the
 * Web Audio API, so there are NO audio assets to ship and NO network request:
 * the whole feature is a few oscillators + gain envelopes.
 *
 * Design rules (match the brand — warm, never jarring):
 *   • OFF by default. A user opts in from the "You" tab; the choice lives in
 *     localStorage (`tend_sound`) because sound is a per-DEVICE preference, not
 *     account data — no migration, no server round-trip, degrades to silence.
 *   • Low master gain + soft sine/triangle tones + gentle attack/decay so it
 *     feels like a wind-chime, not a game-over buzzer.
 *   • Fully guarded: no window / no AudioContext / autoplay-blocked → silent
 *     no-op, never throws. Safe to call from any tap handler.
 */

const STORAGE_KEY = "tend_sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5; // keep the whole thing gentle
      master.connect(ctx.destination);
    }
    // Browsers suspend the context until a user gesture; our calls all fire
    // from taps, so a resume() here reliably unlocks it.
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One soft note with an attack/decay envelope. */
function note(
  ac: AudioContext,
  freq: number,
  startAt: number,
  dur: number,
  gain: number,
  type: OscillatorType = "sine",
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startAt;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012); // quick soft attack
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // gentle decay
  osc.connect(g);
  g.connect(master ?? ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export type ChimeName = "check" | "coin" | "hatch" | "evolve";

// Warm, pentatonic-ish voicings so any of them can overlap without clashing.
const CHIMES: Record<ChimeName, (ac: AudioContext) => void> = {
  // A soft rising fifth — the everyday "nice, that's done" note.
  check: (ac) => {
    note(ac, 587.33, 0, 0.22, 0.09); // D5
    note(ac, 880.0, 0.05, 0.28, 0.07); // A5
  },
  // A quick bright two-note blip — the classic little reward.
  coin: (ac) => {
    note(ac, 987.77, 0, 0.1, 0.07, "triangle"); // B5
    note(ac, 1318.51, 0.07, 0.12, 0.06, "triangle"); // E6
  },
  // A warm ascending major arpeggio — the egg cracks open.
  hatch: (ac) => {
    note(ac, 523.25, 0.0, 0.5, 0.08); // C5
    note(ac, 659.25, 0.1, 0.5, 0.08); // E5
    note(ac, 783.99, 0.2, 0.55, 0.08); // G5
    note(ac, 1046.5, 0.32, 0.6, 0.09); // C6
  },
  // A brighter, shimmering rise — the dragon grows.
  evolve: (ac) => {
    note(ac, 659.25, 0.0, 0.45, 0.07); // E5
    note(ac, 987.77, 0.1, 0.45, 0.08); // B5
    note(ac, 1174.66, 0.22, 0.55, 0.08); // D6
    note(ac, 1567.98, 0.34, 0.5, 0.06, "triangle"); // G6 shimmer
  },
};

/** True if the user has opted into sound on this device. */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

// Subscribers for useSyncExternalStore — lets the toggle UI reflect the
// localStorage-backed preference with no setState-in-effect / hydration mismatch.
const listeners = new Set<() => void>();
/** Subscribe to sound-preference changes (for useSyncExternalStore). */
export function subscribeSound(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
/** Server snapshot for useSyncExternalStore — always off before hydration. */
export function soundServerSnapshot(): boolean {
  return false;
}

/** Persist the device-local sound preference. */
export function setSoundEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* private mode / storage disabled → silently stay off */
  }
  listeners.forEach((l) => l());
}

/**
 * Play a chime if sound is enabled. Silent no-op otherwise (disabled, no
 * AudioContext, autoplay-blocked). Never throws — safe in any tap handler.
 */
export function playChime(name: ChimeName) {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    CHIMES[name](ac);
  } catch {
    /* ignore — audio is a nicety, never a failure path */
  }
}
