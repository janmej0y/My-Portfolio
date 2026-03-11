"use client";

import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import StaggerHeading from "@/components/StaggerHeading";
import { PROJECTS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";
import type { Project, ProjectCategory } from "@/types/portfolio";

const filters: ProjectCategory[] = ["all", "web", "app", "tools"];

const categoryStyle: Record<Exclude<ProjectCategory, "all">, { ring: string; badge: string; glow: string }> = {
  web: {
    ring: "border-cyan-300/35",
    badge: "text-cyan-100",
    glow: "from-cyan-400/24 via-sky-300/10 to-transparent",
  },
  app: {
    ring: "border-fuchsia-300/35",
    badge: "text-fuchsia-100",
    glow: "from-fuchsia-400/24 via-pink-300/10 to-transparent",
  },
  tools: {
    ring: "border-emerald-300/35",
    badge: "text-emerald-100",
    glow: "from-emerald-400/24 via-teal-300/10 to-transparent",
  },
};

function getStatusChips(project: Project) {
  const chips = new Set<string>();
  chips.add("Shipped");

  const joined = project.tech.join(" ").toLowerCase();
  if (/jwt|security|auth|linux|python/.test(joined)) chips.add("Security");
  if (project.highlights?.length || project.metrics?.length) chips.add("Detailed");
  if (project.liveUrl) chips.add("Live");

  return Array.from(chips).slice(0, 3);
}

function getProjectStats(project: Project) {
  return [
    { label: "Stack", value: project.tech.slice(0, 2).join(" + ") || "N/A" },
    { label: "Mode", value: project.category.toUpperCase() },
    { label: "Impact", value: project.metrics?.[0] ?? "Reliable delivery" },
  ];
}

function BundleCard({
  project,
  index,
  total,
  progress,
  expanded,
  active,
  onSelect,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  expanded: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const style = categoryStyle[project.category];
  const statusChips = getStatusChips(project);

  const start = index / Math.max(total, 1);
  const enter = Math.min(start + 0.18, 0.92);
  const settle = Math.min(start + 0.34, 1);

  const collapsedX = useTransform(progress, [0, start, enter, settle, 1], [0, 0, (index % 2 === 0 ? -1 : 1) * (90 + index * 26), (index % 2 === 0 ? -1 : 1) * (90 + index * 26), (index % 2 === 0 ? -1 : 1) * (90 + index * 26)]);
  const collapsedY = useTransform(progress, [0, start, enter, settle, 1], [0, 0, index * 54 - 60, index * 54 - 60, index * 54 - 60]);
  const collapsedRotate = useTransform(progress, [0, start, enter, settle, 1], [-8 + index * 2.5, -8 + index * 2.5, (index % 2 === 0 ? -1 : 1) * (7 + index * 1.8), (index % 2 === 0 ? -1 : 1) * (7 + index * 1.8), (index % 2 === 0 ? -1 : 1) * (7 + index * 1.8)]);
  const collapsedScale = useTransform(progress, [0, start, enter, settle, 1], [0.74, 0.74, 0.96, 0.96, 0.96]);
  const collapsedOpacity = useTransform(progress, [0, start, enter, settle, 1], [0.14, 0.14, 0.95, 0.95, 0.95]);

  const column = index % 2;
  const row = Math.floor(index / 2);
  const expandedX = column === 0 ? -280 : 280;
  const expandedY = row * 220 - 180;
  const expandedRotate = column === 0 ? -7 : 7;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      style={
        expanded
          ? undefined
          : {
              x: collapsedX,
              y: collapsedY,
              rotate: collapsedRotate,
              scale: collapsedScale,
              opacity: collapsedOpacity,
            }
      }
      animate={
        expanded
          ? {
              x: expandedX,
              y: expandedY,
              rotate: expandedRotate,
              scale: 1,
              opacity: 1,
            }
          : undefined
      }
      transition={{ duration: 0.65, ease: EASE_STANDARD }}
      whileHover={expanded ? { y: -10, scale: 1.02 } : undefined}
      className={`absolute left-1/2 top-1/2 h-[260px] w-[min(82vw,360px)] -translate-x-1/2 -translate-y-1/2 text-left md:h-[290px] md:w-[420px] ${active ? "z-30" : "z-10"}`}
    >
      <motion.div
        layoutId={`vault-card-${project.key}`}
        className={`relative h-full overflow-hidden rounded-[28px] border shadow-[0_28px_72px_rgba(2,6,23,0.44)] backdrop-blur-md ${style.ring}`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,18,34,0.96),rgba(4,9,18,0.92))]" />
        <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />
        <motion.div
          aria-hidden="true"
          animate={active ? { opacity: [0.14, 0.32, 0.14] } : { opacity: 0.08 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
        />

        <div className="relative flex h-full flex-col p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Vault Item {String(index + 1).padStart(2, "0")}</p>
            <span className={`mt-2 inline-flex rounded-full border ${style.ring} bg-black/24 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${style.badge}`}>
              {project.category}
            </span>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {statusChips.map((chip) => (
              <span key={`${project.key}-${chip}`} className="rounded-full border border-white/12 bg-black/26 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/68">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[20px] border border-white/10">
          <motion.div layoutId={`vault-image-${project.key}`} className="relative">
            <Image src={project.image} alt={project.title} width={1200} height={800} className="h-28 w-full object-cover md:h-32" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        </div>

        <div className="mt-4 flex-1">
          <motion.h3 layoutId={`vault-title-${project.key}`} className="display-title text-xl font-semibold text-white md:text-2xl">
            {project.title}
          </motion.h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/72">{project.shortDescription}</p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 3).map((tech) => (
              <span key={`${project.key}-${tech}`} className="rounded-full border border-white/12 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60">
                {tech}
              </span>
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            Open
          </span>
        </div>
      </div>
      </motion.div>
    </motion.button>
  );
}

function ProjectDrawer({
  project,
  onView,
}: {
  project: Project | null;
  onView: () => void;
}) {
  if (!project) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/28 p-6 text-white/55">
        The active project details will appear here.
      </div>
    );
  }

  return (
    <motion.div
      key={project.key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      className="p-0"
    >
      <motion.div
        layoutId={`vault-card-${project.key}`}
        className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(9,16,29,0.96),rgba(4,9,18,0.92))] p-5 shadow-[0_22px_60px_rgba(2,6,23,0.34)]"
      >
        <div className="relative mb-5 overflow-hidden rounded-[22px] border border-white/10">
          <motion.div layoutId={`vault-image-${project.key}`} className="relative">
            <Image src={project.image} alt={project.title} width={1200} height={800} className="h-44 w-full object-cover md:h-52" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border ${categoryStyle[project.category].ring} bg-black/24 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${categoryStyle[project.category].badge}`}>
            Active Vault Entry
          </span>
          {getStatusChips(project).map((chip) => (
            <span key={`drawer-${chip}`} className="rounded-full border border-white/12 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/66">
              {chip}
            </span>
          ))}
        </div>
        <motion.h3 layoutId={`vault-title-${project.key}`} className="display-title mt-4 text-2xl font-semibold text-white md:text-3xl">
          {project.title}
        </motion.h3>
        <p className="mt-3 text-sm leading-7 text-white/74">{project.longDescription}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {getProjectStats(project).map((item) => (
            <div key={`${project.key}-${item.label}`} className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-white/90">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span key={`${project.key}-${tech}`} className="impact-chip">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button onClick={onView} className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black">
            Open Full Case
          </button>
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              Visit Live
            </a>
          ) : null}
          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Source
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("all");
  const [activeTech, setActiveTech] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [pulseTick, setPulseTick] = useState(0);
  const bundleRef = useRef<HTMLElement | null>(null);

  const techFilters = useMemo(() => {
    const all = PROJECTS.flatMap((project) => project.tech);
    return ["all", ...Array.from(new Set(all)).sort((a, b) => a.localeCompare(b))];
  }, []);

  const visible = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return PROJECTS.filter((project) => {
      const categoryPass = activeFilter === "all" || project.category === activeFilter;
      const techPass = activeTech === "all" || project.tech.includes(activeTech);
      const searchPass =
        !normalizedSearch ||
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.shortDescription.toLowerCase().includes(normalizedSearch) ||
        project.tech.some((tech) => tech.toLowerCase().includes(normalizedSearch));
      return categoryPass && techPass && searchPass;
    });
  }, [activeFilter, activeTech, searchQuery]);

  const { scrollYProgress } = useScroll({
    target: bundleRef,
    offset: ["start start", "end end"],
  });
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 30]);

  const filterCounts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return filters.reduce<Record<ProjectCategory, number>>((acc, filter) => {
      acc[filter] = PROJECTS.filter((project) => {
        const categoryPass = filter === "all" || project.category === filter;
        const techPass = activeTech === "all" || project.tech.includes(activeTech);
        const searchPass =
          !normalizedSearch ||
          project.title.toLowerCase().includes(normalizedSearch) ||
          project.shortDescription.toLowerCase().includes(normalizedSearch) ||
          project.tech.some((tech) => tech.toLowerCase().includes(normalizedSearch));
        return categoryPass && techPass && searchPass;
      }).length;
      return acc;
    }, { all: 0, web: 0, app: 0, tools: 0 });
  }, [activeTech, searchQuery]);

  const selectedProject = useMemo(() => PROJECTS.find((project) => project.key === selected) ?? null, [selected]);
  const selectedScreenshots = selectedProject?.screenshots?.length ? selectedProject.screenshots : selectedProject ? [selectedProject.image] : [];

  const focusedProject = useMemo(() => {
    if (focusedKey) return visible.find((project) => project.key === focusedKey) ?? visible[0] ?? null;
    return visible[0] ?? null;
  }, [focusedKey, visible]);

  useEffect(() => {
    setFocusedKey((prev) => (prev && visible.some((project) => project.key === prev) ? prev : visible[0]?.key ?? null));
  }, [visible]);

  useEffect(() => {
    if (!selectedProject) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelectedSlide((prev) => (prev + 1) % selectedScreenshots.length);
      if (event.key === "ArrowLeft") setSelectedSlide((prev) => (prev - 1 + selectedScreenshots.length) % selectedScreenshots.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProject, selectedScreenshots.length]);

  useEffect(() => {
    setSelectedSlide(0);
  }, [selected]);

  useEffect(() => {
    if (!expanded) return;
    setPulseTick((prev) => prev + 1);
  }, [expanded]);

  useEffect(() => {
    if (!focusedKey) return;
    setPulseTick((prev) => prev + 1);
  }, [focusedKey]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      if (!visible.length) return;
      const step = Math.min(visible.length - 1, Math.floor(value * visible.length));
      setFocusedKey(visible[step]?.key ?? visible[0]?.key ?? null);
    });
    return () => unsubscribe();
  }, [scrollYProgress, visible]);

  return (
    <section id="projects" className="section-backplate b section-wrap px-5 sm:px-6 md:px-12">
      <LayoutGroup>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[radial-gradient(circle_at_18%_14%,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.14),transparent_20%),linear-gradient(180deg,rgba(4,10,18,0.92),rgba(2,6,14,0.84))] p-5 md:p-7"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.18]" />
          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.32em] text-white/46">Build Archive</p>
                <StaggerHeading text="Projects released from a living stack" className="display-title mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Entries</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{visible.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Live</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{visible.filter((item) => item.liveUrl).length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Stacks</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{techFilters.length - 1}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 xl:flex-row">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                      activeFilter === filter ? "border-cyan-300/45 bg-cyan-400/[0.12] text-cyan-100" : "border-white/12 bg-black/18 text-white/68 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {filter} <span className="text-white/42">({filterCounts[filter]})</span>
                  </button>
                ))}
              </div>
              <div className="grid flex-1 gap-3 md:grid-cols-[1fr_220px_auto]">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search title, stack, impact..."
                  className="min-h-11 rounded-2xl border border-cyan-300/20 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] focus:border-cyan-300/45"
                  aria-label="Search projects"
                />
                <select
                  value={activeTech}
                  onChange={(event) => setActiveTech(event.target.value)}
                  className="min-h-11 appearance-none rounded-2xl border border-cyan-300/20 bg-[#07111d] px-4 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] focus:border-cyan-300/45"
                  aria-label="Filter by technology"
                >
                  {techFilters.map((tech) => (
                    <option key={tech} value={tech} className="bg-[#07111d] text-white">
                      {tech === "all" ? "All Technologies" : tech}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-2xl border border-cyan-300/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"
                >
                  {expanded ? "Close Vault" : "Open Vault"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {visible.length ? (
          <section ref={bundleRef} className="relative mt-8 min-h-[220vh]">
            <div className="sticky top-20 flex min-h-[calc(100vh-6rem)] items-start">
              <div className="grid w-full gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
                <div
                  className="relative min-h-[70vh] overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_30%),linear-gradient(180deg,rgba(4,10,18,0.84),rgba(2,6,14,0.74))]"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) setExpanded((prev) => !prev);
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.12]" />
                  <motion.div
                    aria-hidden="true"
                    style={{ rotate: ringRotate }}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/12"
                  />
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={`shockwave-${pulseTick}`}
                      aria-hidden="true"
                      initial={{ opacity: 0.42, scale: 0.2 }}
                      animate={{ opacity: 0, scale: 2.6 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: EASE_STANDARD }}
                      className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/45"
                    />
                  </AnimatePresence>
                  <AnimatePresence mode="popLayout">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <motion.span
                        key={`trail-${pulseTick}-${index}`}
                        aria-hidden="true"
                        initial={{ opacity: 0.85, scaleX: 0.3, scaleY: 0.8, rotate: index * 60 }}
                        animate={{
                          opacity: 0,
                          scaleX: 1.45,
                          scaleY: 1,
                          x: Math.cos((index / 6) * Math.PI * 2) * 92,
                          y: Math.sin((index / 6) * Math.PI * 2) * 92,
                          rotate: index * 60,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: EASE_STANDARD, delay: index * 0.03 }}
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[3px] w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300 via-white/80 to-transparent"
                      />
                    ))}
                  </AnimatePresence>
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/35 bg-cyan-300/10 blur-[2px]" />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl" />

                  <div className="absolute left-5 top-5 z-40 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">Vault State</p>
                    <p className="mt-2 text-sm font-medium text-white">{expanded ? "Expanded fan-out" : "Scroll release mode"}</p>
                  </div>

                  <div className="relative h-[70vh]">
                    {visible.map((project, index) => (
                      <BundleCard
                        key={project.key}
                        project={project}
                        index={index}
                        total={visible.length}
                        progress={scrollYProgress}
                        expanded={expanded}
                        active={focusedProject?.key === project.key}
                        onSelect={() => {
                          if (!expanded) {
                            setExpanded(true);
                            setFocusedKey(project.key);
                            return;
                          }
                          setFocusedKey(project.key);
                          setSelected(project.key);
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <ProjectDrawer project={focusedProject} onView={() => focusedProject && setSelected(focusedProject.key)} />
                  <div className="rounded-[28px] border border-white/10 bg-black/24 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">Vault Control</p>
                    <p className="mt-3 text-sm leading-7 text-white/70">
                      Scroll to release cards from the stack, or open the vault to spread the full collection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <p className="mt-10 text-center text-sm text-white/60">No projects match your current search.</p>
        )}

        <div className="mt-8 flex justify-center">
          <a
            href="https://github.com/janmej0y"
            target="_blank"
            rel="noreferrer"
            className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/35 px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"
          >
            View All on GitHub
          </a>
        </div>
      </div>
      </LayoutGroup>

      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATIONS.fast, ease: EASE_STANDARD }}
            onClick={() => setSelected(null)}
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
                  <motion.h3 layoutId={`vault-title-${selectedProject.key}`} className="text-xl font-semibold sm:text-2xl">
                    {selectedProject.title}
                  </motion.h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/55">
                    Screenshot {selectedSlide + 1} of {selectedScreenshots.length}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
                  Close
                </button>
              </div>

              <p className="text-[#9ca3af]">{selectedProject.longDescription}</p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/55">
                  <span className="rounded-full border border-white/15 px-2 py-1">Discover</span>
                  <span>-&gt;</span>
                  <span className="rounded-full border border-white/15 px-2 py-1">Build</span>
                  <span>-&gt;</span>
                  <span className="rounded-full border border-white/15 px-2 py-1">Harden</span>
                  <span>-&gt;</span>
                  <span className="rounded-full border border-white/15 px-2 py-1">Impact</span>
                </div>
              </div>

              <div className="media-frame relative mt-5 overflow-hidden rounded-xl border border-white/15">
                <div className="relative h-56 sm:h-72">
                  {selectedSlide === 0 ? (
                    <motion.div layoutId={`vault-image-${selectedProject.key}`} className="absolute inset-0">
                      <Image src={selectedScreenshots[selectedSlide]} alt={`${selectedProject.title} screenshot ${selectedSlide + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 760px" />
                    </motion.div>
                  ) : (
                    <Image src={selectedScreenshots[selectedSlide]} alt={`${selectedProject.title} screenshot ${selectedSlide + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 760px" />
                  )}
                </div>
                {selectedScreenshots.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedSlide((prev) => (prev - 1 + selectedScreenshots.length) % selectedScreenshots.length)}
                      className="interactive-lift absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 px-3 py-2 text-xs"
                      aria-label="Previous screenshot"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlide((prev) => (prev + 1) % selectedScreenshots.length)}
                      className="interactive-lift absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 px-3 py-2 text-xs"
                      aria-label="Next screenshot"
                    >
                      Next
                    </button>
                  </>
                ) : null}
              </div>

              {selectedScreenshots.length > 1 ? (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {selectedScreenshots.map((shot, index) => (
                    <button
                      key={`${shot}-${index}`}
                      type="button"
                      onClick={() => setSelectedSlide(index)}
                      className={`media-frame relative h-14 overflow-hidden rounded-md border ${selectedSlide === index ? "border-cyan-300/70" : "border-white/15"}`}
                      aria-label={`View screenshot ${index + 1}`}
                    >
                      <Image src={shot} alt={`${selectedProject.title} thumbnail ${index + 1}`} fill className="object-cover" sizes="120px" />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {getProjectStats(selectedProject).map((item) => (
                  <div key={`modal-${item.label}`} className="rounded-lg border border-white/10 bg-black/28 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">{item.label}</p>
                    <p className="mt-1 text-xs font-medium text-white/90">{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedProject.highlights?.length ? (
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Key Features</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                    {selectedProject.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {selectedProject.architecture ? (
                <div className="mt-4 rounded-lg border border-white/15 bg-black/30 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Architecture</p>
                  <p className="mt-2 text-sm text-white/80">{selectedProject.architecture}</p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2.5">
                {selectedProject.liveUrl ? (
                  <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black">
                    Live Demo
                  </a>
                ) : null}
                <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                  GitHub
                </a>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
