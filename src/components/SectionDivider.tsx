"use client";

import { motion } from "framer-motion";
import { CSSProperties } from "react";
import { DURATIONS, EASE_SMOOTH } from "@/lib/motion";

export default function SectionDivider() {
  return (
    <div className="relative mx-auto my-4 h-8 w-full max-w-6xl px-5 sm:my-6 sm:h-10 sm:px-6">
      {/* Hairline stays as the base; the drawn curve rides on top of it. */}
      <div className="absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent sm:inset-x-6" />

      <svg
        aria-hidden="true"
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        className="stroke-draw absolute inset-x-5 top-1/2 h-6 -translate-y-1/2 sm:inset-x-6"
        style={{ "--dash": 1240 } as CSSProperties}
      >
        <path
          d="M0 12 C 180 12, 240 4, 380 12 S 620 20, 760 12 S 1020 4, 1200 12"
          fill="none"
          stroke="url(#divider-stroke)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="divider-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(34,211,238,0)" />
            <stop offset="28%" stopColor="rgba(34,211,238,0.75)" />
            <stop offset="62%" stopColor="rgba(167,139,250,0.7)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-x-8 top-1/2 h-8 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16)_0%,rgba(34,211,238,0)_68%)] sm:inset-x-10 sm:h-10" />
      <motion.span
        className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
        initial={{ left: "12%" }}
        whileInView={{ left: "88%" }}
        viewport={{ once: true }}
        transition={{ duration: DURATIONS.divider, ease: EASE_SMOOTH }}
      />
      <motion.span
        className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-cyan-200/50"
        initial={{ left: "12%", opacity: 0 }}
        whileInView={{ left: "88%", opacity: [0, 0.6, 0] }}
        viewport={{ once: true }}
        transition={{ duration: DURATIONS.divider, ease: EASE_SMOOTH }}
      />
    </div>
  );
}
