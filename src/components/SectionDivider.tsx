"use client";

import { motion } from "framer-motion";

export default function SectionDivider() {
  return (
    <div className="relative mx-auto my-16 h-8 w-full max-w-6xl px-6">
      <div className="absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <motion.span
        className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/70"
        initial={{ left: "12%" }}
        whileInView={{ left: "86%" }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
      />
    </div>
  );
}
