"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS, TRUST_METRICS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD, STAGGER } from "@/lib/motion";

export default function TestimonialsTrust() {
  return (
    <section id="trust" className="section-backplate a section-wrap px-5 sm:px-6 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="surface rounded-[30px] p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Trust Signals</p>
              <h2 className="display-title mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Proof, momentum, and a clearer reason to trust the work
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/60">
              A compact credibility layer with delivery volume, internship depth, and feedback from people who have seen the work up close.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_METRICS.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/[0.02] p-4">
                <p className="text-3xl font-semibold tracking-tight text-white">{item.value}</p>
                <p className="mt-1 text-sm text-white/80">{item.label}</p>
                {item.note ? <p className="mt-1 text-xs text-white/50">{item.note}</p> : null}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <motion.article
              key={item.name + item.role}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * STAGGER.card, duration: DURATIONS.base, ease: EASE_STANDARD }}
              className="surface rounded-[24px] p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Trusted Feedback</p>
              <p className="mt-4 text-sm leading-7 text-white/85">"{item.quote}"</p>
              <p className="mt-4 text-sm font-semibold">{item.name}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">{item.role}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
