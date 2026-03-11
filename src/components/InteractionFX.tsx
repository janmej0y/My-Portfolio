"use client";

import { AnimatePresence, motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

export default function InteractionFX() {
  const [enabled, setEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const stuckRectRef = useRef<DOMRect | null>(null);
  const rippleIdRef = useRef(0);
  const lastTouchRef = useRef(0);

  const dotX = useSpring(-100, { stiffness: 920, damping: 48 });
  const dotY = useSpring(-100, { stiffness: 920, damping: 48 });
  const ringX = useSpring(-100, { stiffness: 260, damping: 26 });
  const ringY = useSpring(-100, { stiffness: 260, damping: 26 });
  const glowX = useSpring(-100, { stiffness: 160, damping: 20 });
  const glowY = useSpring(-100, { stiffness: 160, damping: 20 });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!coarse);

    const interactiveSelector = "a, button, [role='button'], .magnetic, [data-magnetic='true'], input, textarea, select";

    const onMove = (event: MouseEvent) => {
      if (coarse) return;

      let targetX = event.clientX;
      let targetY = event.clientY;

      if (stuckRectRef.current) {
        targetX = stuckRectRef.current.left + stuckRectRef.current.width / 2;
        targetY = stuckRectRef.current.top + stuckRectRef.current.height / 2;
      }

      dotX.set(targetX);
      dotY.set(targetY);
      ringX.set(targetX);
      ringY.set(targetY);
      glowX.set(event.clientX);
      glowY.set(event.clientY);
    };

    const onOver = (event: MouseEvent) => {
      if (coarse) return;
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;
      setExpanded(true);
      stuckRectRef.current = target.getBoundingClientRect();
    };

    const onOut = (event: MouseEvent) => {
      if (coarse) return;
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;
      setExpanded(false);
      stuckRectRef.current = null;
    };

    const spawnRipple = (x: number, y: number) => {
      rippleIdRef.current += 1;
      const nextRipple = { id: rippleIdRef.current, x, y, size: 90 + Math.round(Math.random() * 60) };
      setRipples((prev) => [...prev.slice(-4), nextRipple]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== nextRipple.id));
      }, 650);
    };

    const onTouch = (event: TouchEvent) => {
      if (!coarse || !event.touches.length) return;
      const now = Date.now();
      if (now - lastTouchRef.current < 90) return;
      lastTouchRef.current = now;
      const touch = event.touches[0];
      spawnRipple(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [dotX, dotY, ringX, ringY, glowX, glowY]);

  return (
    <>
      {enabled ? (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed z-[138] h-28 w-28 rounded-full bg-cyan-300/12 blur-3xl"
            style={{ x: glowX, y: glowY, translateX: "-50%", translateY: "-50%" }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed z-[140] h-2.5 w-2.5 rounded-full bg-white mix-blend-difference"
            style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed z-[139] rounded-full border border-cyan-200/45 bg-white/[0.02] shadow-[0_0_32px_rgba(34,211,238,0.18)] backdrop-blur-[1px]"
            style={{
              x: ringX,
              y: ringY,
              translateX: "-50%",
              translateY: "-50%",
              width: expanded ? 74 : 34,
              height: expanded ? 74 : 34,
            }}
          />
        </>
      ) : null}

      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            aria-hidden="true"
            initial={{ opacity: 0.65, scale: 0.2 }}
            animate={{ opacity: 0, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed z-[135] rounded-full border border-cyan-200/45 bg-cyan-200/10"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              translateX: "-50%",
              translateY: "-50%",
              boxShadow: "0 0 40px rgba(34,211,238,0.18)",
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
