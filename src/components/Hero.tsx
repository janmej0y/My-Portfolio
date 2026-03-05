"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import ScreamFigure from "@/components/ScreamFigure";
import { TypeAnimation } from "react-type-animation";
import GitHubStatsCard from "@/components/GitHubStatsCard";
import MagneticButton from "@/components/MagneticButton";
import StaggerHeading from "@/components/StaggerHeading";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -170]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 0.92, 0.82]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.85, 0.25]);

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

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pb-8 pt-24 md:px-12 md:pt-28"
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
        style={shouldReduceMotion ? undefined : { y: foregroundY, opacity: contentOpacity }}
        className="mx-auto grid w-full max-w-6xl gap-8 will-change-transform lg:grid-cols-[1fr_320px] lg:items-start"
      >
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="text-sm uppercase tracking-[0.3em] text-white/60"
          >
            Available for full-time roles
          </motion.p>

          <div className="mt-5 max-w-4xl">
            <p className="font-display text-sm uppercase tracking-[0.26em] text-white/70 sm:text-base">Hello, I&apos;m</p>
            <h1 className="display-title mt-2 text-[2.3rem] font-semibold leading-[1.02] text-white sm:text-[3.35rem] lg:text-[5.4rem]">
              JANMEJOY
            </h1>
            <StaggerHeading
              as="h2"
              text="Secure Builder of Modern Products"
              className="display-title mt-3 text-xl font-semibold leading-tight text-white/82 sm:text-2xl lg:text-3xl"
            />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-5 flex min-h-[2.4em] max-w-4xl items-center text-xl font-medium text-white/85 sm:text-2xl lg:text-4xl"
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

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-7 max-w-2xl text-base leading-7 text-[#9ca3af]"
          >
            I design and build secure, performant digital products with a clean visual language and strong engineering fundamentals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center"
          >
            <MagneticButton
              href="#projects"
              className="inline-flex min-h-11 justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black"
            >
              View Projects
            </MagneticButton>
            <MagneticButton
              href="/assets/resume.pdf"
              download
              className="inline-flex min-h-11 justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              Resume
            </MagneticButton>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-[320px] pb-28 lg:mx-0 lg:pt-8">
          <GitHubStatsCard />
          <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 -translate-y-6">
            <ScreamFigure />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
