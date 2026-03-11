"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { MouseEvent } from "react";
import { CERTIFICATIONS, SKILL_GROUPS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD, STAGGER } from "@/lib/motion";

const DRIVE_LINK =
  "https://drive.google.com/drive/folders/173A6iPtgXG45KZc-uIHhHH7TXdQageUscgHL5Y2F8uKxgTbS4l8FsH8CAUsvCoI5Lpg4ooKH";

function ArsenalCard({
  title,
  items,
  index,
}: {
  title: string;
  items: Array<{ name: string; icon: string; invert?: boolean }>;
  index: number;
}) {
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(smoothY, [0, 100], [8, -8]);
  const rotateY = useTransform(smoothX, [0, 100], [-8, 8]);

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 768) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width) * 100);
    pointerY.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ delay: index * STAGGER.card, duration: DURATIONS.base, ease: EASE_STANDARD }}
      whileHover={{ y: -10 }}
      onMouseMove={onMove}
      className="group relative [perspective:1400px]"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,rgba(7,15,28,0.96),rgba(3,9,18,0.92))] p-5 shadow-[0_24px_64px_rgba(2,6,23,0.34)]"
      >
        <motion.div
          aria-hidden="true"
          style={{ left: smoothX, top: smoothY }}
          className="pointer-events-none absolute h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/14 blur-3xl"
        />
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.08, 0.28, 0.08] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 }}
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Arsenal Module</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
            </div>
            <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/8 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Core Toolkit
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {items.map((skill, skillIndex) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 + skillIndex * 0.03, duration: 0.35 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="group/item inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/24 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/8">
                  <Image src={skill.icon} alt={skill.name} width={18} height={18} className={skill.invert ? "invert" : ""} />
                </span>
                <span className="text-sm text-white/85">{skill.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
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
            <div className="pointer-events-none absolute -left-14 top-0 h-40 w-40 rounded-full bg-cyan-300/12 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-10 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/46">Arsenal</p>
                <h2 className="display-title mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                  Capability matrix
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                  Frontend to security
                </div>
                <div className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/78">
                  Production mindset
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/78">
                {SKILL_GROUPS.length} Domains
              </div>
              <div className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/78">
                {totalTools} Tools
              </div>
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                Secure Focus
              </div>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_1.2fr]">
            {featuredGroup ? (
              <motion.article
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
                className="relative overflow-hidden rounded-[30px] border border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(7,15,28,0.96),rgba(3,9,18,0.92))] p-6 shadow-[0_26px_72px_rgba(2,6,23,0.34)]"
              >
                <motion.div
                  aria-hidden="true"
                  animate={{ opacity: [0.12, 0.28, 0.12], scale: [1, 1.08, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-10 top-10 h-44 w-44 rounded-full bg-cyan-300/12 blur-3xl"
                />
                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-cyan-100/70">Primary Stack</p>
                  <h3 className="display-title mt-3 text-3xl font-semibold text-white">{featuredGroup.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/72">
                    The core layer I reach for most often when building polished interfaces and modern product experiences.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {featuredGroup.items.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.35 }}
                        whileHover={{ y: -4 }}
                        className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/8">
                            <Image src={skill.icon} alt={skill.name} width={20} height={20} className={skill.invert ? "invert" : ""} />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{skill.name}</p>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Frontend Layer</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.article>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              {remainingGroups.map((group, index) => (
                <ArsenalCard key={group.title} title={group.title} items={group.items} index={index} />
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
