"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type ThemePreset = "dark" | "bright" | "cyber";

export default function ThemeTransition() {
  const [preset, setPreset] = useState<ThemePreset>("dark");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onThemeTransition = (event: Event) => {
      const customEvent = event as CustomEvent<{ preset: ThemePreset }>;
      setPreset(customEvent.detail?.preset ?? "dark");
      setVisible(true);
      window.setTimeout(() => setVisible(false), 760);
    };

    window.addEventListener("portfolio-theme-transition", onThemeTransition as EventListener);
    return () => window.removeEventListener("portfolio-theme-transition", onThemeTransition as EventListener);
  }, []);

  const tone =
    preset === "bright"
      ? "from-sky-100/85 via-cyan-200/45 to-white/10"
      : preset === "cyber"
        ? "from-cyan-300/70 via-sky-400/30 to-transparent"
        : "from-fuchsia-500/40 via-cyan-400/18 to-transparent";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none fixed inset-0 z-[170] overflow-hidden"
        >
          <motion.div
            initial={{ clipPath: "circle(0% at 50% 50%)", opacity: 0.92 }}
            animate={{ clipPath: "circle(120% at 50% 50%)", opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-0 bg-gradient-to-br ${tone}`}
          />
          <motion.div
            initial={{ scale: 0.25, opacity: 0.85 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
