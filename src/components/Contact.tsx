"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import MagneticButton from "@/components/MagneticButton";
import PlayfulFooterItems from "@/components/PlayfulFooterItems";
import StaggerHeading from "@/components/StaggerHeading";
import { CONTACT_CARDS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

type FormState = {
  name: string;
  email: string;
  message: string;
};
type StatusTone = "idle" | "success" | "error" | "info";

export default function Contact() {
  const [visitors, setVisitors] = useState("Loading...");
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<StatusTone>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [company, setCompany] = useState("");
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/borj18237/30min";

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

  useEffect(() => {
    if (!status || statusTone === "info") return;
    const timer = window.setTimeout(() => {
      setStatus("");
      setStatusTone("idle");
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [status, statusTone]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus("Sending...");
    setStatusTone("info");

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
      setStatusTone(response.ok && data.success ? "success" : "error");

      if (response.ok && data.success) {
        setForm({ name: "", email: "", message: "" });
        setCompany("");
      }
    } catch {
      setStatus("Unable to send message right now. Please try again.");
      setStatusTone("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-backplate c section-wrap px-5 pb-16 pt-8 sm:px-6 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="grid gap-8 lg:grid-cols-[1fr_1.2fr]"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-white/50">Signal Line</p>
            <div className="mt-4">
              <StaggerHeading
                text="Start the next build before someone else does."
                className="display-title text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
              />
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#9ca3af] sm:text-base">
              Open to software engineering roles, security-focused product work, and creative collaborations.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a
                href="mailto:janmejoymahato529@gmail.com?subject=Hiring%20Inquiry"
                className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black"
              >
                Hire Me
              </a>
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noreferrer"
                className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/45 bg-cyan-300/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200"
              >
                Book a Call
              </a>
              <a
                href="/assets/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Download Resume
              </a>
            </div>

            <div className="mt-8 space-y-3">
              {CONTACT_CARDS.map((card) => (
                <a key={card.title} href={card.href} className="surface block rounded-xl p-4 hover:border-white/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">{card.title}</p>
                  <p className="mt-1 break-words text-white/85">{card.value}</p>
                </a>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="surface rounded-2xl p-5 sm:p-6">
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
                  className="mt-2 min-h-11 w-full rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-white outline-none focus:border-white/35"
                />
              </label>
              <label className="text-sm text-white/75">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-white outline-none focus:border-white/35"
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

            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <MagneticButton
                type="submit"
                disabled={submitting}
                className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] ${
                  submitting ? "cursor-not-allowed bg-white/60 text-black/80" : "bg-white text-black"
                }`}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </MagneticButton>
              <span
                className={`text-sm sm:max-w-[280px] ${statusTone === "success" ? "text-emerald-300" : statusTone === "error" ? "text-red-300" : "text-white/55"}`}
              >
                {status}
              </span>
            </div>
          </form>
        </motion.div>

        <PlayfulFooterItems />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="mt-10 rounded-2xl border border-cyan-200/20 bg-[linear-gradient(115deg,rgba(34,211,238,0.18),rgba(14,116,144,0.12))] p-5 md:p-6"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Last Call</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="display-title text-2xl font-semibold leading-tight text-white sm:text-3xl">Let&apos;s launch something sharp and hard to ignore</p>
            <a
              href="#contact"
              className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-black/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              Start a Project
            </a>
          </div>
        </motion.div>

        <footer className="mt-14 border-t border-white/10 pt-6 text-sm text-white/55">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>&copy; 2026 Janmejoy Mahato. All rights reserved.</p>
            <p>Total Visitors: {visitors}</p>
          </div>
        </footer>
      </div>
      <AnimatePresence>
        {status && statusTone !== "info" ? (
          <motion.div
            initial={{ opacity: 0, y: -12, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 8 }}
            transition={{ duration: DURATIONS.fast, ease: EASE_STANDARD }}
            className="status-toast"
            role="status"
            aria-live="polite"
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                statusTone === "success" ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"
              }`}
            >
              {statusTone === "success" ? "OK" : "!"}
            </span>
            <p className="text-sm text-white/90">{status}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
