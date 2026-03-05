"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { PROJECTS } from "@/lib/data";
import type { Project, ProjectCategory } from "@/types/portfolio";
import StaggerHeading from "@/components/StaggerHeading";

const filters: ProjectCategory[] = ["all", "web", "app", "tools"];

function ProjectCard({ project, index, onView }: { project: Project; index: number; onView: () => void }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-18, 24]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -12, rotateX: 1.2, rotateY: -1 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 [transform-style:preserve-3d]"
    >
      <div className="relative h-[260px] overflow-hidden sm:h-[320px]">
        <motion.div style={{ y }} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-110"
            priority={index < 2}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(167,139,250,0.3),transparent_42%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 transition-transform duration-500 group-hover:-translate-y-1">
        <h3 className="text-2xl font-semibold drop-shadow-md">{project.title}</h3>
        <p className="mt-2 max-w-xl text-sm text-white/75">{project.shortDescription}</p>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={onView} className="link-underline text-sm text-white/90" data-magnetic="true">
            View Case
          </button>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="link-underline text-sm text-white/70"
              data-magnetic="true"
            >
              Live
            </a>
          ) : null}
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

  const selectedProject = useMemo(() => PROJECTS.find((project) => project.key === selected) ?? null, [selected]);
  const selectedScreenshots = selectedProject?.screenshots?.length ? selectedProject.screenshots : selectedProject ? [selectedProject.image] : [];

  useEffect(() => {
    if (!selectedProject) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") {
        setSelectedSlide((prev) => (prev + 1) % selectedScreenshots.length);
      }
      if (event.key === "ArrowLeft") {
        setSelectedSlide((prev) => (prev - 1 + selectedScreenshots.length) % selectedScreenshots.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProject, selectedScreenshots.length]);

  useEffect(() => {
    setSelectedSlide(0);
  }, [selected]);

  return (
    <section id="projects" className="px-6 py-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-white/50">Selected Work</p>
            <div className="mt-3">
              <StaggerHeading text="Project Showcase" className="text-4xl font-semibold tracking-tight md:text-5xl" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                  activeFilter === filter ? "bg-white text-black" : "border border-white/15 text-white/70 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"
        >
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search projects by name, description, tech..."
            className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
            aria-label="Search projects"
          />
          <select
            value={activeTech}
            onChange={(event) => setActiveTech(event.target.value)}
            className="rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
            aria-label="Filter by technology"
          >
            {techFilters.map((tech) => (
              <option key={tech} value={tech} className="bg-black">
                {tech === "all" ? "All Technologies" : tech}
              </option>
            ))}
          </select>
        </motion.div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {visible.map((project, index) => (
            <ProjectCard key={project.key} project={project} index={index} onView={() => setSelected(project.key)} />
          ))}
        </div>
        {!visible.length ? (
          <p className="mt-8 text-center text-sm text-white/60">No projects match your search/filter.</p>
        ) : null}
      </div>

      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4"
          >
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="surface w-full max-w-3xl rounded-2xl p-6"
            >
              <button onClick={() => setSelected(null)} aria-label="Close project details" className="float-right text-2xl">
                &times;
              </button>
              <h3 className="text-2xl font-semibold">{selectedProject.title}</h3>
              <p className="mt-3 text-[#9ca3af]">{selectedProject.longDescription}</p>

              <div className="relative mt-5 overflow-hidden rounded-xl border border-white/15">
                <div className="relative h-56 sm:h-72">
                  <Image
                    src={selectedScreenshots[selectedSlide]}
                    alt={`${selectedProject.title} screenshot ${selectedSlide + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 720px"
                  />
                </div>
                {selectedScreenshots.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedSlide((prev) => (prev - 1 + selectedScreenshots.length) % selectedScreenshots.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 px-3 py-2 text-xs"
                      aria-label="Previous screenshot"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlide((prev) => (prev + 1) % selectedScreenshots.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 px-3 py-2 text-xs"
                      aria-label="Next screenshot"
                    >
                      Next
                    </button>
                  </>
                ) : null}
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

              {selectedProject.metrics?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedProject.metrics.map((metric) => (
                    <span key={metric} className="rounded-full border border-cyan-300/35 px-3 py-1 text-xs text-cyan-200/90">
                      {metric}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-2 gap-2">
                {selectedProject.tech.map((tech) => (
                  <span key={tech} className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/75">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {selectedProject.liveUrl ? (
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black"
                  >
                    Live Demo
                  </a>
                ) : null}
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                >
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
