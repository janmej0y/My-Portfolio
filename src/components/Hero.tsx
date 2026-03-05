"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import MagneticButton from "@/components/MagneticButton";
import StaggerHeading from "@/components/StaggerHeading";

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
      "Cybersecurity Enthussiast",
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
      className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 md:px-12"
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
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.24),transparent_36%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.22),transparent_36%)]"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={shouldReduceMotion ? undefined : { y: foregroundY, opacity: contentOpacity }}
        className="mx-auto w-full max-w-6xl will-change-transform"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.6 }}
          className="text-sm uppercase tracking-[0.3em] text-white/60"
        >
          Available for full-time roles
        </motion.p>

        <div className="mt-5">
          <StaggerHeading
            as="h1"
            text="HELLO, I'M JANMEJOY"
            className="text-5xl font-semibold leading-[0.92] tracking-[-0.03em] sm:text-6xl lg:text-8xl"
          />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.7 }}
          className="mt-4 flex min-h-[2.4em] max-w-4xl items-center text-2xl font-medium text-white/85 sm:text-3xl lg:text-5xl"
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
          transition={{ delay: 0.32, duration: 0.7 }}
          className="mt-7 max-w-2xl text-base leading-7 text-[#9ca3af]"
        >
          I design and build secure, performant digital products with a clean visual language and strong engineering fundamentals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <MagneticButton
            href="#projects"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black"
          >
            View Projects
          </MagneticButton>
          <MagneticButton
            href="/assets/resume.pdf"
            download
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
          >
            Resume
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
