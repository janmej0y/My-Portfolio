"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

export default function BackgroundFX() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const gridY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? -24 : -120]);
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 18 : 80]);
  const auroraY2 = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? -16 : -60]);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(32);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 18, mass: 0.2 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 18, mass: 0.2 });
  const spotlightBackground = useMotionTemplate`radial-gradient(circle at ${smoothX}% ${smoothY}%, rgba(255,255,255,0.11), transparent 22%)`;

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const isSmallViewport = window.innerWidth < 768;
    if (isCoarse || isSmallViewport || shouldReduceMotion) return;

    const onMove = (event: MouseEvent) => {
      pointerX.set((event.clientX / window.innerWidth) * 100);
      pointerY.set((event.clientY / window.innerHeight) * 100);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [pointerX, pointerY, shouldReduceMotion]);

  return (
    <div aria-hidden="true" className="bg-fx-wrap">
      <motion.div style={{ y: auroraY }} className="aurora aurora-one" />
      <motion.div style={{ y: auroraY2 }} className="aurora aurora-two" />
      <motion.div style={{ y: gridY }} className="bg-grid" />
      <motion.div
        className="bg-spotlight"
        style={{ background: shouldReduceMotion ? undefined : spotlightBackground }}
      />
      <div className="bg-grain" />
    </div>
  );
}
