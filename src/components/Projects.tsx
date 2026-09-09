"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import StaggerHeading from "@/components/StaggerHeading";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useSpotlight } from "@/hooks/useSpotlight";
import { PROJECTS } from "@/lib/data";
import { mergeProjects, type SyncedProject } from "@/lib/github-projects";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";
import type { Project, ProjectCategory } from "@/types/portfolio";

const filters: ProjectCategory[] = ["all", "web", "app", "tools"];

const styles: Record<
  Exclude<ProjectCategory, "all">,
  { ring: string; badge: string; glow: string; dot: string; accent: string; accentAlt: string }
> = {
  web: {
    ring: "border-cyan-300/35",
    badge: "text-cyan-100",
    glow: "from-cyan-400/22 via-sky-300/10 to-transparent",
    dot: "bg-cyan-300",
    // Drives the duotone tint, cursor spotlight and conic border on the card.
    accent: "34 211 238",
    accentAlt: "56 189 248",
  },
  app: {
    ring: "border-fuchsia-300/35",
    badge: "text-fuchsia-100",
    glow: "from-fuchsia-400/22 via-pink-300/10 to-transparent",
    dot: "bg-fuchsia-300",
    accent: "217 70 239",
    accentAlt: "244 114 182",
  },
  tools: {
    ring: "border-emerald-300/35",
    badge: "text-emerald-100",
    glow: "from-emerald-400/22 via-teal-300/10 to-transparent",
    dot: "bg-emerald-300",
    accent: "45 212 191",
    accentAlt: "34 197 94",
  },
};

function getStats(project: Project) {
  return [
    { label: "Category", value: project.category.toUpperCase() },
    { label: "Stack", value: project.tech.slice(0, 2).join(" + ") || "N/A" },
    { label: "Impact", value: project.metrics?.[0] ?? "Reliable delivery" },
  ];
}

/**
 * The single project that leads the showcase - it gets a full-width spotlight
 * row with the image beside the detail, rather than stacked above it.
 */
const SPOTLIGHT_KEY = "vampforge";

/**
 * Projects that follow the spotlight in a two-up row. Anything not named
 * here or above drops into the compact grid.
 */
const FEATURED_KEYS = ["tapas-grocery", "comodex"];

function CategoryBadge({ project, className = "" }: { project: Project; className?: string }) {
  const style = styles[project.category];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border ${style.ring} bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${style.badge} backdrop-blur ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {project.category}
    </span>
  );
}

/** Small icon links that sit inside a card without competing with it. */
function QuickLinks({ project, onActivate }: { project: Project; onActivate: () => void }) {
  const base =
    "pointer-events-auto inline-flex h-9 min-h-0 items-center gap-1.5 rounded-full border border-white/18 bg-black/55 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur transition hover:border-white/40 hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {project.liveUrl ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          data-cursor="Live"
          onClick={(event) => {
            event.stopPropagation();
            onActivate();
          }}
          className={base}
          aria-label={`Open the live demo of ${project.title}`}
        >
          <span aria-hidden="true">↗</span>
          Live
        </a>
      ) : null}
      <a
        href={project.githubUrl}
        target="_blank"
        rel="noreferrer"
        data-cursor="Code"
        onClick={(event) => {
          event.stopPropagation();
          onActivate();
        }}
        className={base}
        aria-label={`Open the source code of ${project.title}`}
      >
        <span aria-hidden="true">{"</>"}</span>
        Code
      </a>
    </div>
  );
}

/**
 * Lead card: image and detail sit side by side so the strongest project reads
 * as an editorial feature rather than one more tile in the grid.
 */
function SpotlightProjectCard({
  project,
  onOpen,
  onActivate,
}: {
  project: Project;
  onOpen: () => void;
  onActivate: () => void;
}) {
  const style = styles[project.category];
  const resultLine = project.resultLine ?? "Shipped with a cleaner product experience.";
  const spotlight = useSpotlight<HTMLElement>();

  return (
    <motion.article
      layout
      {...spotlight}
      style={{ "--accent-rgb": style.accent, "--accent-alt-rgb": style.accentAlt } as CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      data-cursor="Open"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`View details for ${project.title}`}
      className={`project-card project-spotlight conic-border conic-border-always grain-surface spotlight-card crt-surface group relative grid cursor-pointer overflow-hidden rounded-[32px] border ${style.ring} bg-[linear-gradient(180deg,rgba(7,12,24,0.96),rgba(3,8,18,0.92))] shadow-[0_30px_70px_rgba(2,6,23,0.4)] outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 lg:grid-cols-[1.15fr_1fr]`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />

      <div className="duotone-wrap relative min-h-[230px] overflow-hidden lg:min-h-[380px]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="duotone clip-reveal-angled object-cover transition duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
        />
        {/* Fade runs downward on mobile and rightward once side by side, so the
            join between image and panel never shows a hard edge. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,18,0.08),rgba(3,8,18,0.55)_70%,rgba(3,8,18,0.95))] lg:bg-[linear-gradient(90deg,rgba(3,8,18,0.15),rgba(3,8,18,0.35)_60%,rgba(3,8,18,0.95))]" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <CategoryBadge project={project} />
          <span className="project-spotlight-tag">Flagship</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col justify-center gap-4 p-6 md:p-8">
        <div>
          <h3 className="display-title text-2xl font-semibold tracking-tight text-white md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-cyan-100/85 md:text-base">{resultLine}</p>
        </div>

        <p className="text-sm leading-7 text-white/68">{project.shortDescription}</p>

        {project.highlights?.length ? (
          <ul className="grid gap-2">
            {project.highlights.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-6 text-white/72">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {project.tech.slice(0, 5).map((tech) => (
            <span key={`${project.key}-${tech}`} className="impact-chip">
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-1 border-t border-white/10 pt-4">
          <QuickLinks project={project} onActivate={onActivate} />
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Large card for the strongest projects: bigger image, room for the result
 * line and a couple of highlights.
 */
function FeaturedProjectCard({
  project,
  onOpen,
  onActivate,
}: {
  project: Project;
  onOpen: () => void;
  onActivate: () => void;
}) {
  const style = styles[project.category];
  const resultLine = project.resultLine ?? "Shipped with a cleaner product experience.";
  const spotlight = useSpotlight<HTMLElement>();

  return (
    <motion.article
      layout
      {...spotlight}
      style={{ "--accent-rgb": style.accent, "--accent-alt-rgb": style.accentAlt } as CSSProperties}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      whileHover={{ y: -6 }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      data-cursor="Open"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`View details for ${project.title}`}
      className={`project-card conic-border grain-surface spotlight-card group relative flex cursor-pointer flex-col overflow-hidden rounded-[30px] border ${style.ring} bg-[linear-gradient(180deg,rgba(7,12,24,0.96),rgba(3,8,18,0.92))] shadow-[0_24px_60px_rgba(2,6,23,0.34)] outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-300/60`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />

      <div className="duotone-wrap relative">
        <Image
          src={project.image}
          alt={project.title}
          width={1200}
          height={900}
          className="duotone clip-reveal aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,18,0.05),rgba(3,8,18,0.35)_52%,rgba(0,0,0,0.88))]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <CategoryBadge project={project} />
          <span className="rounded-full border border-white/18 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur">
            Featured
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="display-title text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {project.title}
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-cyan-100/85">{resultLine}</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-4 p-5">
        <p className="text-sm leading-7 text-white/70">{project.shortDescription}</p>

        {project.highlights?.length ? (
          <ul className="grid gap-2">
            {project.highlights.slice(0, 2).map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-6 text-white/72">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 3).map((tech) => (
              <span key={`${project.key}-${tech}`} className="impact-chip">
                {tech}
              </span>
            ))}
          </div>
          <QuickLinks project={project} onActivate={onActivate} />
        </div>
      </div>
    </motion.article>
  );
}

/** Compact card for the rest of the catalogue. */
function CompactProjectCard({
  project,
  onOpen,
  onActivate,
}: {
  project: Project;
  onOpen: () => void;
  onActivate: () => void;
}) {
  const style = styles[project.category];
  const resultLine = project.resultLine ?? "Shipped with a cleaner product experience.";
  const spotlight = useSpotlight<HTMLElement>();

  return (
    <motion.article
      layout
      {...spotlight}
      style={{ "--accent-rgb": style.accent, "--accent-alt-rgb": style.accentAlt } as CSSProperties}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      whileHover={{ y: -4 }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      data-cursor="Open"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`View details for ${project.title}`}
      className="project-card spotlight-card grain-surface group relative flex cursor-pointer flex-col overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(7,12,24,0.94),rgba(3,8,18,0.9))] shadow-[0_18px_44px_rgba(2,6,23,0.28)] outline-none transition hover:border-white/25 focus-visible:ring-2 focus-visible:ring-cyan-300/60"
    >
      <div className="duotone-wrap relative">
        <Image
          src={project.image}
          alt={project.title}
          width={800}
          height={600}
          className="duotone clip-reveal aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,18,0.05),rgba(3,8,18,0.3)_58%,rgba(0,0,0,0.8))]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <CategoryBadge project={project} />
          {"source" in project && (project as { source?: string }).source === "github" ? (
            <span className="rounded-full border border-white/20 bg-black/55 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/70 backdrop-blur-sm">
              Synced
            </span>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
          <h3 className="display-title text-base font-semibold leading-tight tracking-tight text-white">
            {project.title}
          </h3>
          <span
            aria-hidden="true"
            className="shrink-0 translate-x-1 text-sm text-white/0 transition duration-300 group-hover:translate-x-0 group-hover:text-white/80"
          >
            →
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <p className="line-clamp-2 text-xs leading-6 text-cyan-100/72">{resultLine}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
            {project.tech.slice(0, 2).join(" · ")}
          </span>
          <QuickLinks project={project} onActivate={onActivate} />
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [synced, setSynced] = useState<SyncedProject[]>([]);
  const { play } = useSoundEffects();

  useEffect(() => setMounted(true), []);

  // Repos tagged with the portfolio topic on GitHub are pulled in at runtime.
  // A failure here is non-fatal: the curated list still renders on its own.
  useEffect(() => {
    let active = true;

    fetch("/api/github-projects")
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data?.success || !Array.isArray(data.projects)) return;
        setSynced(data.projects as SyncedProject[]);
      })
      .catch(() => {
        /* keep the curated list as-is */
      });

    return () => {
      active = false;
    };
  }, []);

  const allProjects = useMemo(() => mergeProjects(PROJECTS, synced), [synced]);

  // Counts drive the filter pills, so an empty category never renders a
  // button the user can click into a dead end.
  const categoryCounts = useMemo(() => {
    return allProjects.reduce<Record<string, number>>((acc, project) => {
      acc[project.category] = (acc[project.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [allProjects]);

  const visible = useMemo(
    () => allProjects.filter((project) => activeFilter === "all" || project.category === activeFilter),
    [activeFilter, allProjects],
  );

  // Three tiers: one spotlight, a two-up feature row, then the grid. Tiers
  // only pay off when enough projects remain beneath them, so under a narrow
  // filter everything collapses back to one uniform grid.
  const { spotlight, featured, rest } = useMemo(() => {
    const flat = { spotlight: null as Project | null, featured: [] as Project[], rest: visible };
    if (visible.length < 6) return flat;

    const lead = visible.find((project) => project.key === SPOTLIGHT_KEY) ?? null;
    if (!lead) return flat;

    const picks = FEATURED_KEYS.map((key) => visible.find((project) => project.key === key)).filter(
      (project): project is Project => Boolean(project),
    );
    if (picks.length < FEATURED_KEYS.length) return flat;

    const used = new Set([lead.key, ...picks.map((project) => project.key)]);
    return { spotlight: lead, featured: picks, rest: visible.filter((project) => !used.has(project.key)) };
  }, [visible]);

  const selectedProject = useMemo(
    () => allProjects.find((project) => project.key === selectedKey) ?? null,
    [allProjects, selectedKey],
  );
  const selectedScreenshots = selectedProject?.screenshots?.length ? selectedProject.screenshots : selectedProject ? [selectedProject.image] : [];

  const openProject = (key: string) => {
    play("open");
    setSelectedKey(key);
    setSelectedSlide(0);
  };

  // Hold the page still behind the dialog and let Escape dismiss it.
  useEffect(() => {
    if (!selectedKey) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedKey(null);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedKey]);

  const liveCount = visible.filter((item) => item.liveUrl).length;

  const modal =
    mounted && typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {selectedProject ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATIONS.fast, ease: EASE_STANDARD }}
                onClick={() => {
                  play("tap");
                  setSelectedKey(null);
                }}
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4"
              >
                <motion.div
                  initial={{ y: 26, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 26, opacity: 0 }}
                  transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
                  onClick={(event) => event.stopPropagation()}
                  className="surface max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl p-4 sm:p-6"
                >
                  <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 bg-black/72 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6">
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold sm:text-2xl">{selectedProject.title}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/55">
                        Screenshot {selectedSlide + 1} of {selectedScreenshots.length}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        play("tap");
                        setSelectedKey(null);
                      }}
                      className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85"
                    >
                      Close
                    </button>
                  </div>

                  <div className="showcase-shell media-frame relative mt-1 overflow-hidden rounded-xl border border-white/15">
                    <div className="relative h-56 sm:h-72">
                      <Image
                        src={selectedScreenshots[selectedSlide]}
                        alt={`${selectedProject.title} screenshot ${selectedSlide + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 760px"
                      />
                    </div>
                  </div>

                  {selectedScreenshots.length > 1 ? (
                    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {selectedScreenshots.map((shot, index) => (
                        <button
                          key={`${shot}-${index}`}
                          type="button"
                          onClick={() => {
                            play("tap");
                            setSelectedSlide(index);
                          }}
                          className={`showcase-shell media-frame relative h-14 overflow-hidden rounded-md border ${
                            selectedSlide === index ? "border-cyan-300/70" : "border-white/15"
                          }`}
                          aria-label={`View screenshot ${index + 1}`}
                        >
                          <Image src={shot} alt={`${selectedProject.title} thumbnail ${index + 1}`} fill className="object-cover" sizes="120px" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <p className="mt-5 text-[#9ca3af]">{selectedProject.longDescription}</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {getStats(selectedProject).map((item) => (
                      <div key={`modal-${item.label}`} className="rounded-lg border border-white/10 bg-black/28 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">{item.label}</p>
                        <p className="mt-1 text-xs font-medium text-white/90">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {selectedProject.highlights?.length ? (
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">Key Features</p>
                      <ul className="mt-2 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
                        {selectedProject.highlights.map((item) => (
                          <li key={item} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 leading-6">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {selectedProject.architecture ? (
                    <div className="mt-5 rounded-2xl border border-cyan-300/18 bg-cyan-400/[0.06] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Architecture</p>
                      <p className="mt-2 font-mono text-sm leading-7 text-cyan-50/88">{selectedProject.architecture}</p>
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                    {selectedProject.liveUrl ? (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => play("open")}
                        className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black"
                      >
                        Live Demo
                      </a>
                    ) : null}
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => play("open")}
                      className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                    >
                      Source Code
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <section id="projects" className="section-backplate b mesh-ground mesh-c section-wrap px-5 sm:px-6 md:px-12">
        <span aria-hidden="true" className="section-rail">Work</span>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl">
            <p className="eyebrow-hand"><span className="section-number mr-2 align-middle" aria-hidden="true" /><span className="eyebrow-hand-underline">Project Showcase</span></p>
            <StaggerHeading
              text="Selected work"
              className="display-title text-gradient text-gradient-shimmer mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
            />
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
              {allProjects.length} projects, {liveCount} live. Open any card for the full breakdown.
            </p>
          </div>

          <div className="project-filter-row flex flex-wrap gap-2 lg:justify-end">
            {filters.map((filter) => {
              const count = filter === "all" ? allProjects.length : categoryCounts[filter] ?? 0;
              if (!count) return null;
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    play("tap");
                    setActiveFilter(filter);
                  }}
                  aria-pressed={isActive}
                  className={`project-filter ${isActive ? "project-filter-active" : ""}`}
                >
                  {filter}
                  <span className="project-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {visible.length ? (
          <motion.div layout>
            {spotlight ? (
              <div className="mt-9">
                <SpotlightProjectCard
                  key={spotlight.key}
                  project={spotlight}
                  onOpen={() => openProject(spotlight.key)}
                  onActivate={() => play("open")}
                />
              </div>
            ) : null}

            {featured.length ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {featured.map((project) => (
                  <FeaturedProjectCard
                    key={project.key}
                    project={project}
                    onOpen={() => openProject(project.key)}
                    onActivate={() => play("open")}
                  />
                ))}
              </div>
            ) : null}

            {rest.length ? (
              <>
                {spotlight || featured.length ? (
                  <div className="mt-12 flex items-center gap-4">
                    <p className="eyebrow-hand shrink-0">
                      <span className="eyebrow-hand-underline">More Work</span>
                    </p>
                    <span className="h-px flex-1 bg-gradient-to-r from-white/18 to-transparent" />
                    <span className="shrink-0 font-display text-xs tabular-nums text-white/40">
                      {rest.length}
                    </span>
                  </div>
                ) : null}
                <div
                  className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
                    spotlight || featured.length ? "mt-6" : "mt-9"
                  }`}
                >
                  {rest.map((project) => (
                    <CompactProjectCard
                      key={project.key}
                      project={project}
                      onOpen={() => openProject(project.key)}
                      onActivate={() => play("open")}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </motion.div>
        ) : (
          <p className="mt-10 text-center text-sm text-white/60">No projects in this category yet.</p>
        )}
      </div>

      {modal}
    </section>
  );
}