"use client";

import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

type CursorTrail = {
  id: number;
  x: number;
  y: number;
};

type ParticleBurst = {
  id: number;
  x: number;
  y: number;
};

type TouchPoint = {
  visible: boolean;
  x: number;
  y: number;
};

type ActiveTouch = {
  startX: number;
  startY: number;
  moved: boolean;
};

export default function InteractionFX() {
  const shouldReduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [cursorLabel, setCursorLabel] = useState("");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [cursorTrail, setCursorTrail] = useState<CursorTrail[]>([]);
  const [particleBursts, setParticleBursts] = useState<ParticleBurst[]>([]);
  const [touchPoint, setTouchPoint] = useState<TouchPoint>({ visible: false, x: -100, y: -100 });

  const rippleIdRef = useRef(0);
  const cursorTrailIdRef = useRef(0);
  const burstIdRef = useRef(0);
  const touchHideTimerRef = useRef<number | null>(null);
  const lastTrailRef = useRef(0);
  const stuckRectRef = useRef<DOMRect | null>(null);
  const activeTouchRef = useRef<ActiveTouch | null>(null);

  const dotX = useSpring(-100, { stiffness: 900, damping: 48 });
  const dotY = useSpring(-100, { stiffness: 900, damping: 48 });
  const ringX = useSpring(-100, { stiffness: 280, damping: 26 });
  const ringY = useSpring(-100, { stiffness: 280, damping: 26 });
  const glowX = useSpring(-100, { stiffness: 180, damping: 22 });
  const glowY = useSpring(-100, { stiffness: 180, damping: 22 });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!coarse);

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
      if (coarse) return;

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

      if (shouldReduceMotion || expanded) return;
      const now = Date.now();
      if (now - lastTrailRef.current < 36) return;
      lastTrailRef.current = now;
      cursorTrailIdRef.current += 1;
      const nextTrail = { id: cursorTrailIdRef.current, x: event.clientX, y: event.clientY };
      setCursorTrail((prev) => [...prev.slice(-5), nextTrail]);
      window.setTimeout(() => {
        setCursorTrail((prev) => prev.filter((item) => item.id !== nextTrail.id));
      }, 260);
    };

    const onOver = (event: MouseEvent) => {
      if (coarse) return;
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;
      setExpanded(true);
      stuckRectRef.current = target.getBoundingClientRect();
      setCursorLabel(target.dataset.cursor ?? (target.tagName === "A" ? "Open" : "Tap"));
    };

    const onOut = (event: MouseEvent) => {
      if (coarse) return;
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;
      setExpanded(false);
      stuckRectRef.current = null;
      setCursorLabel("");
    };

    const showTouchPoint = (x: number, y: number, duration = 180) => {
      setTouchPoint({ visible: true, x, y });
      if (touchHideTimerRef.current) window.clearTimeout(touchHideTimerRef.current);
      touchHideTimerRef.current = window.setTimeout(() => {
        setTouchPoint((prev) => ({ ...prev, visible: false }));
      }, duration);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (coarse || event.pointerType === "touch") return;
      spawnRipple(event.clientX, event.clientY, 132);
      spawnParticleBurst(event.clientX, event.clientY);
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      activeTouchRef.current = { startX: touch.clientX, startY: touch.clientY, moved: false };
      showTouchPoint(touch.clientX, touch.clientY, 240);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const activeTouch = activeTouchRef.current;
      if (activeTouch) {
        const distance = Math.hypot(touch.clientX - activeTouch.startX, touch.clientY - activeTouch.startY);
        if (distance > 10) activeTouch.moved = true;
      }

      showTouchPoint(touch.clientX, touch.clientY, 120);

      if (shouldReduceMotion) return;
      const now = Date.now();
      if (now - lastTrailRef.current < 42) return;
      lastTrailRef.current = now;
      cursorTrailIdRef.current += 1;
      const nextTrail = { id: cursorTrailIdRef.current, x: touch.clientX, y: touch.clientY };
      setCursorTrail((prev) => [...prev.slice(-4), nextTrail]);
      window.setTimeout(() => {
        setCursorTrail((prev) => prev.filter((item) => item.id !== nextTrail.id));
      }, 220);
    };

    const onTouchEnd = (event: TouchEvent) => {
      const activeTouch = activeTouchRef.current;
      const touch = event.changedTouches[0];
      if (!touch || !activeTouch) {
        activeTouchRef.current = null;
        return;
      }

      if (!activeTouch.moved) {
        spawnRipple(touch.clientX, touch.clientY, 144);
        spawnParticleBurst(touch.clientX, touch.clientY);
        showTouchPoint(touch.clientX, touch.clientY, 200);
      } else {
        showTouchPoint(touch.clientX, touch.clientY, 90);
      }

      activeTouchRef.current = null;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (touchHideTimerRef.current) window.clearTimeout(touchHideTimerRef.current);
    };
  }, [dotX, dotY, ringX, ringY, glowX, glowY, expanded, shouldReduceMotion]);

  return (
    <>
      <AnimatePresence>
        {cursorTrail.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: enabled ? 0.2 : 0.18, scale: enabled ? 0.55 : 0.72 }}
            animate={{ opacity: enabled ? 0.06 : 0.1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-none fixed rounded-full blur-[3px] ${
              enabled ? "z-[137] h-4 w-4 bg-cyan-200/22" : "z-[134] h-5 w-5 bg-cyan-300/20"
            }`}
            style={{ left: item.x, top: item.y, translateX: "-50%", translateY: "-50%" }}
          />
        ))}
      </AnimatePresence>

      {enabled ? (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed z-[138] h-24 w-24 rounded-full bg-cyan-300/10 blur-3xl"
            style={{ x: glowX, y: glowY, translateX: "-50%", translateY: "-50%" }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed z-[139] rounded-full border border-cyan-200/40 bg-white/[0.02] shadow-[0_0_24px_rgba(34,211,238,0.12)] backdrop-blur-[1px]"
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
            className="pointer-events-none fixed z-[140] h-2 w-2 rounded-full bg-white"
            style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
          />

          <AnimatePresence>
            {expanded && cursorLabel ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 8 }}
                className="pointer-events-none fixed z-[141] rounded-full border border-cyan-200/30 bg-black/56 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur"
                style={{ x: ringX, y: ringY, translateX: "14px", translateY: "-130%" }}
              >
                {cursorLabel}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}

      <AnimatePresence>
        {touchPoint.visible ? (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="pointer-events-none fixed z-[138] h-16 w-16 rounded-full bg-cyan-300/18 blur-2xl"
              style={{ left: touchPoint.x, top: touchPoint.y, translateX: "-50%", translateY: "-50%" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="pointer-events-none fixed z-[139] h-8 w-8 rounded-full border border-cyan-100/55 bg-white/8"
              style={{ left: touchPoint.x, top: touchPoint.y, translateX: "-50%", translateY: "-50%" }}
            />
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {ripples.map((ripple) => (
          <div key={ripple.id} className="pointer-events-none fixed inset-0 z-[135]">
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
          <div key={burst.id} className="pointer-events-none fixed inset-0 z-[136]">
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
