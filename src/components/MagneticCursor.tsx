"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const stuckRectRef = useRef<DOMRect | null>(null);

  const dotX = useSpring(-100, { stiffness: 900, damping: 52 });
  const dotY = useSpring(-100, { stiffness: 900, damping: 52 });
  const ringX = useSpring(-100, { stiffness: 260, damping: 26 });
  const ringY = useSpring(-100, { stiffness: 260, damping: 26 });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!coarse);
    if (coarse) return;

    const interactiveSelector = "a, button, [role='button'], .magnetic, [data-magnetic='true']";

    const onMove = (event: MouseEvent) => {
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
    };

    const onOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;
      setExpanded(true);
      stuckRectRef.current = target.getBoundingClientRect();
    };

    const onOut = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(interactiveSelector);
      if (!target) return;
      setExpanded(false);
      stuckRectRef.current = null;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [dotX, dotY, ringX, ringY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed z-[140] h-2.5 w-2.5 rounded-full bg-white mix-blend-difference"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed z-[139] rounded-full border border-white/40 bg-white/[0.03] backdrop-blur-[1px]"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: expanded ? 68 : 34,
          height: expanded ? 68 : 34,
        }}
      />
    </>
  );
}
