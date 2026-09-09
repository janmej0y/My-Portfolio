"use client";

import { useCallback, useRef } from "react";

/**
 * Tracks the pointer inside an element and writes its position to CSS vars
 * (`--spot-x` / `--spot-y`) for `.spotlight-card` to read.
 *
 * Writing straight to style rather than through React state keeps this off the
 * render path - a card that re-rendered on every mousemove would stutter.
 * Updates are throttled to one write per frame.
 */
export function useSpotlight<T extends HTMLElement = HTMLElement>() {
  const frame = useRef(0);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    // Coarse pointers fire this on tap; the effect is hover-only, so skip it.
    if (event.pointerType !== "mouse") return;

    const el = event.currentTarget;
    const { clientX, clientY } = event;

    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${((clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--spot-y", `${((clientY - rect.top) / rect.height) * 100}%`);
    });
  }, []);

  const onPointerLeave = useCallback((event: React.PointerEvent<T>) => {
    if (frame.current) {
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    // Recentre so the next hover starts from the middle rather than snapping
    // back from wherever the pointer happened to exit.
    event.currentTarget.style.setProperty("--spot-x", "50%");
    event.currentTarget.style.setProperty("--spot-y", "50%");
  }, []);

  return { onPointerMove, onPointerLeave };
}
