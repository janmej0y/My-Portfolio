"use client";

import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { CSSProperties, MouseEvent, useMemo, useRef } from "react";
import { EDUCATION_ITEMS, EXPERIENCE_ITEMS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD, STAGGER } from "@/lib/motion";
import ScrambleText from "@/components/ScrambleText";
import StaggerHeading from "@/components/StaggerHeading";

/** A milestone on the runway - work and study share one shape so they can interleave. */
type RunwayItem = {
  id: string;
  kind: "work" | "study";
  kicker: string;
  title: string;
  subtitle: string;
  meta?: string;
  period: string;
  status: string;
  description?: string;
  tags: string[];
  /** Big ghost numeral printed behind the card. */
  yearLabel: string;
  /** Percentage 0-100 when the milestone has a score worth charting. */
  score?: number;
  /** "r g b" triple driving every accent on the card. */
  accent: string;
  /** Second stop for the card's gradient border and aurora. */
  accentAlt: string;
  /** Start year, used only for ordering. */
  sortYear: number;
};

/** Each milestone gets its own palette so the runway reads as a colour journey. */
const RUNWAY_PALETTES = [
  { accent: "34 211 238", accentAlt: "56 189 248" }, // cyan  -> sky
  { accent: "167 139 250", accentAlt: "217 70 239" }, // violet -> fuchsia
  { accent: "45 212 191", accentAlt: "34 197 94" }, // teal   -> green
  { accent: "251 146 60", accentAlt: "244 63 94" }, // orange -> rose
  { accent: "129 140 248", accentAlt: "56 189 248" }, // indigo -> sky
];

/** Leading 4-digit year from strings like "2022 - 2026" or "Mar 2026 - May 2026". */
function startYear(period: string): number {
  const match = period.match(/(\d{4})/);
  return match ? Number(match[1]) : 0;
}

/** Pulls a chartable number out of "CGPA: 7.37/10" or "Percentage: 85.60%". */
function scoreFromLabel(label: string): number | undefined {
  const outOf = label.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (outOf) {
    const value = (Number(outOf[1]) / Number(outOf[2])) * 100;
    return Number.isFinite(value) ? value : undefined;
  }
  const percent = label.match(/([\d.]+)\s*%/);
  if (percent) {
    const value = Number(percent[1]);
    return Number.isFinite(value) ? value : undefined;
  }
  return undefined;
}

/** One milestone row. Tracks its own in-view state so the node halo and card
    wash fire on scroll - hover alone would leave touch users with nothing. */
function RunwayMilestone({ item, index }: { item: RunwayItem; index: number }) {
  const ref = useRef<HTMLLIElement | null>(null);
  const active = useInView(ref, { amount: 0.55, margin: "-12% 0px -28% 0px" });

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * STAGGER.block, duration: DURATIONS.base, ease: EASE_STANDARD }}
      className="group relative"
      // Each milestone overrides the accent locally, so the node, border,
      // chips and score meter below all shift together.
      style={
        {
          "--accent-rgb": item.accent,
          "--accent-alt-rgb": item.accentAlt,
        } as CSSProperties
      }
    >
      <span
        aria-hidden="true"
        className={`runway-node absolute -left-[1.85rem] top-6 sm:-left-[2.35rem] ${
          active ? "runway-node-active" : ""
        }`}
      >
        <span className="runway-node-core" />
      </span>

      <article
        className={`runway-card surface grain-surface relative overflow-hidden rounded-[22px] p-5 md:p-6 ${
          active ? "runway-card-active" : ""
        }`}
      >
        {/* Ghost year, printed behind the content as a depth cue. */}
        <span aria-hidden="true" className="runway-year">
          {item.yearLabel}
        </span>

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="runway-kicker text-[10px] font-semibold uppercase tracking-[0.2em]">{item.kicker}</p>
            <h3 className="display-title mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
              {item.title}
            </h3>
            <p className="mt-1.5 text-sm text-white/72">
              {item.subtitle}
              {item.meta ? <span className="text-white/45"> - {item.meta}</span> : null}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="font-display text-xs tabular-nums text-white/50">{item.period}</span>
            <span className="runway-status rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em]">
              {item.status}
            </span>
          </div>
        </div>

        {item.description ? (
          <p className="relative mt-4 text-sm leading-7 text-white/58">{item.description}</p>
        ) : null}

        {/* Radial meter: the ring fills to the parsed score once in view. */}
        {typeof item.score === "number" ? (
          <div className="relative mt-4 flex items-center gap-3.5">
            <div
              className="conic-meter"
              style={{ "--value": active ? item.score : 0 } as CSSProperties}
              role="img"
              aria-label={`Score ${item.score.toFixed(1)} percent`}
            >
              <span className="font-display text-[13px] font-semibold tabular-nums text-white">
                {Math.round(item.score)}
                <span className="text-[9px] text-white/50">%</span>
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/45">
              {item.kind === "study" ? "Result" : "Score"}
            </span>
          </div>
        ) : null}

        {item.tags.length ? (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="impact-chip">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </motion.li>
  );
}

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

  const runwayRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start 0.85", "end 0.6"],
  });
  // Spring keeps the spine from snapping on fast scrolls.
  const spineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });
  // Comet rides the same spring, expressed as a percentage down the track.
  const sparkTop = useTransform(spineScale, (value) => `calc(${Math.min(Math.max(value, 0), 1) * 100}% - 0.25rem)`);

  // Span of the whole journey, earliest milestone to latest.
  const RUNWAY_SPAN = useMemo(() => {
    const years = [...EXPERIENCE_ITEMS.map((i) => startYear(i.period)), ...EDUCATION_ITEMS.map((i) => startYear(i.year))]
      .filter(Boolean);
    return years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;
  }, []);

  // Work and study become one chronological list, newest first, so the runway
  // reads as a single journey rather than two disconnected blocks.
  const RUNWAY_ITEMS = useMemo<RunwayItem[]>(() => {
    const work = EXPERIENCE_ITEMS.map((item) => ({
      id: `work-${item.company}-${item.role}`,
      kind: "work" as const,
      kicker: item.employmentType,
      title: item.role,
      subtitle: item.company,
      meta: item.location,
      period: item.period,
      status: "Completed",
      description: item.description,
      tags: item.skills,
      yearLabel: String(startYear(item.period)),
      sortYear: startYear(item.period),
    }));

    const study = EDUCATION_ITEMS.map((item) => ({
      id: `study-${item.degree}`,
      kind: "study" as const,
      kicker: "Education",
      title: item.degree,
      subtitle: item.institute,
      period: item.year,
      status: item.score,
      tags: [],
      yearLabel: String(startYear(item.year)),
      score: scoreFromLabel(item.score),
      sortYear: startYear(item.year),
    }));

    // Palette is assigned after sorting so colours run in visual order down the page.
    return [...work, ...study]
      .sort((a, b) => b.sortYear - a.sortYear)
      .map((item, index) => ({ ...item, ...RUNWAY_PALETTES[index % RUNWAY_PALETTES.length] }));
  }, []);

  return (
    <>
      <section id="about" className="section-backplate a mesh-ground mesh-a section-wrap px-5 pb-6 pt-4 sm:px-6 md:px-12">
        <span aria-hidden="true" className="section-rail">About</span>
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
            <p className="eyebrow-hand"><span className="section-number mr-2 align-middle" aria-hidden="true" /><span className="eyebrow-hand-underline">Origin Story</span></p>
            <div className="mt-4">
              <StaggerHeading
                as="h3"
                text="Security-first by habit."
                className="text-3xl font-semibold tracking-tight md:text-4xl"
              />
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#9ca3af]">
              Final-year CS student building full-stack products, then hardening them for real use.
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

      <section id="education" className="section-backplate b mesh-ground mesh-b section-wrap px-5 sm:px-6 md:px-12">
        <span aria-hidden="true" className="section-rail">Experience</span>
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="max-w-2xl"
          >
            <p className="eyebrow-hand">
              <span className="section-number mr-2 align-middle" aria-hidden="true" /><span className="eyebrow-hand-underline">Learning Runway</span>
            </p>
            <ScrambleText
              as="h2"
              text="The path so far"
              className="display-title text-gradient text-gradient-shimmer mt-3 block text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
            />
            <p className="mt-4 text-sm leading-7 text-white/60">
              Where studying stopped being theory and turned into shipped work.
            </p>

            {/* Counts come straight from the runway data, so they cannot drift. */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="runway-stat">
                <strong>{EXPERIENCE_ITEMS.length}</strong> role{EXPERIENCE_ITEMS.length === 1 ? "" : "s"}
              </span>
              <span className="runway-stat">
                <strong>{EDUCATION_ITEMS.length}</strong> qualifications
              </span>
              <span className="runway-stat">
                <strong>{RUNWAY_SPAN}</strong> years
              </span>
            </div>
          </motion.div>

          {/* One spine, one node per milestone. The lit portion tracks scroll,
              so the runway draws itself as the reader moves down it. */}
          <div ref={runwayRef} className="relative mt-10 pl-10 sm:pl-14">
            <div aria-hidden="true" className="runway-spine absolute bottom-2 left-[1.306rem] top-2 w-[3px] sm:left-[1.806rem]" />
            <motion.div
              aria-hidden="true"
              style={{ scaleY: spineScale }}
              className="runway-spine-lit absolute bottom-2 left-[1.306rem] top-2 w-[3px] origin-top sm:left-[1.806rem]"
            />
            {/* Comet head pinned to the end of the drawn line. */}
            <motion.span
              aria-hidden="true"
              style={{ top: sparkTop }}
              className="runway-spark absolute left-[1.15rem] z-10 sm:left-[1.65rem]"
            />

            <ol className="space-y-4">
              {RUNWAY_ITEMS.map((item, index) => (
                <RunwayMilestone key={item.id} item={item} index={index} />
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
