"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useMemo, useRef } from "react";
import ScreamFigure from "@/components/ScreamFigure";
import { TypeAnimation } from "react-type-animation";
import GitHubStatsCard from "@/components/GitHubStatsCard";
import MagneticButton from "@/components/MagneticButton";
import { EXPERIENCE_ITEMS, PROJECTS, SKILL_GROUPS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

/** Rendered per letter so the name can rise into place on load. */
const NAME = "JANMEJOY";

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
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 0.92, 0.82]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.85, 0.25]);
  const heroX = useTransform(smoothX, [-24, 24], [-10, 10]);
  const asideX = useTransform(smoothX, [-24, 24], [12, -12]);
  const asideY = useTransform(smoothY, [-24, 24], [10, -10]);

  const typingSequence = useMemo(
    () => [
      "Full Stack Developer",
      1400,
      "Cybersecurity Enthusiast",
      1400,
      "Bug Bounty Hunter",
      1400,
    ],
    [],
  );

  // Counts read from the same source the rest of the page renders, so they cannot drift.
  const heroStats = useMemo(() => {
    const tools = SKILL_GROUPS.reduce((sum, group) => sum + group.items.length, 0);
    return [
      { value: String(PROJECTS.length), label: "Projects" },
      { value: String(PROJECTS.filter((project) => project.liveUrl).length), label: "Live" },
      { value: String(tools), label: "Tools" },
      { value: String(EXPERIENCE_ITEMS.length), label: "Internships" },
    ];
  }, []);

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
      className="relative flex min-h-[92svh] items-center overflow-hidden px-5 pb-16 pt-24 sm:min-h-screen sm:px-6 md:px-12 md:pb-14 md:pt-28"
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
        className="mx-auto grid w-full max-w-6xl gap-10 will-change-transform lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-12"
      >
        <div className="min-w-0">
          {/* Availability reads as a live status readout rather than a plain label. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="hero-status inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              {!shouldReduceMotion ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              ) : null}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:text-[11px]">
              Available for full-time roles
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.14, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="eyebrow-hand mt-7"
          >
            Hello, I&apos;m
          </motion.p>

          <h1 className="display-title mt-2 flex flex-wrap text-[3rem] font-semibold leading-[0.94] tracking-[-0.03em] text-white sm:text-[4.6rem] lg:text-[6.4rem]">
            <span className="sr-only">{NAME}</span>
            {Array.from(NAME).map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                aria-hidden="true"
                initial={{ opacity: 0, y: "0.45em" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.045, duration: 0.7, ease: EASE_STANDARD }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </h1>

          {/* Accent rule draws itself, tying the name to the role line. */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: EASE_STANDARD }}
            className="hero-rule mt-5 h-px w-full max-w-md origin-left"
          />

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-5 flex min-h-[1.6em] items-center text-xl font-medium text-white/88 sm:text-2xl lg:text-[2rem]"
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
              className="ml-1 inline-block h-[0.95em] w-[3px] rounded-full bg-cyan-300 align-middle"
              animate={shouldReduceMotion ? undefined : { opacity: [1, 0, 1] }}
              transition={shouldReduceMotion ? undefined : { duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.74, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base"
          >
            Clean UX, secure APIs, and architecture that holds up in production.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <MagneticButton
              href="#projects"
              className="hero-cta group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black"
            >
              View Projects
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </MagneticButton>
            <MagneticButton
              href="/assets/resume.pdf"
              download
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              Resume
            </MagneticButton>
          </motion.div>

          {/* Stat strip replaces the old chip row; every figure is derived from real data. */}
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-9 grid max-w-lg grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10"
          >
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat px-2 py-3 text-center sm:px-3">
                <dd className="display-title text-xl font-semibold tabular-nums text-white sm:text-2xl">
                  {stat.value}
                </dd>
                <dt className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/45 sm:text-[10px]">
                  {stat.label}
                </dt>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          style={shouldReduceMotion ? undefined : { x: asideX, y: asideY }}
          className="relative mx-auto w-full max-w-[300px] pb-14 sm:pb-16 lg:mx-0 lg:pb-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: DURATIONS.base, ease: EASE_STANDARD }}
          >
            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={shouldReduceMotion ? undefined : { duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <GitHubStatsCard />
            </motion.div>
          </motion.div>
          <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 -translate-y-6">
            <ScreamFigure />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll cue: a dot travels down the rail instead of a static caption. */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: DURATIONS.base, ease: EASE_STANDARD }}
        className="group absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-label="Scroll to explore"
      >
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/38 transition-colors group-hover:text-white/70">
          Scroll to explore
        </span>
        <span aria-hidden="true" className="relative h-9 w-px overflow-hidden bg-white/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-transparent to-cyan-300"
            animate={shouldReduceMotion ? undefined : { y: ["-100%", "300%"] }}
            transition={shouldReduceMotion ? undefined : { duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
