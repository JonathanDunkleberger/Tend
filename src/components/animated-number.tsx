"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * AnimatedNumber — a satisfying counter that ROLLS from its old value to its new
 * one whenever it changes (e.g. coins ticking up after a milestone). A small
 * premium micro-interaction: the number counts, and on an increase it gives a
 * brief upward "pop" so a reward feels like it landed.
 *
 * Motion discipline:
 *   • Reduced-motion users get the target value instantly, no tween, no pop.
 *   • The tween is a plain rAF ease-out (no library), cancelled on unmount / on a
 *     new target so rapid changes never stack or leak a frame loop.
 *   • First mount does NOT animate (it shows the initial value) — only real
 *     changes roll, so a page load never spins every counter from zero.
 *
 * Pure presentation over a `value` number — touches no state of its own beyond
 * the display tween.
 */
export function AnimatedNumber({
  value,
  duration = 650,
  format = (n) => Math.round(n).toLocaleString(),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [popping, setPopping] = useState(false);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  // Skip the very first effect run so initial mount doesn't animate from 0.
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    if (reduced) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    if (from === value) return;
    const increased = value > from;
    setPopping(increased);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (value - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
        setDisplay(value);
        if (increased) setTimeout(() => setPopping(false), 200);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      // Land on the target if interrupted, so we never freeze mid-roll.
      fromRef.current = value;
    };
  }, [value, duration, reduced]);

  return (
    <span
      style={{
        display: "inline-block",
        transition: reduced ? "none" : "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        transform: popping ? "translateY(-2px) scale(1.12)" : "none",
      }}
    >
      {format(display)}
    </span>
  );
}
