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
import { useEffect, useState } from "react";

export default function BackgroundFX() {
  const shouldReduceMotion = useReducedMotion();
  const [leanMode, setLeanMode] = useState(false);
  const { scrollYProgress } = useScroll();
  const gridY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion || leanMode ? -18 : -80]);
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion || leanMode ? 0 : 52]);
  const auroraY2 = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion || leanMode ? 0 : -44]);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(32);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 18, mass: 0.2 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 18, mass: 0.2 });
  const spotlightBackground = useMotionTemplate`radial-gradient(circle at ${smoothX}% ${smoothY}%, rgba(255,255,255,0.11), transparent 22%)`;

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const syncLeanMode = () => setLeanMode(isCoarse || window.innerWidth < 1024);
    syncLeanMode();
    window.addEventListener("resize", syncLeanMode);

    return () => window.removeEventListener("resize", syncLeanMode);
  }, []);

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const isSmallViewport = window.innerWidth < 1024;
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
      {!leanMode ? (
        <>
          <motion.div style={{ y: auroraY }} className="aurora aurora-one" />
          <motion.div style={{ y: auroraY2 }} className="aurora aurora-two" />
        </>
      ) : null}
      <motion.div style={{ y: gridY }} className="bg-grid" />
      {!leanMode ? (
        <motion.div
          className="bg-spotlight"
          style={{ background: shouldReduceMotion ? undefined : spotlightBackground }}
        />
      ) : null}
      {!leanMode ? <div className="bg-grain" /> : null}
    </div>
  );
}
