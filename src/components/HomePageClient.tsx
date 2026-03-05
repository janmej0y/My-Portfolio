"use client";

import { motion } from "framer-motion";
import About from "@/components/About";
import CaseStudies from "@/components/CaseStudies";
import CommandPalette from "@/components/CommandPalette";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import SectionDivider from "@/components/SectionDivider";
import Skills from "@/components/Skills";
import VoiceBot from "@/components/VoiceBot";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

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
        <CaseStudies />
        <SectionDivider />
        <Skills />
        <SectionDivider />
        <Contact />
      </motion.main>
    </>
  );
}
