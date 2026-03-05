"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function BackgroundFX() {
  const { scrollYProgress } = useScroll();
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const auroraY2 = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const [spotlight, setSpotlight] = useState({ x: 50, y: 32 });

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;

    const onMove = (event: MouseEvent) => {
      setSpotlight({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div aria-hidden="true" className="bg-fx-wrap">
      <motion.div style={{ y: auroraY }} className="aurora aurora-one" />
      <motion.div style={{ y: auroraY2 }} className="aurora aurora-two" />
      <motion.div style={{ y: gridY }} className="bg-grid" />
      <div
        className="bg-spotlight"
        style={{
          background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.11), transparent 22%)`,
        }}
      />
      <div className="bg-grain" />
    </div>
  );
}
