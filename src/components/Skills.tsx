"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CERTIFICATIONS, SKILL_GROUPS } from "@/lib/data";
import StaggerHeading from "@/components/StaggerHeading";

export default function Skills() {
  return (
    <>
      <section id="skills" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <StaggerHeading text="Skills" className="text-4xl font-semibold tracking-tight" />
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SKILL_GROUPS.map((group, index) => (
              <motion.article
                key={group.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="surface rounded-xl p-5"
              >
                <h3 className="text-lg font-medium">{group.title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <motion.div
                      key={skill.name}
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-2 rounded-md border border-white/10 px-2.5 py-1.5"
                    >
                      <Image src={skill.icon} alt={skill.name} width={18} height={18} className={skill.invert ? "invert" : ""} />
                      <span className="text-sm text-white/80">{skill.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="certifications" className="px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-semibold tracking-tight"
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
                transition={{ delay: index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="surface rounded-xl p-6"
              >
                <Image src={cert.icon} alt={cert.title} width={38} height={38} className="h-10 w-10 object-contain" />
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
