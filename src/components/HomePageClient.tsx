"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import SectionDivider from "@/components/SectionDivider";
import Skills from "@/components/Skills";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const VoiceBot = dynamic(() => import("@/components/VoiceBot"), { ssr: false });

export default function HomePageClient() {
  return (
    <>
      <Navbar />
      <CommandPalette />
      <VoiceBot />
      <motion.main
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
