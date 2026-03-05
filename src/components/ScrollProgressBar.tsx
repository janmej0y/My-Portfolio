"use client";

import { motion } from "framer-motion";
import { useScrollProgress } from "@/hooks/useScrollProgress";

export default function ScrollProgressBar() {
  const { progress } = useScrollProgress();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-1 bg-transparent">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400"
        style={{ scaleX: progress }}
      />
    </div>
  );
}
