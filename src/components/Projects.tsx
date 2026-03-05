"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
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
  const [selected, setSelected] = useState<string | null>(null);

  const visible = useMemo(
    () => (activeFilter === "all" ? PROJECTS : PROJECTS.filter((project) => project.category === activeFilter)),
    [activeFilter],
  );

  const selectedProject = useMemo(() => PROJECTS.find((project) => project.key === selected) ?? null, [selected]);

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

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {visible.map((project, index) => (
            <ProjectCard key={project.key} project={project} index={index} onView={() => setSelected(project.key)} />
          ))}
        </div>
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
              className="surface w-full max-w-2xl rounded-2xl p-6"
            >
              <button onClick={() => setSelected(null)} aria-label="Close" className="float-right text-2xl">
                &times;
              </button>
              <h3 className="text-2xl font-semibold">{selectedProject.title}</h3>
              <p className="mt-3 text-[#9ca3af]">{selectedProject.longDescription}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {selectedProject.tech.map((tech) => (
                  <span key={tech} className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/75">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
