"use client";

import { motion } from "framer-motion";
import { DURATIONS, STAGGER } from "@/lib/motion";

type StaggerHeadingProps = {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  once?: boolean;
  amount?: number;
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER.card * 0.7,
      delayChildren: STAGGER.block * 0.75,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function StaggerHeading({
  text,
  as = "h2",
  className,
  once = true,
  amount = 0.45,
}: StaggerHeadingProps) {
  const Tag = as;
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        whileInView="show"
        viewport={{ once, amount }}
        variants={containerVariants}
        transition={{ duration: DURATIONS.base }}
        className="inline-block"
      >
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => (
              <motion.span key={`${wordIndex}-${char}-${charIndex}`} variants={letterVariants} className="inline-block">
                {char}
              </motion.span>
            ))}
            {wordIndex < words.length - 1 ? (
              <motion.span variants={letterVariants} className="inline-block">
                {"\u00A0"}
              </motion.span>
            ) : null}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
