"use client";

import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PointerTrailCanvas from "@/components/PointerTrailCanvas";

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

type ParticleBurst = {
  id: number;
  x: number;
  y: number;
};

export default function InteractionFX() {
  const shouldReduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [cursorLabel, setCursorLabel] = useState("");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particleBursts, setParticleBursts] = useState<ParticleBurst[]>([]);

  const rippleIdRef = useRef(0);
  const burstIdRef = useRef(0);
  const stuckRectRef = useRef<DOMRect | null>(null);

  const dotX = useSpring(-100, { stiffness: 900, damping: 48 });
  const dotY = useSpring(-100, { stiffness: 900, damping: 48 });
  const ringX = useSpring(-100, { stiffness: 280, damping: 26 });
  const ringY = useSpring(-100, { stiffness: 280, damping: 26 });
  const glowX = useSpring(-100, { stiffness: 180, damping: 22 });
  const glowY = useSpring(-100, { stiffness: 180, damping: 22 });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const fine = !coarse;
    setEnabled(fine);

    const interactiveSelector = "a, button, [role='button'], .magnetic, [data-magnetic='true'], input, textarea, select";

    const spawnRipple = (x: number, y: number, size: number) => {
      rippleIdRef.current += 1;
      const next = { id: rippleIdRef.current, x, y, size };
      setRipples((prev) => [...prev.slice(-3), next]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== next.id));
      }, 650);
    };

    const spawnParticleBurst = (x: number, y: number) => {
      if (shouldReduceMotion) return;
      burstIdRef.current += 1;
      const burst = { id: burstIdRef.current, x, y };
      setParticleBursts((prev) => [...prev.slice(-1), burst]);
      window.setTimeout(() => {
        setParticleBursts((prev) => prev.filter((item) => item.id !== burst.id));
      }, 720);
    };

    const onMove = (event: MouseEvent) => {
      let x = event.clientX;
      let y = event.clientY;

      if (stuckRectRef.current) {
        x = stuckRectRef.current.left + stuckRectRef.current.width / 2;
        y = stuckRectRef.current.top + stuckRectRef.current.height / 2;
      }

      dotX.set(x);
      dotY.set(y);
      ringX.set(x);
      ringY.set(y);
      glowX.set(event.clientX);
      glowY.set(event.clientY);
    };

    const onOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;
      setExpanded(true);
      stuckRectRef.current = target.getBoundingClientRect();
      setCursorLabel(target.dataset.cursor ?? (target.tagName === "A" ? "Open" : "Tap"));
    };

    const onOut = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;
      setExpanded(false);
      stuckRectRef.current = null;
      setCursorLabel("");
    };

    // Buttons, links and fields render their own press states, so the ambient
    // ripple would only muddy them. Everything else gets the touch feedback.
    const isInteractive = (target: EventTarget | null) =>
      Boolean((target as HTMLElement | null)?.closest?.(interactiveSelector));

    const onPointerDown = (event: PointerEvent) => {
      if (isInteractive(event.target)) return;
      const touch = event.pointerType === "touch";
      spawnRipple(event.clientX, event.clientY, touch ? 108 : 132);
      spawnParticleBurst(event.clientX, event.clientY);
    };

    if (fine) {
      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseover", onOver, { passive: true });
      document.addEventListener("mouseout", onOut, { passive: true });
    }
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [dotX, dotY, ringX, ringY, glowX, glowY, shouldReduceMotion]);

  return (
    <>
      <PointerTrailCanvas />

      {enabled ? (
        <>
          <motion.div
            aria-hidden="true"
            className="cursor-layer pointer-events-none fixed z-[234] h-24 w-24 rounded-full bg-cyan-300/10 blur-3xl"
            style={{ x: glowX, y: glowY, translateX: "-50%", translateY: "-50%" }}
          />
          <motion.div
            aria-hidden="true"
            className="cursor-layer pointer-events-none fixed z-[235] rounded-full border border-cyan-200/40 bg-white/[0.02] shadow-[0_0_24px_rgba(34,211,238,0.12)] backdrop-blur-[1px]"
            style={{
              x: ringX,
              y: ringY,
              translateX: "-50%",
              translateY: "-50%",
              width: expanded ? 58 : 28,
              height: expanded ? 58 : 28,
            }}
            animate={shouldReduceMotion ? undefined : expanded ? { scale: 1.04 } : { scale: 1 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            aria-hidden="true"
            className="cursor-layer pointer-events-none fixed z-[236] h-2 w-2 rounded-full bg-white"
            style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
          />

          <AnimatePresence>
            {expanded && cursorLabel ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 8 }}
                className="cursor-layer pointer-events-none fixed z-[237] rounded-full border border-cyan-200/30 bg-black/56 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur"
                style={{ x: ringX, y: ringY, translateX: "14px", translateY: "-130%" }}
              >
                {cursorLabel}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}

      <AnimatePresence>
        {ripples.map((ripple) => (
          <div key={ripple.id} className="cursor-layer pointer-events-none fixed inset-0 z-[231]">
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0.84, scale: 0.16 }}
              animate={{ opacity: 0, scale: 1.95 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
              className="absolute rounded-full border border-cyan-200/45"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                translateX: "-50%",
                translateY: "-50%",
                boxShadow: "0 0 36px rgba(34,211,238,0.16)",
              }}
            />
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0.24, scale: 0.12 }}
              animate={{ opacity: 0, scale: 1.24 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute rounded-full bg-cyan-200/14"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size * 0.62,
                height: ripple.size * 0.62,
                translateX: "-50%",
                translateY: "-50%",
              }}
            />
          </div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {particleBursts.map((burst) => (
          <div key={burst.id} className="cursor-layer pointer-events-none fixed inset-0 z-[232]">
            {Array.from({ length: 10 }).map((_, index) => {
              const angle = (Math.PI * 2 * index) / 10;
              const distance = 36 + (index % 3) * 18;
              return (
                <motion.span
                  key={`${burst.id}-${index}`}
                  initial={{ opacity: 0.95, x: 0, y: 0, scale: 0.5 }}
                  animate={{
                    opacity: 0,
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1], delay: index * 0.012 }}
                  className="absolute h-2.5 w-2.5 rounded-full bg-cyan-200/80 shadow-[0_0_18px_rgba(34,211,238,0.5)]"
                  style={{ left: burst.x, top: burst.y, translateX: "-50%", translateY: "-50%" }}
                />
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </>
  );
}
