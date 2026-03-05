"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CERTIFICATIONS, SKILL_GROUPS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD, STAGGER } from "@/lib/motion";
import StaggerHeading from "@/components/StaggerHeading";

export default function Skills() {
  return (
    <>
      <section id="skills" className="section-backplate c section-wrap px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          >
            <StaggerHeading text="Skills" className="display-title text-4xl font-semibold tracking-tight" />
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SKILL_GROUPS.map((group, index) => (
              <motion.article
                key={group.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * STAGGER.card, duration: DURATIONS.base, ease: EASE_STANDARD }}
                className="surface rounded-xl p-5"
              >
                <h3 className="text-lg font-medium">{group.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">Core Toolkit</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <motion.div
                      key={skill.name}
                      whileHover={{ y: -2 }}
                      className="icon-pill interactive-lift"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
                        <Image src={skill.icon} alt={skill.name} width={16} height={16} className={skill.invert ? "invert" : ""} />
                      </span>
                      <span className="text-sm text-white/80">{skill.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="certifications" className="section-backplate a section-wrap px-6 pt-0 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="display-title text-4xl font-semibold tracking-tight"
          >
            Certifications
          </motion.h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CERTIFICATIONS.map((cert, index) => (
              <motion.article
                key={cert.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * STAGGER.card, duration: DURATIONS.base, ease: EASE_STANDARD }}
                whileHover={{ y: -6 }}
                className="surface interactive-lift rounded-xl p-6"
              >
                <span className="icon-pill w-fit">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
                    <Image src={cert.icon} alt={cert.title} width={24} height={24} className="h-6 w-6 object-contain" />
                  </span>
                  <span className="text-xs uppercase tracking-[0.12em] text-white/70">Certificate</span>
                </span>
                <h3 className="mt-4 text-lg font-medium">{cert.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#9ca3af]">{cert.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
