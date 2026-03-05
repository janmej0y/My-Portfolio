"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

const SCREAM_MS = 3000;
const MOVABLE_MS = 3000;
const BUBBLE_MS = 2200;

export default function ScreamFigure() {
  const [isScreaming, setIsScreaming] = useState(false);
  const [isMovable, setIsMovable] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screamTimerRef = useRef<number | null>(null);
  const movableTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);

  const stopScream = () => {
    if (screamTimerRef.current) {
      window.clearTimeout(screamTimerRef.current);
      screamTimerRef.current = null;
    }
    setIsScreaming(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      stopScream();
      if (movableTimerRef.current) window.clearTimeout(movableTimerRef.current);
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const triggerTouchEffects = () => {
    setIsMovable(true);
    setShowBubble(true);

    if (movableTimerRef.current) window.clearTimeout(movableTimerRef.current);
    if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);

    movableTimerRef.current = window.setTimeout(() => {
      setIsMovable(false);
    }, MOVABLE_MS);
    bubbleTimerRef.current = window.setTimeout(() => {
      setShowBubble(false);
    }, BUBBLE_MS);
  };

  const onClick = () => {
    triggerTouchEffects();
    if (!isScreaming) {
      setIsScreaming(true);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => null);
      }

      screamTimerRef.current = window.setTimeout(() => {
        stopScream();
      }, SCREAM_MS);
    }
  };

  return (
    <div className="relative w-fit">
      <audio ref={audioRef} preload="auto" src="/assets/scream.mp3" />
      {showBubble ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: DURATIONS.fast, ease: EASE_STANDARD }}
          className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/25 bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-white/90"
        >
          Don&apos;t hit me, it&apos;s hurting!
        </motion.div>
      ) : null}
      <motion.button
        type="button"
        onClick={onClick}
        onPointerDown={triggerTouchEffects}
        drag={isMovable}
        dragMomentum={false}
        aria-label="Trigger scream animation"
        aria-disabled={isScreaming}
        animate={
          isScreaming
            ? {
                x: [0, -14, 11, -17, 9, -12, 0],
                y: [0, 10, -9, 14, -13, 8, 0],
                rotate: [0, 22, -18, 28, -24, 12, 0],
              }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={
          isScreaming
            ? { duration: 0.32, repeat: Infinity, ease: "linear" }
            : { duration: DURATIONS.base, ease: EASE_STANDARD }
        }
        className="h-20 w-20 touch-none rounded-2xl border border-white/20 bg-black/55 p-2 backdrop-blur-xl md:h-24 md:w-24"
      >
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
          <circle cx="60" cy="24" r="11" fill="#fff" />
          <path d="M60 36 L60 78" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <path d="M60 46 L33 62" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <path d="M60 46 L87 62" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <path d="M60 78 L40 106" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <path d="M60 78 L80 106" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <circle cx="56" cy="22" r="1.3" fill="#000" />
          <circle cx="64" cy="22" r="1.3" fill="#000" />
          <ellipse cx="60" cy="28.2" rx="3.5" ry="2.2" fill="#000" />
        </svg>
      </motion.button>
    </div>
  );
}
