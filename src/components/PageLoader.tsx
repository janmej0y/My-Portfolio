"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          className="pointer-events-none fixed inset-0 z-[160] overflow-hidden bg-[#02040a]"
        >
          <motion.div
            aria-hidden="true"
            initial={{ scale: 0.9, opacity: 0.3 }}
            animate={{ scale: 1.3, opacity: [0.28, 0.52, 0.18] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/14 blur-3xl"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.02),transparent_25%,rgba(34,211,238,0.08)_50%,transparent_75%,rgba(255,255,255,0.02))]" />
          <div className="relative flex h-full items-center justify-center">
            <div className="text-center">
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs uppercase tracking-[0.5em] text-cyan-100/70"
              >
                Initializing
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="mt-4 font-display text-4xl font-semibold tracking-[0.18em] text-white sm:text-6xl"
              >
                JANMEJOY
              </motion.h1>
              <div className="mt-6 flex items-center justify-center gap-2">
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    animate={{ y: [0, -12, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.12 }}
                    className="h-2.5 w-2.5 rounded-full bg-cyan-200"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
