"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS, TRUST_METRICS } from "@/lib/data";

export default function TestimonialsTrust() {
  return (
    <section id="trust" className="px-6 py-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="surface rounded-2xl p-6 md:p-8"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Trust Signals</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_METRICS.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
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
              transition={{ delay: index * 0.06 }}
              className="surface rounded-xl p-5"
            >
              <p className="text-sm leading-6 text-white/85">"{item.quote}"</p>
              <p className="mt-4 text-sm font-semibold">{item.name}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">{item.role}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

