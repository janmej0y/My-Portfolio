"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { NAV_ITEMS } from "@/lib/data";

type Command = {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = useMemo<Command[]>(
    () => [
      {
        id: "hero",
        label: "Go to Hero",
        hint: "#hero",
        run: () => document.querySelector("#hero")?.scrollIntoView({ behavior: "smooth" }),
      },
      ...NAV_ITEMS.map((item) => ({
        id: item.id,
        label: `Go to ${item.label}`,
        hint: `#${item.id}`,
        run: () => document.querySelector(`#${item.id}`)?.scrollIntoView({ behavior: "smooth" }),
      })),
      {
        id: "contact",
        label: "Go to Contact",
        hint: "#contact",
        run: () => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }),
      },
      {
        id: "resume",
        label: "Open Resume",
        hint: "PDF",
        run: () => window.open("/assets/resume.pdf", "_blank", "noopener,noreferrer"),
      },
      {
        id: "secret",
        label: "Open Secret Room",
        hint: "/secret",
        run: () => (window.location.href = "/secret"),
      },
      {
        id: "github",
        label: "Open GitHub",
        hint: "External",
        run: () => window.open("https://github.com/janmej0y", "_blank", "noopener,noreferrer"),
      },
      {
        id: "linkedin",
        label: "Open LinkedIn",
        hint: "External",
        run: () => window.open("https://linkedin.com/in/janmej0y", "_blank", "noopener,noreferrer"),
      },
      {
        id: "theme-dark",
        label: "Switch Theme: Dark",
        hint: "Theme",
        run: () => {
          document.documentElement.classList.remove("theme-bright", "theme-cyber", "bright-mode");
          document.documentElement.classList.add("theme-dark");
          localStorage.setItem("theme-preset", "dark");
        },
      },
      {
        id: "theme-bright",
        label: "Switch Theme: Bright",
        hint: "Theme",
        run: () => {
          document.documentElement.classList.remove("theme-dark", "theme-cyber", "bright-mode");
          document.documentElement.classList.add("theme-bright");
          localStorage.setItem("theme-preset", "bright");
        },
      },
      {
        id: "theme-cyber",
        label: "Switch Theme: Cyber",
        hint: "Theme",
        run: () => {
          document.documentElement.classList.remove("theme-dark", "theme-bright", "bright-mode");
          document.documentElement.classList.add("theme-cyber");
          localStorage.setItem("theme-preset", "cyber");
        },
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) => command.label.toLowerCase().includes(q) || command.hint?.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const runCommand = (index: number) => {
    const command = filtered[index];
    if (!command) return;
    command.run();
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-[90] rounded-full border border-white/15 bg-black/55 px-3 py-2 text-xs text-white/75 backdrop-blur-xl transition hover:text-white"
        aria-label="Open command palette"
      >
        Ctrl/Cmd + K
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="mx-auto mt-[10vh] w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#0f0f10]"
            >
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((prev) => Math.max(prev - 1, 0));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    runCommand(activeIndex);
                  }
                }}
                placeholder="Type a command..."
                className="w-full border-b border-white/10 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/40"
              />
              <div className="max-h-[340px] overflow-y-auto p-2">
                {filtered.length ? (
                  filtered.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runCommand(index)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                        index === activeIndex ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/6"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hint ? <span className="text-[11px] uppercase tracking-[0.08em] text-white/45">{item.hint}</span> : null}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-sm text-white/55">No command found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
