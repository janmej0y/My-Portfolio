"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useMemo, useRef } from "react";
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
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 0.92, 0.82]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.85, 0.2]);
  const heroX = useTransform(smoothX, [-24, 24], [-8, 8]);
  const asideX = useTransform(smoothX, [-24, 24], [10, -10]);
  const asideY = useTransform(smoothY, [-24, 24], [8, -8]);

  const typingSequence = useMemo(
    () => ["Full Stack Developer", 1400, "Cybersecurity Enthusiast", 1400],
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
      className="hero-shell relative flex min-h-[94svh] items-center overflow-hidden px-5 pb-20 pt-24 sm:min-h-screen sm:px-6 md:px-12 md:pb-16 md:pt-28"
    >
      {/* Single warm glow anchored behind the name, plus a cool counterweight.
          The old build had three orbs pulling attention in three directions. */}
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { opacity: glowOpacity }}
        className="pointer-events-none absolute -left-24 top-4 -z-20 h-[30rem] w-[30rem] rounded-full bg-cyan-400/16 blur-[110px]"
      />
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { opacity: glowOpacity }}
        className="pointer-events-none absolute -bottom-40 right-[-8rem] -z-20 h-[26rem] w-[26rem] rounded-full bg-violet-500/14 blur-[110px]"
      />

      {/* Faint ruled grid gives the composition a floor to sit on. */}
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { y: backgroundY }}
        className="hero-grid pointer-events-none absolute inset-0 -z-10"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={shouldReduceMotion ? undefined : { x: heroX, y: foregroundY, opacity: contentOpacity }}
        className="mx-auto grid w-full max-w-6xl gap-12 will-change-transform lg:grid-cols-[minmax(0,1fr)_296px] lg:items-center lg:gap-16"
      >
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="hero-status inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5">
              <span className="relative flex h-2 w-2">
                {!shouldReduceMotion ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                ) : null}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:text-[11px]">
                Available for full-time roles
              </span>
            </span>
            <span className="hero-locale text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]">
              Kolkata, India
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.14, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="eyebrow-hand mt-8"
          >
            Hello, I&apos;m
          </motion.p>

          {/* The name is the anchor: oversized, tight, and clipped per letter so
              the reveal reads as one motion rather than eight separate fades. */}
          <h1 className="hero-name display-title mt-2 flex flex-wrap text-[3.4rem] font-semibold leading-[0.9] tracking-[-0.045em] text-white sm:text-[5.4rem] lg:text-[7.5rem]">
            <span className="sr-only">{NAME}</span>
            {Array.from(NAME).map((char, index) => (
              <span key={`${char}-${index}`} aria-hidden="true" className="hero-letter">
                <motion.span
                  initial={shouldReduceMotion ? { opacity: 0 } : { y: "108%" }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.85, ease: EASE_STANDARD }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.62, duration: 0.9, ease: EASE_STANDARD }}
            className="hero-rule mt-6 h-[2px] w-full max-w-lg origin-left"
          />

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-6 flex min-h-[1.6em] items-center text-xl font-medium text-white/90 sm:text-2xl lg:text-[2.15rem]"
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
              className="ml-1.5 inline-block h-[0.95em] w-[3px] rounded-full bg-cyan-300 align-middle"
              animate={shouldReduceMotion ? undefined : { opacity: [1, 0, 1] }}
              transition={shouldReduceMotion ? undefined : { duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.78, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base"
          >
            Clean UX, secure APIs, and architecture that holds up in production.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.86, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <MagneticButton
              href="#projects"
              className="hero-cta group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-black"
            >
              View Projects
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </MagneticButton>
            <MagneticButton
              href="/assets/resume.pdf"
              download
              className="hero-cta-ghost inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              Resume
            </MagneticButton>
          </motion.div>

          {/* Stats sit on a bare baseline rule now - the boxed strip was reading
              as a fifth competing panel next to the card. */}
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.94, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-11 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-6 sm:grid-cols-4"
          >
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <dd className="display-title text-3xl font-semibold tabular-nums text-white sm:text-[2.1rem]">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/42">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          style={shouldReduceMotion ? undefined : { x: asideX, y: asideY }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="relative mx-auto w-full max-w-[300px] lg:mx-0"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={shouldReduceMotion ? undefined : { duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <GitHubStatsCard />
          </motion.div>
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
