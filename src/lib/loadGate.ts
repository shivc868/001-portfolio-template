"use client";

/**
 * Tiny gate the Preloader resolves so the hero timeline can start
 * while the ink panel is still clearing (§6 preloader spec).
 */
let done = false;
const listeners = new Set<() => void>();

export function markPreloaderDone(): void {
  done = true;
  listeners.forEach((l) => l());
  listeners.clear();
  // First load has no curtain — the preloader clearing *is* the reveal.
  markPageRevealed();
}

export function onPreloaderDone(cb: () => void): () => void {
  if (done) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Page-reveal gate: resolves when a page's entrance is actually on screen —
 * after the preloader on first load, and after the transition curtain clears
 * on every client navigation. An entrance gated on this can't play unseen
 * behind the curtain, which is where mount-time timelines would otherwise run.
 */
let revealed = false;
const revealListeners = new Set<() => void>();

export function markPageRevealed(): void {
  revealed = true;
  revealListeners.forEach((l) => l());
  revealListeners.clear();
}

/** Called as a curtain navigation starts, so the incoming page waits again. */
export function resetPageReveal(): void {
  revealed = false;
}

export function onPageReveal(cb: () => void): () => void {
  if (revealed) {
    cb();
    return () => {};
  }
  revealListeners.add(cb);
  return () => revealListeners.delete(cb);
}
