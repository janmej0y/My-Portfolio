"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { CSSProperties, useMemo, useRef, useState } from "react";
import ScrambleText from "@/components/ScrambleText";
import { useSpotlight } from "@/hooks/useSpotlight";
import { CERTIFICATIONS, SKILL_GROUPS } from "@/lib/data";
import type { Certification, CertificationField, Skill, SkillGroup } from "@/types/portfolio";
import { DURATIONS, EASE_STANDARD, STAGGER } from "@/lib/motion";

const DRIVE_LINK =
  "https://drive.google.com/drive/folders/173A6iPtgXG45KZc-uIHhHH7TXdQageUscgHL5Y2F8uKxgTbS4l8FsH8CAUsvCoI5Lpg4ooKH";

function levelLabel(level: number) {
  if (level >= 88) return "Expert";
  if (level >= 78) return "Advanced";
  if (level >= 68) return "Proficient";
  return "Working";
}

/**
 * Colour grade per subject area. Certificates group naturally by field, so the
 * grade carries real meaning rather than decorating each card at random.
 */
const CERT_FIELDS: Record<CertificationField, { label: string; accent: string; accentAlt: string }> = {
  security: { label: "Security", accent: "244 63 94", accentAlt: "251 146 60" }, // rose -> orange
  automation: { label: "Automation", accent: "56 189 248", accentAlt: "34 211 238" }, // sky -> cyan
  engineering: { label: "Engineering", accent: "45 212 191", accentAlt: "34 197 94" }, // teal -> green
  ai: { label: "AI / ML", accent: "167 139 250", accentAlt: "217 70 239" }, // violet -> fuchsia
};

/** Fields actually present in the data, in card order, with their counts. */
const certFieldLegend = (Object.keys(CERT_FIELDS) as CertificationField[])
  .map((field) => ({
    field,
    label: CERT_FIELDS[field].label,
    accent: CERT_FIELDS[field].accent,
    count: CERTIFICATIONS.filter((cert) => cert.field === field).length,
  }))
  .filter((entry) => entry.count > 0);

/**
 * One certificate. Animates itself into view and keeps its own hover state so
 * the sheen only runs on the card actually under the pointer.
 */
function CertificateCard({ cert, index }: { cert: Certification; index: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const grade = CERT_FIELDS[cert.field];
  const spotlight = useSpotlight<HTMLElement>();

  return (
    <motion.article
      ref={ref}
      {...spotlight}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{
        delay: index * STAGGER.card,
        duration: DURATIONS.base,
        ease: EASE_STANDARD,
      }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      style={
        {
          "--accent-rgb": grade.accent,
          "--accent-alt-rgb": grade.accentAlt,
        } as CSSProperties
      }
      className="cert-card surface conic-border grain-surface spotlight-card group relative flex h-full flex-col overflow-hidden rounded-[20px] p-6 pb-9"
    >
      {/* Sheen sweeps across on hover; purely decorative. */}
      <span aria-hidden="true" className="cert-sheen" />

      <div className="relative flex items-start justify-between gap-3">
        <span className="icon-pill cert-pill w-fit">
          <span className="cert-icon grid h-9 w-9 place-items-center rounded-full">
            <Image src={cert.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </span>
          <span className="cert-field text-[10px] font-semibold uppercase tracking-[0.14em]">{grade.label}</span>
        </span>
      </div>

      <h3 className="relative mt-4 text-lg font-medium leading-snug">{cert.title}</h3>
      <p className="relative mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
        {cert.issuer}
      </p>
      <p className="relative mt-3 flex-1 text-sm leading-6 text-[#9ca3af]">{cert.description}</p>

      {/* Underline grows from the left as the card settles in. */}
      <motion.span
        aria-hidden="true"
        className="cert-rule"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : undefined}
        transition={{ delay: index * STAGGER.card + 0.2, duration: DURATIONS.slow, ease: EASE_STANDARD }}
      />
    </motion.article>
  );
}

/** Domain button on the left rail. Accent comes from the group so each layer reads distinctly. */
function DomainTab({
  group,
  active,
  onSelect,
}: {
  group: SkillGroup;
  active: boolean;
  onSelect: () => void;
}) {
  const top = Math.max(...group.items.map((item) => item.level));

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      style={{ "--group-accent": group.accent } as React.CSSProperties}
      className={`arsenal-tab group/tab relative w-full overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition ${
        active ? "arsenal-tab-active" : "border-white/10 bg-black/20 hover:border-white/20"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="arsenal-tab-glow"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(var(--group-accent) / 0.20), rgba(var(--group-accent) / 0.04) 62%)",
          }}
          transition={{ duration: 0.36, ease: EASE_STANDARD }}
        />
      ) : null}

      <span className="relative flex items-center gap-3">
        <span
          aria-hidden
          className="h-9 w-1 shrink-0 rounded-full transition-all"
          style={{
            background: active
              ? "rgb(var(--group-accent))"
              : "rgba(var(--group-accent) / 0.34)",
            boxShadow: active ? "0 0 14px rgba(var(--group-accent) / 0.65)" : "none",
          }}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] uppercase tracking-[0.2em] text-white/45">{group.kicker}</span>
          <span className="mt-1 block truncate text-sm font-semibold text-white">{group.title}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end">
          <span className="text-sm font-semibold tabular-nums text-white">{group.items.length}</span>
          <span className="text-[9px] uppercase tracking-[0.14em] text-white/55">peak {top}</span>
        </span>
      </span>
    </button>
  );
}

/** One tool: symbol, how it is used, and an animated proficiency meter. */
function SkillTile({ skill, accent, index }: { skill: Skill; accent: string; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.36, ease: EASE_STANDARD }}
      style={{ "--group-accent": accent } as React.CSSProperties}
      className="arsenal-tile group/tile relative overflow-hidden rounded-2xl border border-white/10 bg-black/22 p-4"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 h-24 opacity-0 blur-2xl transition-opacity duration-300 group-hover/tile:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(var(--group-accent) / 0.5), transparent 70%)" }}
      />

      <div className="relative flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 transition-transform duration-300 group-hover/tile:scale-105"
          style={{ boxShadow: "inset 0 0 18px rgba(var(--group-accent) / 0.18)" }}
        >
          <Image
            src={skill.icon}
            alt=""
            width={22}
            height={22}
            className={`h-[22px] w-[22px] object-contain ${skill.invert ? "invert invert-on-dark" : ""}`}
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold text-white">{skill.name}</p>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              {levelLabel(skill.level)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/58">{skill.note}</p>
        </div>
      </div>

      <div className="relative mt-3.5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: reduceMotion ? `${skill.level}%` : 0 }}
            animate={{ width: `${skill.level}%` }}
            transition={{ delay: 0.12 + index * 0.035, duration: 0.7, ease: EASE_STANDARD }}
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(var(--group-accent) / 0.45), rgb(var(--group-accent)))",
              boxShadow: "0 0 12px rgba(var(--group-accent) / 0.5)",
            }}
          />
        </div>
        <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums text-white/70">
          {skill.level}
        </span>
      </div>
    </motion.li>
  );
}

export default function Skills() {
  const [activeId, setActiveId] = useState(SKILL_GROUPS[0]?.id ?? "");

  const activeGroup = useMemo(
    () => SKILL_GROUPS.find((group) => group.id === activeId) ?? SKILL_GROUPS[0],
    [activeId],
  );

  const totalTools = useMemo(
    () => SKILL_GROUPS.reduce((sum, group) => sum + group.items.length, 0),
    [],
  );

  const expertCount = useMemo(
    () => SKILL_GROUPS.reduce((sum, group) => sum + group.items.filter((i) => i.level >= 85).length, 0),
    [],
  );

  const dbCount = useMemo(
    () => SKILL_GROUPS.find((group) => group.id === "database")?.items.length ?? 0,
    [],
  );

  // Marquee needs the list twice so the -50% translation loops seamlessly.
  const marqueeItems = useMemo(() => {
    const all = SKILL_GROUPS.flatMap((group) => group.items.map((item) => ({ ...item, accent: group.accent })));
    return [...all, ...all];
  }, []);

  return (
    <>
      <section id="skills" className="section-backplate c section-wrap px-5 sm:px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <p className="eyebrow-hand"><span className="eyebrow-hand-underline">Arsenal</span></p>
              <h2 className="display-title mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                Pixels to packets
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Pick a layer to see what I use and how deep it runs.
              </p>
            </div>

            <dl className="grid w-full max-w-md grid-cols-3 gap-3 lg:w-auto">
              {[
                { label: "Tools", value: totalTools },
                { label: "Databases", value: dbCount },
                { label: "Core Strength", value: expertCount },
              ].map((stat) => (
                <div key={stat.label} className="metric-card px-3 py-3 text-center">
                  <dd className="display-title text-2xl font-semibold tabular-nums text-white">{stat.value}</dd>
                  <dt className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/45">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="mt-9 grid gap-4 lg:grid-cols-[minmax(240px,300px)_1fr]"
          >
            {/* Domain rail: horizontal scroll strip on mobile, vertical list on desktop. */}
            <div
              // These are aria-pressed toggle buttons, not ARIA tabs (there are
              // no tabpanels and no arrow-key roving focus), and role="tablist"
              // additionally requires direct tab children - which the layout
              // wrapper prevents. A labelled group is the accurate role.
              role="group"
              aria-label="Skill domains"
              className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {SKILL_GROUPS.map((group) => (
                <div key={group.id} className="min-w-[210px] lg:min-w-0">
                  <DomainTab
                    group={group}
                    active={group.id === activeGroup?.id}
                    onSelect={() => setActiveId(group.id)}
                  />
                </div>
              ))}
            </div>

            {/* Detail panel for the selected domain. */}
            {activeGroup ? (
              <div
                style={{ "--group-accent": activeGroup.accent } as React.CSSProperties}
                className="surface relative overflow-hidden rounded-[28px] p-5 sm:p-6"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60 blur-3xl"
                  style={{ background: "radial-gradient(circle, rgba(var(--group-accent) / 0.28), transparent 70%)" }}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeGroup.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: EASE_STANDARD }}
                    className="relative"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                          style={{ color: "rgb(var(--group-accent))" }}
                        >
                          {activeGroup.kicker}
                        </p>
                        <h3 className="display-title mt-2 text-2xl font-semibold text-white sm:text-3xl">
                          {activeGroup.title}
                        </h3>
                      </div>
                      <span className="accent-pill px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
                        {activeGroup.items.length} Tools
                      </span>
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{activeGroup.summary}</p>

                    <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {activeGroup.items.map((skill, index) => (
                        <SkillTile key={skill.name} skill={skill} accent={activeGroup.accent} index={index} />
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : null}
          </motion.div>

          {/* Full-stack ticker: every symbol in one continuous pass. */}
          <div className="arsenal-marquee mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/20 py-3">
            <div className="arsenal-marquee-track flex w-max items-center gap-3">
              {marqueeItems.map((item, index) => (
                <span
                  key={`${item.name}-${index}`}
                  style={{ "--group-accent": item.accent } as React.CSSProperties}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={14}
                    height={14}
                    className={`h-3.5 w-3.5 object-contain ${item.invert ? "invert invert-on-dark" : ""}`}
                  />
                  <span className="text-[11px] font-medium whitespace-nowrap text-white/72">{item.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="certifications" className="section-backplate a mesh-ground mesh-d section-wrap px-5 pt-0 sm:px-6 md:px-12">
        <span aria-hidden="true" className="section-rail">Proof</span>
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="eyebrow-hand"><span className="section-number mr-2 align-middle" aria-hidden="true" /><span className="eyebrow-hand-underline">Proof Stack</span></p>
              <ScrambleText
                as="h2"
                text="Certificates"
                className="display-title text-gradient text-gradient-shimmer mt-3 block text-4xl font-semibold tracking-tight"
              />
              {/* Legend makes the colour grade readable instead of decorative. */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {certFieldLegend.map((entry) => (
                  <span
                    key={entry.field}
                    style={{ "--accent-rgb": entry.accent } as CSSProperties}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45"
                  >
                    <span className="cert-legend-dot" />
                    {entry.label}
                    <span className="text-white/28">{entry.count}</span>
                  </span>
                ))}
              </div>
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
              <CertificateCard key={cert.title} cert={cert} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
