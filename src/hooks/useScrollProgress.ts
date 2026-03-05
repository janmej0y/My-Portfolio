"use client";

import { useScroll, useSpring } from "framer-motion";

export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    mass: 0.24,
  });

  return { progress, scrollYProgress };
}
