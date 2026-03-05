"use client";

import { motion } from "framer-motion";
import { CASE_STUDIES } from "@/lib/data";

export default function CaseStudies() {
  return (
    <section id="case-studies" className="px-6 py-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="mb-10"
        >
          <p className="text-sm uppercase tracking-[0.26em] text-white/50">Proof of Work</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Flagship Case Studies</h2>
          <p className="mt-4 max-w-3xl text-[#9ca3af]">
            Selected projects with concrete problem context, engineering decisions, and measurable outcomes.
          </p>
        </motion.div>

        <div className="grid gap-5">
          {CASE_STUDIES.map((study, index) => (
            <motion.article
              key={study.slug}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08 }}
              className="surface rounded-2xl p-6 md:p-8"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    {study.role} • {study.period}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{study.title}</h3>
                </div>
                {study.link ? (
                  <a
                    href={study.link}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-sm text-white/75"
                  >
                    Live Project
                  </a>
                ) : null}
              </div>

              <p className="mt-4 text-[#9ca3af]">{study.summary}</p>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Challenge</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">{study.challenge}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Approach</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-white/80">
                    {study.approach.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Impact</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-white/80">
                    {study.impact.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {study.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.1em] text-white/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

