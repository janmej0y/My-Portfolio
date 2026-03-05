"use client";

import { motion } from "framer-motion";

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
      staggerChildren: 0.035,
      delayChildren: 0.06,
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

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        whileInView="show"
        viewport={{ once, amount }}
        variants={containerVariants}
        transition={{ duration: 0.48 }}
        className="inline-block whitespace-pre-wrap"
      >
        {Array.from(text).map((char, index) => (
          <motion.span key={`${char}-${index}`} variants={letterVariants} className="inline-block">
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
