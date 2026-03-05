"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import StaggerHeading from "@/components/StaggerHeading";
import { PROJECTS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD, STAGGER } from "@/lib/motion";
import type { Project, ProjectCategory } from "@/types/portfolio";

const filters: ProjectCategory[] = ["all", "web", "app", "tools"];

const categoryStyle: Record<Exclude<ProjectCategory, "all">, { glow: string; ring: string; badge: string }> = {
  web: {
    glow: "from-cyan-400/22 via-sky-300/10 to-transparent",
    ring: "border-cyan-300/45",
    badge: "text-cyan-100",
  },
  app: {
    glow: "from-fuchsia-400/22 via-pink-300/10 to-transparent",
    ring: "border-fuchsia-300/45",
    badge: "text-fuchsia-100",
  },
  tools: {
    glow: "from-emerald-400/22 via-teal-300/10 to-transparent",
    ring: "border-emerald-300/45",
    badge: "text-emerald-100",
  },
};

function getStatusChips(project: Project) {
  const chips = new Set<string>();
  chips.add("Shipped");

  const joined = project.tech.join(" ").toLowerCase();
  if (/jwt|security|auth|linux|python/.test(joined)) chips.add("Security-Focused");
  if (project.highlights?.length || project.metrics?.length) chips.add("Case Study");
  if (!project.liveUrl) chips.add("In Progress");

  return Array.from(chips).slice(0, 3);
}

function getProjectStats(project: Project) {
  const coreStack = project.tech.slice(0, 2).join(" + ");
  return [
    { label: "Core Stack", value: coreStack || "N/A" },
    { label: "Category", value: project.category.toUpperCase() },
    { label: "Main Win", value: project.metrics?.[0] ?? "Reliable execution" },
  ];
}

function ProjectCard({ project, index, onView }: { project: Project; index: number; onView: () => void }) {
  const statusChips = useMemo(() => getStatusChips(project), [project]);
  const stats = useMemo(() => getProjectStats(project), [project]);
  const style = categoryStyle[project.category as Exclude<ProjectCategory, "all">];

  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 24 });

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 768) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width) * 100);
    pointerY.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATIONS.base, delay: index * STAGGER.card, ease: EASE_STANDARD }}
      whileHover={{ y: -8 }}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-2xl border ${style.ring} bg-black/45 p-4 md:p-5`}
    >
      <motion.div
        aria-hidden="true"
        style={{ left: smoothX, top: smoothY }}
        className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/18 blur-3xl"
      />
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow}`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <span className={`rounded-full border ${style.ring} bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${style.badge}`}>
            {project.category}
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {statusChips.map((chip) => (
              <span key={`${project.key}-${chip}`} className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/70">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="media-frame relative mt-3 h-48 rounded-xl border border-white/15 sm:h-56">
          <Image src={project.image} alt={project.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <h3 className="mt-4 text-2xl font-semibold text-white">{project.title}</h3>
        <p className="mt-2 text-sm text-white/75">{project.shortDescription}</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={`${project.key}-${item.label}`} className="rounded-lg border border-white/10 bg-black/28 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">{item.label}</p>
              <p className="mt-1 line-clamp-2 text-xs font-medium text-white/90">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3">
          <button onClick={onView} className="interactive-lift rounded-full border border-white/25 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-white">
            Open Case
          </button>
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="interactive-lift rounded-full border border-cyan-300/35 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-cyan-100">
              Live Demo
            </a>
          ) : null}
          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="interactive-lift rounded-full border border-white/20 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-white/85">
            Code
          </a>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: DURATIONS.fast, ease: EASE_STANDARD }}
        className="pointer-events-none absolute left-4 right-4 top-0 h-[2px] origin-left bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
      />
    </motion.article>
  );
}

function FeaturedProject({ project, onView }: { project: Project; onView: () => void }) {
  const style = categoryStyle[project.category as Exclude<ProjectCategory, "all">];
  const statusChips = getStatusChips(project);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      className={`relative overflow-hidden rounded-3xl border ${style.ring} bg-black/45 p-5 md:p-6`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow}`} />
      <div className="relative z-10 grid gap-5 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border ${style.ring} bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${style.badge}`}>
              Featured Project
            </span>
            {statusChips.map((chip) => (
              <span key={`featured-${chip}`} className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/70">
                {chip}
              </span>
            ))}
          </div>
          <h3 className="display-title text-3xl font-semibold text-white md:text-4xl">{project.title}</h3>
          <p className="max-w-2xl text-sm text-white/78">{project.longDescription}</p>
          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 5).map((tech) => (
              <span key={`featured-tech-${tech}`} className="impact-chip">
                {tech}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <button onClick={onView} className="interactive-lift rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black">
              Explore Case
            </button>
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="interactive-lift rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                Visit Live
              </a>
            ) : null}
          </div>
        </div>
        <div className="media-frame relative h-56 rounded-2xl md:h-64">
          <Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("all");
  const [activeTech, setActiveTech] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState(0);

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

  const featured = visible[0] ?? null;
  const gridProjects = featured ? visible.slice(1) : visible;

  return (
    <section id="projects" className="section-backplate b section-wrap px-6 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="flex flex-col gap-6"
        >
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.26em] text-white/50">Selected Work</p>
            <StaggerHeading text="Cyber Project Panel" className="display-title text-4xl font-semibold tracking-tight md:text-5xl" />
            <p className="max-w-3xl text-sm text-white/70">
              Measurable outcomes, security-aware engineering, and polished delivery. Browse by category, explore case studies, and inspect implementation depth.
            </p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-black/35 p-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative z-10 min-h-11 overflow-hidden rounded-xl px-3 py-2 text-xs uppercase tracking-[0.15em] transition ${
                    activeFilter === filter ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {activeFilter === filter ? (
                    <motion.span
                      layoutId="project-filter-active"
                      transition={{ duration: DURATIONS.fast, ease: EASE_STANDARD }}
                      className="absolute inset-0 rounded-xl bg-white/12"
                    />
                  ) : null}
                  <span className="relative z-10">
                  {filter} <span className="text-white/45">({filterCounts[filter]})</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search projects by title, stack, outcomes..."
              className="min-h-11 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
              aria-label="Search projects"
            />
            <select
              value={activeTech}
              onChange={(event) => setActiveTech(event.target.value)}
              className="min-h-11 rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
              aria-label="Filter by technology"
            >
              {techFilters.map((tech) => (
                <option key={tech} value={tech} className="bg-black">
                  {tech === "all" ? "All Technologies" : tech}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="mt-8 space-y-6">
          {featured ? <FeaturedProject project={featured} onView={() => setSelected(featured.key)} /> : null}

          {gridProjects.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {gridProjects.map((project, index) => (
                <ProjectCard key={project.key} project={project} index={index} onView={() => setSelected(project.key)} />
              ))}
            </div>
          ) : null}

          {!visible.length ? <p className="text-center text-sm text-white/60">No projects match your search/filter.</p> : null}
        </div>

        <div className="mt-10 flex justify-center">
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
              className="surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            >
              <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-4 flex items-center justify-between border-b border-white/10 bg-black/72 px-6 py-4 backdrop-blur">
                <div>
                  <h3 className="text-2xl font-semibold">{selectedProject.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/55">
                    Screenshot {selectedSlide + 1} of {selectedScreenshots.length}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="interactive-lift rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/85">
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
                  <Image src={selectedScreenshots[selectedSlide]} alt={`${selectedProject.title} screenshot ${selectedSlide + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 760px" />
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

              <div className="mt-6 flex flex-wrap gap-3">
                {selectedProject.liveUrl ? (
                  <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className="interactive-lift rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black">
                    Live Demo
                  </a>
                ) : null}
                <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="interactive-lift rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
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
