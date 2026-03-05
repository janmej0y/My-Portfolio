"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MagneticButton from "@/components/MagneticButton";
import { NAV_ITEMS } from "@/lib/data";

type ThemePreset = "dark" | "bright" | "cyber";

export default function Navbar() {
  const [active, setActive] = useState("hero");
  const [themePreset, setThemePreset] = useState<ThemePreset>("dark");

  const applyTheme = (preset: ThemePreset) => {
    document.documentElement.classList.remove("theme-dark", "theme-bright", "theme-cyber", "bright-mode");
    document.documentElement.classList.add(`theme-${preset}`);
    localStorage.setItem("theme-preset", preset);
  };

  useEffect(() => {
    const stored = (localStorage.getItem("theme-preset") as ThemePreset | null) ?? "dark";
    setThemePreset(stored);
    applyTheme(stored);
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

  const changeTheme = (preset: ThemePreset) => {
    setThemePreset(preset);
    applyTheme(preset);
  };

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
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
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-white/50"
          >
            Let&apos;s Talk
          </MagneticButton>
        </div>
      </div>
    </motion.header>
  );
}
