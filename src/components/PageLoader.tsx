"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const PREPARE_MS = 420;
const UNMOUNT_MS = 2500;
const GATE_DURATION = 1.4;
const GATE_EASE = [0.76, 0, 0.24, 1] as const;
const revealGroup: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.22,
    },
  },
};

const maskedLine: Variants = {
  hidden: { y: "112%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.7, ease: GATE_EASE },
  },
};

const cardReveal: Variants = {
  hidden: { y: 24, scale: 0.96, opacity: 0 },
  visible: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.72, ease: GATE_EASE },
  },
};

const terminalLine: Variants = {
  hidden: { x: -12, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

export default function PageLoader() {
  const [mounted, setMounted] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("portfolio-intro-active");
    document.body.classList.add("portfolio-intro-active");

    const openTimer = window.setTimeout(() => setOpen(true), PREPARE_MS);
    const unmountTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("portfolio-intro-active");
      document.body.classList.remove("portfolio-intro-active");
      setMounted(false);
    }, UNMOUNT_MS);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(unmountTimer);
      document.documentElement.classList.remove("portfolio-intro-active");
      document.body.classList.remove("portfolio-intro-active");
    };
  }, []);

  return (
    <AnimatePresence>
      {mounted ? (
        <motion.div
          role="status"
          aria-label="Opening Janmejoy portfolio entrance"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="portfolio-loader fixed inset-0 z-[220] overflow-hidden bg-black"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(6,182,212,0.14),transparent_34%),linear-gradient(135deg,#020617,#050505_58%,#000)]" />

          <motion.section
            variants={revealGroup}
            initial="hidden"
            animate={open ? "visible" : "hidden"}
            className="relative z-10 flex min-h-full items-center justify-center px-5 py-20"
          >
            <div className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)]">
              <motion.div variants={cardReveal} className="relative mx-auto w-full max-w-[290px] transform-gpu will-change-[transform,opacity]">
                <div className="absolute -inset-6 bg-[radial-gradient(circle,rgba(34,211,238,0.14),transparent_62%)]" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.02] shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 1.035, opacity: 0.96 }}
                    animate={open ? { scale: 1, opacity: 1 } : { scale: 1.035, opacity: 0.96 }}
                    transition={{ duration: 0.95, ease: GATE_EASE }}
                    className="absolute inset-0 transform-gpu will-change-[transform,opacity]"
                  >
                    <Image
                      src="/assets/profile.jpg"
                      alt="Janmejoy Mahato"
                      fill
                      priority
                      sizes="(max-width: 768px) 72vw, 290px"
                      className="object-cover"
                    />
                  </motion.div>
                  <motion.div
                    aria-hidden="true"
                    initial={{ opacity: 0.42 }}
                    animate={open ? { opacity: 0 } : { opacity: 0.42 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.26),rgba(2,6,23,0.34)_46%,rgba(2,6,23,0.72))] will-change-opacity"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.22),transparent_36%,rgba(34,211,238,0.2))]" />
                  <span className="absolute left-4 top-4 h-9 w-9 border-l border-t border-cyan-100/70" />
                  <span className="absolute right-4 top-4 h-9 w-9 border-r border-t border-emerald-100/70" />
                  <span className="absolute bottom-4 left-4 h-9 w-9 border-b border-l border-emerald-100/70" />
                  <span className="absolute bottom-4 right-4 h-9 w-9 border-b border-r border-cyan-100/70" />
                </div>
              </motion.div>

              <div className="relative text-center md:text-left">
                <motion.div variants={revealGroup} className="space-y-3">
                  <div className="overflow-hidden">
                    <motion.p variants={maskedLine} className="transform-gpu text-xs font-semibold uppercase tracking-[0.36em] text-cyan-100/72 will-change-[transform,opacity]">
                      Janmejoy Mahato
                    </motion.p>
                  </div>
                  <div className="overflow-hidden">
                    <motion.h1 variants={maskedLine} className="transform-gpu font-display text-4xl font-semibold leading-tight tracking-normal text-white will-change-[transform,opacity] sm:text-5xl md:text-6xl">
                      Welcome to JJ Portfolio
                    </motion.h1>
                  </div>
                  <div className="overflow-hidden">
                    <motion.p variants={maskedLine} className="mx-auto max-w-2xl transform-gpu text-sm font-medium uppercase leading-7 tracking-[0.22em] text-white/58 will-change-[transform,opacity] md:mx-0">
                      Full Stack Developer / Cyber Security Enthusiast
                    </motion.p>
                  </div>
                </motion.div>

                <motion.article
                  variants={cardReveal}
                  className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#05080d]/86 text-left shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl will-change-[transform,opacity]"
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
                    </div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/38">entry ready</p>
                  </div>
                  <motion.div variants={revealGroup} className="space-y-1 p-4 font-mono text-xs leading-6 text-cyan-50/72 sm:p-5">
                    {["$ unlock jj-portfolio", "> secure interface online", "> welcome sequence complete"].map((line) => (
                      <motion.p key={line} variants={terminalLine} className="transform-gpu will-change-[transform,opacity]">
                        {line}
                      </motion.p>
                    ))}
                  </motion.div>
                </motion.article>
              </div>
            </div>
          </motion.section>

          <div className="pointer-events-none absolute inset-0 z-30 [perspective:1600px]">
            <motion.div
              aria-hidden="true"
              initial={{ x: 0 }}
              animate={{ x: open ? "-100%" : 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: GATE_DURATION, ease: GATE_EASE }}
              className="absolute inset-y-0 left-0 w-1/2 transform-gpu overflow-hidden border-r border-white/10 bg-gradient-to-br from-zinc-950 via-neutral-950 to-neutral-900 shadow-[24px_0_90px_rgba(0,0,0,0.62)] will-change-transform"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,rgba(34,211,238,0.1),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.07),transparent_42%)]" />
              <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-cyan-100/10 to-transparent" />
            </motion.div>

            <motion.div
              aria-hidden="true"
              initial={{ x: 0 }}
              animate={{ x: open ? "100%" : 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: GATE_DURATION, ease: GATE_EASE }}
              className="absolute inset-y-0 right-0 w-1/2 transform-gpu overflow-hidden border-l border-white/10 bg-gradient-to-bl from-zinc-950 via-neutral-950 to-neutral-900 shadow-[-24px_0_90px_rgba(0,0,0,0.62)] will-change-transform"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_42%,rgba(16,185,129,0.1),transparent_34%),linear-gradient(270deg,rgba(255,255,255,0.07),transparent_42%)]" />
              <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-emerald-100/10 to-transparent" />
            </motion.div>

            <motion.div
              aria-hidden="true"
              initial={{ opacity: 1, scaleY: 1 }}
              animate={{ opacity: open ? 0 : [0.34, 1, 0.34], scaleY: open ? 1.18 : 1 }}
              transition={open ? { duration: 0.32, ease: "easeOut" } : { duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transform-gpu bg-gradient-to-b from-transparent via-cyan-400/70 to-transparent shadow-[0_0_28px_rgba(34,211,238,0.9)] will-change-[transform,opacity]"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
