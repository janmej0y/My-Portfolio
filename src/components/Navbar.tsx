"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import MagneticButton from "@/components/MagneticButton";
import { NAV_ITEMS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

type ThemePreset = "dark" | "bright" | "cyber";

export default function Navbar() {
  const [active, setActive] = useState("hero");
  const [themePreset, setThemePreset] = useState<ThemePreset>("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const applyTheme = (preset: ThemePreset) => {
    document.documentElement.classList.remove("theme-dark", "theme-bright", "theme-cyber", "bright-mode");
    document.documentElement.classList.add(`theme-${preset}`);
    localStorage.setItem("theme-preset", preset);
  };

  useEffect(() => {
    setThemePreset("dark");
    applyTheme("dark");
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 180;
      let section = "hero";
      ["hero", ...NAV_ITEMS.map((item) => item.id)].forEach((id) => {
        const node = document.getElementById(id);
        if (node && y >= node.offsetTop) section = id;
      });
      setActive(section);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const changeTheme = (preset: ThemePreset) => {
    setThemePreset(preset);
    applyTheme(preset);
  };

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto mt-4 flex w-[min(96%,1120px)] items-center justify-between rounded-full border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl md:px-6">
        <a href="#hero" className="text-sm font-semibold tracking-[0.22em] text-white">
          JANMEJOY
        </a>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`link-underline text-sm transition ${active === item.id ? "text-white" : "text-white/65 hover:text-white"}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-white/15 bg-black/30 p-1 md:flex">
            {(["dark", "bright", "cyber"] as ThemePreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => changeTheme(preset)}
                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                  themePreset === preset
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white"
                }`}
                aria-label={`Switch to ${preset} theme`}
              >
                {preset}
              </button>
            ))}
          </div>
          <MagneticButton
            href="#contact"
            className="hidden rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-white/50 md:inline-flex"
          >
            Let&apos;s Talk
          </MagneticButton>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white md:hidden"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: DURATIONS.fast, ease: EASE_STANDARD }}
            className="mx-auto mt-2 w-[min(96%,1120px)] rounded-2xl border border-white/10 bg-black/75 p-4 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                    active === item.id ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active === item.id ? "bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.85)]" : "bg-white/35"
                    }`}
                    aria-hidden="true"
                  />
                  {item.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white"
              >
                Let&apos;s Talk
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
