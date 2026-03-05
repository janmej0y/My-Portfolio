"use client";

import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import MagneticButton from "@/components/MagneticButton";
import PlayfulFooterItems from "@/components/PlayfulFooterItems";
import StaggerHeading from "@/components/StaggerHeading";
import { CONTACT_CARDS } from "@/lib/data";

type FormState = {
  name: string;
  email: string;
  message: string;
};

export default function Contact() {
  const [visitors, setVisitors] = useState("Loading...");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [company, setCompany] = useState("");

  useEffect(() => {
    const page = window.location.pathname;
    const device = navigator.userAgent;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        device,
        time: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data: { totalVisits?: number }) => setVisitors(String(data.totalVisits ?? "Unavailable")))
      .catch(() => setVisitors("Unavailable"));
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus("Sending...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          company,
        }),
      });

      const data = (await response.json()) as { success: boolean; message: string };
      setStatus(data.message);

      if (response.ok && data.success) {
        setForm({ name: "", email: "", message: "" });
        setCompany("");
      }
    } catch {
      setStatus("Unable to send message right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="px-6 pb-16 pt-8 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-8 lg:grid-cols-[1fr_1.2fr]"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-white/50">Contact</p>
            <div className="mt-4">
              <StaggerHeading
                text="Let's Build Something Great"
                className="text-4xl font-semibold tracking-tight md:text-5xl"
              />
            </div>
            <p className="mt-4 max-w-md text-[#9ca3af]">
              Open to software engineering roles, security-focused product work, and creative collaborations.
            </p>

            <div className="mt-8 space-y-3">
              {CONTACT_CARDS.map((card) => (
                <a key={card.title} href={card.href} className="surface block rounded-xl p-4 hover:border-white/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">{card.title}</p>
                  <p className="mt-1 text-white/85">{card.value}</p>
                </a>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="surface rounded-2xl p-6">
            <div className="grid gap-4">
              <label className="hidden" aria-hidden="true">
                Company
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="hidden"
                />
              </label>

              <label className="text-sm text-white/75">
                Name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-2 w-full rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-white outline-none focus:border-white/35"
                />
              </label>
              <label className="text-sm text-white/75">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-2 w-full rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-white outline-none focus:border-white/35"
                />
              </label>
              <label className="text-sm text-white/75">
                Message
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  className="mt-2 w-full rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-white outline-none focus:border-white/35"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <MagneticButton
                type="submit"
                className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] ${
                  submitting ? "bg-white/60 text-black/80" : "bg-white text-black"
                }`}
              >
                {submitting ? "Sending..." : "Send Message"}
              </MagneticButton>
              <span className="text-sm text-white/55">{status}</span>
            </div>
          </form>
        </motion.div>

        <PlayfulFooterItems />

        <footer className="mt-14 border-t border-white/10 pt-6 text-sm text-white/55">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>&copy; 2026 Janmejoy Mahato. All rights reserved.</p>
            <p>Total Visitors: {visitors}</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
