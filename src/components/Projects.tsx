"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import StaggerHeading from "@/components/StaggerHeading";
import { PROJECTS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";
import type { Project, ProjectCategory } from "@/types/portfolio";

const filters: ProjectCategory[] = ["all", "web", "app", "tools"];

const styles: Record<Exclude<ProjectCategory, "all">, { ring: string; badge: string; glow: string; dot: string }> = {
  web: {
    ring: "border-cyan-300/35",
    badge: "text-cyan-100",
    glow: "from-cyan-400/22 via-sky-300/10 to-transparent",
    dot: "bg-cyan-300",
  },
  app: {
    ring: "border-fuchsia-300/35",
    badge: "text-fuchsia-100",
    glow: "from-fuchsia-400/22 via-pink-300/10 to-transparent",
    dot: "bg-fuchsia-300",
  },
  tools: {
    ring: "border-emerald-300/35",
    badge: "text-emerald-100",
    glow: "from-emerald-400/22 via-teal-300/10 to-transparent",
    dot: "bg-emerald-300",
  },
};

function getStats(project: Project) {
  return [
    { label: "Category", value: project.category.toUpperCase() },
    { label: "Stack", value: project.tech.slice(0, 2).join(" + ") || "N/A" },
    { label: "Impact", value: project.metrics?.[0] ?? "Reliable delivery" },
  ];
}

function ProjectShowcaseCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const style = styles[project.category];
  const resultLine = project.resultLine ?? "Shipped with a cleaner product experience.";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-[30px] border ${style.ring} bg-[linear-gradient(180deg,rgba(7,12,24,0.96),rgba(3,8,18,0.92))] shadow-[0_24px_60px_rgba(2,6,23,0.34)]`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
      <div className="relative z-10">
        <div className="showcase-shell rounded-none border-0 border-b border-white/10">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/32 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#06d6a0]" />
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full border ${style.ring} bg-black/22 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${style.badge}`}>
              <span className={`h-2 w-2 rounded-full ${style.dot}`} />
              {project.category}
            </span>
          </div>
          <Image
            src={project.image}
            alt={project.title}
            width={1200}
            height={900}
            className="aspect-[16/10] w-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,18,0.04),rgba(3,8,18,0.14)_42%,rgba(0,0,0,0.76))]" />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-3 rounded-[18px] border border-white/10 bg-black/55 px-3 py-2 opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/82">Open full case study</p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-3">
            <h3 className="display-title text-2xl font-semibold tracking-tight text-white">{project.title}</h3>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100/78">{resultLine}</p>
            <p className="line-clamp-3 text-sm leading-7 text-white/70">{project.shortDescription}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {getStats(project).map((item) => (
              <div key={`${project.key}-${item.label}`} className="metric-card rounded-[20px] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">{item.label}</p>
                <p className="mt-1 text-sm font-medium leading-6 text-white/90">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 4).map((tech) => (
              <span key={`${project.key}-${tech}`} className="impact-chip">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onOpen}
              data-cursor="Open"
              className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black"
            >
              View Details
            </button>
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                data-cursor="Live"
                className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100"
              >
                Live Demo
              </a>
            ) : null}
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              data-cursor="Code"
              className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
            >
              Source Code
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("all");
  const [activeTech, setActiveTech] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState(0);

  const techFilters = useMemo(() => {
    const all = PROJECTS.flatMap((project) => project.tech);
    return ["all", ...Array.from(new Set(all)).sort((a, b) => a.localeCompare(b))];
  }, []);

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PROJECTS.filter((project) => {
      const categoryPass = activeFilter === "all" || project.category === activeFilter;
      const techPass = activeTech === "all" || project.tech.includes(activeTech);
      const searchPass =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.shortDescription.toLowerCase().includes(q) ||
        project.tech.some((tech) => tech.toLowerCase().includes(q));
      return categoryPass && techPass && searchPass;
    });
  }, [activeFilter, activeTech, searchQuery]);

  const selectedProject = useMemo(() => PROJECTS.find((project) => project.key === selectedKey) ?? null, [selectedKey]);
  const selectedScreenshots = selectedProject?.screenshots?.length ? selectedProject.screenshots : selectedProject ? [selectedProject.image] : [];

  const openProject = (key: string) => {
    setSelectedKey(key);
    setSelectedSlide(0);
  };

  return (
    <section id="projects" className="section-backplate b section-wrap px-5 sm:px-6 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[radial-gradient(circle_at_18%_14%,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.14),transparent_20%),linear-gradient(180deg,rgba(4,10,18,0.92),rgba(2,6,14,0.84))] p-5 md:p-7"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.18]" />
          <div className="relative z-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.32em] text-white/46">Project Showcase</p>
                <StaggerHeading
                  text="Card-based work samples built for quick scanning and easy review"
                  className="display-title mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 text-center min-[420px]:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Projects</p>
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
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                      activeFilter === filter
                        ? "border-cyan-300/45 bg-cyan-400/[0.12] text-cyan-100"
                        : "border-white/12 bg-black/18 text-white/68 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="grid flex-1 gap-3 md:grid-cols-[1fr_220px]">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search title, stack, impact..."
                  className="min-h-11 rounded-2xl border border-cyan-300/20 bg-[#07111d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/45"
                  aria-label="Search projects"
                />
                <select
                  value={activeTech}
                  onChange={(event) => setActiveTech(event.target.value)}
                  className="min-h-11 appearance-none rounded-2xl border border-cyan-300/20 bg-[#07111d] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/45"
                  aria-label="Filter by technology"
                >
                  {techFilters.map((tech) => (
                    <option key={tech} value={tech} className="bg-[#07111d] text-white">
                      {tech === "all" ? "All Technologies" : tech}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {visible.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((project) => (
              <ProjectShowcaseCard key={project.key} project={project} onOpen={() => openProject(project.key)} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-white/60">No projects match your current search.</p>
        )}
      </div>

      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATIONS.fast, ease: EASE_STANDARD }}
            onClick={() => setSelectedKey(null)}
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
                  onClick={() => setSelectedKey(null)}
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
                      onClick={() => setSelectedSlide(index)}
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
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                    {selectedProject.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
