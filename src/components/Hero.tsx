"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useMemo, useRef } from "react";
import ScreamFigure from "@/components/ScreamFigure";
import { TypeAnimation } from "react-type-animation";
import GitHubStatsCard from "@/components/GitHubStatsCard";
import MagneticButton from "@/components/MagneticButton";
import StaggerHeading from "@/components/StaggerHeading";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 18 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -170]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 0.92, 0.82]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.85, 0.25]);
  const heroX = useTransform(smoothX, [-24, 24], [-12, 12]);
  const heroY = useTransform(smoothY, [-24, 24], [-8, 8]);
  const statsX = useTransform(smoothX, [-24, 24], [10, -10]);
  const statsY = useTransform(smoothY, [-24, 24], [8, -8]);
  const chipY = useTransform(smoothY, [-24, 24], [-4, 4]);

  const typingSequence = useMemo(
    () => [
      "Cybersecurity Enthusiast",
      1200,
      "Full Stack Developer",
      1200,
      "Bug Bounty Hunter",
      1200,
    ],
    [],
  );
  const trustChips = useMemo(() => ["Security-first", "Full-stack", "Open to roles"], []);

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || window.innerWidth < 768) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 48;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 48;
    pointerX.set(x);
    pointerY.set(y);
  };

  const onLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative flex min-h-[92svh] items-center overflow-hidden px-5 pb-10 pt-24 sm:min-h-screen sm:px-6 md:px-12 md:pb-8 md:pt-28"
    >
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { opacity: glowOpacity }}
        className="pointer-events-none absolute -left-32 -top-20 -z-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"
      />

      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { y: orbY, opacity: glowOpacity }}
        className="pointer-events-none absolute -bottom-36 right-[-7rem] -z-20 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/20 blur-3xl"
      />

      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { y: backgroundY }}
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_18%,rgba(56,189,248,0.2),transparent_34%),radial-gradient(circle_at_86%_70%,rgba(236,72,153,0.14),transparent_34%)]"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={shouldReduceMotion ? undefined : { x: heroX, y: foregroundY, opacity: contentOpacity }}
        className="mx-auto grid w-full max-w-6xl gap-8 will-change-transform lg:grid-cols-[1fr_320px] lg:items-start"
      >
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="text-sm uppercase tracking-[0.3em] text-white/60"
          >
            Available for full-time roles
          </motion.p>

          <div className="mt-5 mr-0 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm sm:mr-6 sm:p-5 lg:mr-16">
            <p className="font-display text-xs uppercase tracking-[0.24em] text-white/70 sm:text-sm sm:tracking-[0.26em] md:text-base">Hello, I&apos;m</p>
            <h1 className="display-title mt-2 text-[2.2rem] font-semibold leading-[1.02] text-white sm:text-[3.15rem] lg:text-[5rem]">
              JANMEJOY
            </h1>
            <StaggerHeading
              as="h2"
              text="Secure Builder of Digital Systems"
              className="display-title mt-3 max-w-3xl text-xl font-semibold leading-tight text-white/84 sm:text-2xl lg:text-3xl"
            />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-5 flex min-h-[2.4em] max-w-3xl items-center text-xl font-medium text-white/85 sm:text-2xl lg:text-[2.2rem]"
          >
            <TypeAnimation
              sequence={typingSequence}
              speed={56}
              deletionSpeed={45}
              repeat={Infinity}
              cursor={false}
              className="inline-block"
            />
            <motion.span
              aria-hidden="true"
              className="ml-1 inline-block h-[0.95em] w-[2px] bg-white/75 align-middle"
              animate={shouldReduceMotion ? undefined : { opacity: [1, 0, 1] }}
              transition={shouldReduceMotion ? undefined : { duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: DURATIONS.base, ease: EASE_STANDARD }}
            style={shouldReduceMotion ? undefined : { y: chipY }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {trustChips.map((chip) => (
              <span key={chip} className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-100/90">
                {chip}
              </span>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-6 max-w-2xl text-sm leading-7 text-[#9ca3af] sm:text-base"
          >
            I design and build secure, performant digital products with a clean visual language and strong engineering fundamentals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <MagneticButton
              href="#projects"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black"
            >
              View Projects
            </MagneticButton>
            <MagneticButton
              href="/assets/resume.pdf"
              download
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              Resume
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          style={shouldReduceMotion ? undefined : { x: statsX, y: statsY }}
          className="relative mx-auto w-full max-w-[280px] pb-14 sm:max-w-[320px] sm:pb-20 lg:mx-0 lg:pt-8"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={shouldReduceMotion ? undefined : { duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <GitHubStatsCard />
          </motion.div>
          <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 -translate-y-6">
            <ScreamFigure />
          </div>
        </motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: DURATIONS.fast, ease: EASE_STANDARD }}
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.22em] text-white/38"
      >
        Scroll to explore
      </motion.p>
    </section>
  );
}
