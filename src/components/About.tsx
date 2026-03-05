"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { EDUCATION_ITEMS } from "@/lib/data";
import StaggerHeading from "@/components/StaggerHeading";

export default function About() {
  return (
    <>
      <section id="about" className="px-6 py-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[280px_1fr]"
        >
          <div className="surface overflow-hidden rounded-2xl">
            <Image
              src="/assets/profile.jpg"
              alt="Janmejoy Mahato portrait"
              width={560}
              height={760}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="surface rounded-2xl p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.26em] text-white/50">About</p>
            <div className="mt-4">
              <StaggerHeading
                as="h3"
                text="Builder, security-minded engineer."
                className="text-3xl font-semibold tracking-tight md:text-4xl"
              />
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#9ca3af]">
              I&apos;m a final-year Computer Science student focused on full-stack product development and cybersecurity.
              I enjoy turning complex workflows into clean interfaces, then hardening them for real-world usage.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Full Stack Development",
                "Cybersecurity",
                "React + Next.js",
                "Node + API Design",
              ].map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="education" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl font-semibold"
          >
            Education
          </motion.h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {EDUCATION_ITEMS.map((item, index) => (
              <motion.article
                key={item.degree}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08 }}
                className="surface rounded-xl p-5"
              >
                <p className="text-sm text-white/55">{item.year}</p>
                <h3 className="mt-2 text-lg font-medium">{item.degree}</h3>
                <p className="mt-2 text-sm text-[#9ca3af]">{item.institute}</p>
                <p className="mt-3 text-sm text-white/80">{item.score}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
