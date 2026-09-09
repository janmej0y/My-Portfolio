"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import ParticleMark from "@/components/ParticleMark";

/**
 * Entrance sequence.
 *
 * Particles converge from offscreen into a "J", the mark holds while a hairline
 * counter fills, then the letterform bursts outward and the panel lifts to
 * reveal the page. Timings are one timeline so the phases cannot drift apart.
 */
const T = {
  /** Particles fly in. */
  converge: 1500,
  /** Mark holds, wordmark and counter resolve. */
  hold: 900,
  /** Letterform explodes. */
  burst: 620,
  /** Curtain lifts. */
  exit: 780,
} as const;

const CONVERGE_END = T.converge;
const BURST_START = CONVERGE_END + T.hold;
const EXIT_START = BURST_START + T.burst;
const TOTAL = EXIT_START + T.exit;

const EASE = [0.76, 0, 0.24, 1] as const;

export default function PageLoader() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(true);
  const [percent, setPercent] = useState(0);
  const [settled, setSettled] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const rafRef = useRef(0);
  // Uniform drivers live in refs: the GL loop reads them every frame, so
  // putting them in state would re-render React ~60x/sec for no benefit.
  const progressRef = useRef(0);
  const burstRef = useRef(0);

  const onUnsupported = useCallback(() => setWebglFailed(true), []);

  useEffect(() => {
    document.documentElement.classList.add("portfolio-intro-active");
    document.body.classList.add("portfolio-intro-active");

    const release = () => {
      document.documentElement.classList.remove("portfolio-intro-active");
      document.body.classList.remove("portfolio-intro-active");
    };

    // Reduced motion: no flight, no burst - show the mark briefly and leave.
    if (reduceMotion) {
      progressRef.current = 1;
      setSettled(true);
      setPercent(100);
      const timer = window.setTimeout(() => {
        release();
        setMounted(false);
      }, 900);
      return () => {
        window.clearTimeout(timer);
        release();
      };
    }

    const start = performance.now();

    let lastPercent = -1;

    const tick = (now: number) => {
      const elapsed = now - start;

      // Converge 0 -> 1, then hold at 1. Ref only: no re-render.
      const next = Math.min(1, elapsed / T.converge);
      progressRef.current = next;
      if (next >= 0.999) setSettled(true);

      // Counter is text, so it does need state - but only when it changes.
      const pct = Math.min(100, Math.round((elapsed / CONVERGE_END) * 100));
      if (pct !== lastPercent) {
        lastPercent = pct;
        setPercent(pct);
      }

      if (elapsed >= BURST_START) {
        burstRef.current = Math.min(1, (elapsed - BURST_START) / T.burst);
      }

      if (elapsed >= TOTAL) {
        release();
        setMounted(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      release();
    };
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {mounted ? (
        <motion.div
          role="status"
          aria-label="Loading Janmejoy's portfolio"
          className="portfolio-loader fixed inset-0 z-[220] overflow-hidden bg-black"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: T.exit / 1000, ease: EASE }}
        >
          {/* Ground: a single deep radial so the particles have something to
              sit against without competing with them. */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(34,211,238,0.10),transparent_46%),linear-gradient(160deg,#020617,#000_62%)]" />

          {/* The mark itself. */}
          <div className="absolute inset-0">
            {webglFailed ? (
              // No WebGL: fall back to a plain typographic mark rather than
              // leaving an empty screen.
              <div className="grid h-full place-items-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="loader-fallback-mark font-display"
                >
                  J
                </motion.span>
              </div>
            ) : (
              <ParticleMark glyph="J" progressRef={progressRef} burstRef={burstRef} onUnsupported={onUnsupported} />
            )}
          </div>

          {/* Wordmark resolves only once the letterform is complete. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 top-auto flex flex-col items-center gap-5 px-6 pb-14 sm:pb-16">
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "110%" }}
                animate={settled ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.7, ease: EASE }}
                className="loader-wordmark font-display"
              >
                JANMEJOY MAHATO
              </motion.p>
            </div>

            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "110%" }}
                animate={settled ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
                className="loader-subtitle"
              >
                Full Stack Developer · Cybersecurity
              </motion.p>
            </div>

            {/* Progress hairline with a live count. */}
            <div className="mt-2 flex w-full max-w-[220px] items-center gap-3">
              <span className="loader-track relative h-px flex-1">
                <motion.span
                  className="loader-track-fill absolute inset-y-0 left-0 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: percent / 100 }}
                  transition={{ duration: 0.2, ease: "linear" }}
                />
              </span>
              <span className="loader-count font-display tabular-nums">
                {String(percent).padStart(3, "0")}
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
