"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import SectionDivider from "@/components/SectionDivider";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

// Everything below the hero is code-split. These sections are off-screen at
// first paint, so keeping them out of the initial bundle shortens the critical
// path without changing anything visually - they still server-render.
const About = dynamic(() => import("@/components/About"));
const Projects = dynamic(() => import("@/components/Projects"));
const Skills = dynamic(() => import("@/components/Skills"));
const Contact = dynamic(() => import("@/components/Contact"));

export default function HomePageClient() {
  return (
    <>
      <CommandPalette />
      <motion.main
        // Counter root: section numbers increment in document order.
        className="section-counter"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATIONS.slow, ease: EASE_STANDARD }}
      >
        <Hero />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Projects />
        <SectionDivider />
        <Skills />
        <SectionDivider />
        <Contact />
      </motion.main>
    </>
  );
}
