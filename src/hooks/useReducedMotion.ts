"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Detects if the user prefers reduced motion via OS accessibility settings.
 * Returns true if `prefers-reduced-motion: reduce` is active.
 *
 * Uses useSyncExternalStore so it stays in sync with the media query without
 * a setState-in-effect (SSR-safe: server snapshot is always false).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
