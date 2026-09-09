"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/\\<>*+=$@";

type ScrambleTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  /** Milliseconds between frames. Lower is faster, noisier. */
  frameMs?: number;
  /** Frames each character scrambles before locking in. */
  lockAfter?: number;
  once?: boolean;
};

/**
 * Resolves text out of random glyphs when it scrolls into view.
 *
 * Characters lock left-to-right, so the word decodes rather than settling all
 * at once. Whitespace is never scrambled - shuffling it collapses the layout
 * mid-animation and the heading visibly jumps.
 */
export default function ScrambleText({
  text,
  as: Tag = "span",
  className,
  frameMs = 45,
  lockAfter = 3,
  once = true,
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once, amount: 0.5 });
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion, or not yet on screen: show the real text, run nothing.
    if (reduceMotion || !inView) {
      setDisplay(text);
      return;
    }

    const chars = Array.from(text);
    frameRef.current = 0;

    const tick = () => {
      const frame = frameRef.current;
      const next = chars
        .map((char, index) => {
          if (char === " ") return " ";
          // Each index needs `lockAfter` frames more than the one before it.
          if (frame >= (index + 1) * lockAfter) return char;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setDisplay(next);
      frameRef.current += 1;

      if (frame >= chars.length * lockAfter) {
        setDisplay(text);
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    timerRef.current = window.setInterval(tick, frameMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [text, inView, reduceMotion, frameMs, lockAfter]);

  return (
    <Tag ref={ref as never} className={className}>
      {/* The scrambling glyphs are decorative; assistive tech gets the real text. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
