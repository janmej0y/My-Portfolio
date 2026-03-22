"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CERTIFICATIONS, SKILL_GROUPS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD, STAGGER } from "@/lib/motion";

const DRIVE_LINK =
  "https://drive.google.com/drive/folders/173A6iPtgXG45KZc-uIHhHH7TXdQageUscgHL5Y2F8uKxgTbS4l8FsH8CAUsvCoI5Lpg4ooKH";

function SkillGroupCard({
  title,
  items,
  index,
}: {
  title: string;
  items: Array<{ name: string; icon: string; invert?: boolean }>;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ delay: index * STAGGER.card, duration: DURATIONS.base, ease: EASE_STANDARD }}
      whileHover={{ y: -4 }}
      className="surface rounded-[28px] p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Symbol Stack</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
        <div className="accent-pill px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
          {items.length} Tools
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((skill) => (
          <div key={skill.name} className="rounded-[20px] border border-white/10 bg-black/18 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/8">
                <Image src={skill.icon} alt={skill.name} width={22} height={22} className={skill.invert ? "invert" : ""} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{skill.name}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">Tool Symbol</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

export default function Skills() {
  const totalTools = SKILL_GROUPS.reduce((sum, group) => sum + group.items.length, 0);
  const featuredGroup = SKILL_GROUPS[0];
  const remainingGroups = SKILL_GROUPS.slice(1);

  return (
    <>
      <section id="skills" className="section-backplate c section-wrap px-5 sm:px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="relative"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/46">Arsenal</p>
                <h2 className="display-title mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                  Clean capability stack with recognisable symbols
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="accent-pill px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]">
                  Frontend to security
                </div>
                <div className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/78">
                  {SKILL_GROUPS.length} Domains
                </div>
                <div className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/78">
                  {totalTools} Tools
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="metric-card px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Design Value</p>
                <p className="mt-2 text-sm leading-6 text-white/82">Symbol-led cards that stay easy to scan for recruiters and collaborators.</p>
              </div>
              <div className="metric-card px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Engineering Value</p>
                <p className="mt-2 text-sm leading-6 text-white/82">A balanced stack covering interfaces, APIs, databases, and delivery tools.</p>
              </div>
              <div className="metric-card px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Security Value</p>
                <p className="mt-2 text-sm leading-6 text-white/82">Security-first thinking carried into implementation choices and system design.</p>
              </div>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1.02fr_1.18fr]">
            {featuredGroup ? (
              <motion.article
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
                className="surface rounded-[30px] p-6"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/68">Primary Stack</p>
                <h3 className="display-title mt-3 text-3xl font-semibold text-white">{featuredGroup.title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
                  The strongest working layer for polished interfaces, modern app structure, and dependable delivery.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {featuredGroup.items.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8">
                          <Image src={skill.icon} alt={skill.name} width={24} height={24} className={skill.invert ? "invert" : ""} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{skill.name}</p>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">Core Symbol</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.article>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              {remainingGroups.map((group, index) => (
                <SkillGroupCard key={group.title} title={group.title} items={group.items} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="certifications" className="section-backplate a section-wrap px-5 pt-0 sm:px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-white/50">Proof Stack</p>
              <h2 className="display-title mt-3 text-4xl font-semibold tracking-tight">Certificates and verification trail</h2>
            </div>
            <a
              href={DRIVE_LINK}
              target="_blank"
              rel="noreferrer"
              className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"
            >
              Open Drive Folder
            </a>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CERTIFICATIONS.map((cert, index) => (
              <motion.article
                key={cert.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * STAGGER.card, duration: DURATIONS.base, ease: EASE_STANDARD }}
                whileHover={{ y: -4 }}
                className="surface rounded-xl p-6"
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
