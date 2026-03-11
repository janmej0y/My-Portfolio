"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { MouseEvent } from "react";
import { EDUCATION_ITEMS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD, STAGGER } from "@/lib/motion";
import StaggerHeading from "@/components/StaggerHeading";

export default function About() {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, { stiffness: 180, damping: 18 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 180, damping: 18 });
  const translateY = useTransform(smoothRotateX, [-10, 10], [10, -10]);

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 768) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 18);
    rotateX.set((0.5 - py) * 18);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <>
      <section id="about" className="section-backplate a section-wrap px-5 pb-6 pt-4 sm:px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[300px_1fr] lg:gap-8"
        >
          <div className="relative [perspective:1400px]">
            <motion.div
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              style={{ rotateX: smoothRotateX, rotateY: smoothRotateY, y: translateY }}
              className="relative isolate mx-auto w-full max-w-[340px] [transform-style:preserve-3d]"
            >
              <div className="absolute inset-[-12%] -z-10 rounded-[36px] bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.32),transparent_34%),radial-gradient(circle_at_70%_80%,rgba(244,114,182,0.22),transparent_32%)] blur-3xl" />
              <div className="absolute inset-x-[10%] bottom-[-12%] h-20 rounded-full bg-cyan-400/20 blur-2xl [transform:translateZ(-80px)]" />
              <div className="absolute -right-4 top-6 h-24 w-24 rounded-[28px] border border-cyan-300/20 bg-cyan-300/8 shadow-[0_18px_50px_rgba(34,211,238,0.18)] backdrop-blur-md [transform:translateZ(70px)]" />
              <div className="absolute -left-5 bottom-10 h-20 w-20 rounded-full border border-white/12 bg-white/8 backdrop-blur-md [transform:translateZ(60px)]" />
              <div className="relative overflow-hidden rounded-[30px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-3 shadow-[0_30px_80px_rgba(2,6,23,0.45)] [transform:translateZ(0)]">
                <div className="relative overflow-hidden rounded-[24px] border border-white/10">
                  <div className="absolute inset-0 z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_30%,transparent_70%,rgba(34,211,238,0.2))]" />
                  <Image
                    src="/assets/profile.jpg"
                    alt="Janmejoy Mahato portrait"
                    width={560}
                    height={760}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="surface rounded-2xl p-7 md:p-9">
            <p className="text-sm uppercase tracking-[0.26em] text-white/50">Origin Story</p>
            <div className="mt-4">
              <StaggerHeading
                as="h3"
                text="Code, curiosity, and a security-first mindset."
                className="text-3xl font-semibold tracking-tight md:text-4xl"
              />
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#9ca3af]">
              I&apos;m a final-year Computer Science student focused on full-stack product development and cybersecurity.
              I enjoy turning complex workflows into clean interfaces, then hardening them for real-world usage.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/50">Experience</p>
                <p className="mt-1 text-lg font-semibold text-white/90">3+ Years</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/50">Projects</p>
                <p className="mt-1 text-lg font-semibold text-white/90">12+ Shipped</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/50">Focus</p>
                <p className="mt-1 text-lg font-semibold text-white/90">Security + UX</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Full Stack Development",
                "Cybersecurity",
                "React + Next.js",
                "Node + API Design",
              ].map((tag) => (
                <span key={tag} className="interactive-lift rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="education" className="section-backplate b section-wrap px-5 sm:px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          >
            Learning Runway
          </motion.h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {EDUCATION_ITEMS.map((item, index) => (
              <motion.article
                key={item.degree}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * STAGGER.block, duration: DURATIONS.base, ease: EASE_STANDARD }}
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
