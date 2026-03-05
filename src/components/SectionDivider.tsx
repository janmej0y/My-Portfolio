"use client";

import { motion } from "framer-motion";
import { DURATIONS, EASE_SMOOTH } from "@/lib/motion";

export default function SectionDivider() {
  return (
    <div className="relative mx-auto my-14 h-20 w-full max-w-6xl px-6">
      <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
      <div className="absolute inset-x-10 top-1/2 h-14 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16)_0%,rgba(34,211,238,0)_68%)]" />
      <motion.span
        className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
        initial={{ left: "12%" }}
        whileInView={{ left: "88%" }}
        viewport={{ once: true }}
        transition={{ duration: DURATIONS.divider, ease: EASE_SMOOTH }}
      />
      <motion.span
        className="absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border border-cyan-200/50"
        initial={{ left: "12%", opacity: 0 }}
        whileInView={{ left: "88%", opacity: [0, 0.6, 0] }}
        viewport={{ once: true }}
        transition={{ duration: DURATIONS.divider, ease: EASE_SMOOTH }}
      />
    </div>
  );
}
