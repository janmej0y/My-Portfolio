"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const mouseX = useSpring(-100, { stiffness: 700, damping: 45 });
  const mouseY = useSpring(-100, { stiffness: 700, damping: 45 });
  const ringX = useSpring(-100, { stiffness: 250, damping: 28 });
  const ringY = useSpring(-100, { stiffness: 250, damping: 28 });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!coarse);
    if (coarse) return;

    const move = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      ringX.set(event.clientX);
      ringY.set(event.clientY);
    };

    const hoverSelector = "a, button, [role='button'], input, textarea, .magnetic";

    const setHoverEvents = () => {
      const items = document.querySelectorAll<HTMLElement>(hoverSelector);
      items.forEach((item) => {
        item.addEventListener("mouseenter", () => setIsHovering(true));
        item.addEventListener("mouseleave", () => setIsHovering(false));
      });
    };

    setHoverEvents();
    window.addEventListener("mousemove", move, { passive: true });

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, [mouseX, mouseY, ringX, ringY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-[120] h-2.5 w-2.5 rounded-full bg-white mix-blend-difference"
        style={{ x: mouseX, y: mouseY, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="pointer-events-none fixed z-[119] rounded-full border border-white/45"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: isHovering ? 62 : 34,
          height: isHovering ? 62 : 34,
        }}
      />
    </>
  );
}
