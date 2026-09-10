"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import MagneticButton from "@/components/MagneticButton";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { NAV_ITEMS } from "@/lib/data";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

type ThemePreset = "dark" | "bright" | "cyber";
const THEME_CHANGE_EVENT = "portfolio-theme-change";

export default function Navbar() {
  const [active, setActive] = useState("hero");
  const [themePreset, setThemePreset] = useState<ThemePreset>("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hoverCloseTimer = useRef<number | null>(null);
  const [docked, setDocked] = useState(false);
  const pathname = usePathname();
  const { enabled: soundEnabled, play, toggleSound } = useSoundEffects();
  const sectionIds = useMemo(() => ["hero", ...NAV_ITEMS.map((item) => item.id)], []);
  /** Shown inline in the top bar; everything else goes in the hamburger. */
  const PRIMARY_IDS = useMemo(() => ["projects", "education", "contact"], []);
  const primaryItems = useMemo(
    () => PRIMARY_IDS.map((id) => NAV_ITEMS.find((item) => item.id === id)).filter(Boolean) as typeof NAV_ITEMS,
    [PRIMARY_IDS],
  );
  const secondaryItems = useMemo(
    () => NAV_ITEMS.filter((item) => !PRIMARY_IDS.includes(item.id)),
    [PRIMARY_IDS],
  );
  const isHomePage = pathname === "/";
  const sectionHref = (id: string) => (isHomePage ? `#${id}` : `/#${id}`);

  const applyTheme = (preset: ThemePreset) => {
    document.documentElement.classList.remove("theme-dark", "theme-bright", "theme-cyber");
    document.documentElement.classList.add(`theme-${preset}`);
    localStorage.setItem("theme-preset", preset);
  };

  useEffect(() => {
    const savedPreset = window.localStorage.getItem("theme-preset");
    const nextPreset: ThemePreset =
      savedPreset === "bright" || savedPreset === "cyber" || savedPreset === "dark" ? savedPreset : "dark";

    setThemePreset(nextPreset);
    applyTheme(nextPreset);

    const onThemeChange = (event: Event) => {
      const preset = (event as CustomEvent<{ preset?: string }>).detail?.preset;
      if (preset === "bright" || preset === "cyber" || preset === "dark") {
        setThemePreset(preset);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      setActive("");
      return;
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    // offsetTop was read for every section on every scroll event, which forces
    // a synchronous layout each time. Positions only change on resize or when
    // content reflows, so they are measured once and cached.
    let offsets: { id: string; top: number }[] = [];
    const measure = () => {
      offsets = sections.map((node) => ({ id: node.id, top: node.offsetTop }));
    };

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const y = window.scrollY + 180;
        let section = "hero";
        for (const entry of offsets) {
          if (y >= entry.top) section = entry.id;
        }
        setActive(section);
      });
    };

    // Re-measure when the layout can actually have moved.
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHomePage, sectionIds]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // The bar floats clear of the top edge at rest and docks flush once the page
  // scrolls, rather than hiding on scroll-down. It stays reachable throughout.
  useEffect(() => {
    const onScroll = () => {
      setDocked(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const changeTheme = (preset: ThemePreset) => {
    play("switch");
    setThemePreset(preset);
    window.dispatchEvent(new CustomEvent("portfolio-theme-transition", { detail: { preset } }));
    applyTheme(preset);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { preset } }));
  };

  const onToggleSound = () => {
    toggleSound();
    window.setTimeout(() => play("success"), 0);
  };

  /**
   * Hover intent for the More menu.
   *
   * Closing is delayed so the pointer can cross the gap between the button and
   * the panel without the menu snapping shut underneath it. Both elements share
   * these handlers, so re-entering either one cancels a pending close.
   */
  const cancelHoverClose = () => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };

  const openOnHover = () => {
    // Touch devices fire pointerenter on tap; the click handler owns that case.
    if (!window.matchMedia("(hover: hover)").matches) return;
    cancelHoverClose();
    setMobileMenuOpen(true);
  };

  const closeOnHoverOut = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    cancelHoverClose();
    hoverCloseTimer.current = window.setTimeout(() => setMobileMenuOpen(false), 220);
  };

  useEffect(() => cancelHoverClose, []);

  return (
    <>
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      // Docked: hand off to the floating bottom nav. The bar lifts out of view
      // rather than sitting on screen alongside it.
      animate={
        docked && !mobileMenuOpen
          ? { y: -120, opacity: 0, pointerEvents: "none" }
          : { y: 0, opacity: 1, pointerEvents: "auto" }
      }
      className="portfolio-navbar pointer-events-none fixed inset-x-0 top-[1.667rem] z-[210] px-4 py-4"
    >
      {/* Logo stands on its own, outside the pill - the pill then sizes to its
          own contents instead of being stretched across the viewport. */}
      <div className="mx-auto flex w-[min(96%,1120px)] items-center justify-between gap-4">
        <a
          href={sectionHref("hero")}
          className="portfolio-wordmark pointer-events-auto inline-flex min-w-0 shrink-0 items-center gap-2.5"
          aria-label="Janmejoy - home"
        >
          {/* Logomark: an open gradient ring with the J sitting inside it, so
              the colour lives in the mark and the name stays clean white. */}
          <span className="wordmark-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="jm-ring" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#27FCF2" />
                  <stop offset="0.5" stopColor="#3064D0" />
                  <stop offset="1" stopColor="#8739D5" />
                </linearGradient>
                <linearGradient id="jm-arc" x1="40" y1="10" x2="10" y2="38" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D946EF" />
                  <stop offset="1" stopColor="#27FCF2" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="jm-letter" x1="18" y1="34" x2="34" y2="14" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="1" stopColor="#A5F3FC" />
                </linearGradient>
              </defs>

              {/* Outer ring, open at the lower right so it reads as a mark
                  rather than a plain circle. Drawn on load. */}
              <path
                className="wordmark-ring"
                d="M24 4a20 20 0 1 1-14.14 34.14"
                stroke="url(#jm-ring)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Inner arc turns the other way, giving the mark depth as the
                  two orbits cross. */}
              <path
                className="wordmark-arc"
                d="M38 14a16.5 16.5 0 0 1-6.4 24.6"
                stroke="url(#jm-arc)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <path
                className="wordmark-letter"
                d="M30 14v13.5a6.5 6.5 0 0 1-11.1 4.6"
                stroke="url(#jm-letter)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Spark riding the ring. */}
              <circle className="wordmark-spark" cx="24" cy="4" r="2.4" fill="#27FCF2" />
            </svg>
          </span>

          <span className="wordmark-text">
            <span className="max-[380px]:hidden">Janmejoy</span>
            <span className="hidden max-[380px]:inline">JM</span>
            <span className="wordmark-dot" aria-hidden="true">.</span>
          </span>
        </a>

        <div
          onPointerLeave={closeOnHoverOut}
          onPointerEnter={cancelHoverClose}
          className={`portfolio-navbar-shell nav-gradient-ring pointer-events-auto flex shrink-0 items-center gap-1 rounded-full p-1 shadow-2xl shadow-black/30 backdrop-blur-xl transition-colors duration-300 ${
            mobileMenuOpen ? "bg-black/95" : "bg-black/85"
          }`}
        >
          {/* Three primary links; everything else is one tap away in More. */}
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary navigation">
            {primaryItems.map((item) => (
              <a
                key={item.id}
                href={sectionHref(item.id)}
                onClick={() => play("tap")}
                className={`rounded-full px-4 py-[0.417rem] text-[0.833rem] font-medium tracking-wide transition-all hover:bg-white/10 ${
                  active === item.id ? "bg-white/10 text-white" : "text-white/75 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <MagneticButton
              href={sectionHref("contact")}
              className="hidden rounded-full px-4 py-[0.417rem] text-[0.833rem] font-medium tracking-wide text-white/75 transition-all hover:bg-white/10 hover:text-white md:inline-flex"
            >
              Let&apos;s Talk
            </MagneticButton>
          {/* Circular icon-only toggle: three rules that collapse into an X.
              The middle rule fades while the outer two rotate onto each other. */}
          <button
            type="button"
            onClick={() => {
              play("tap");
              setMobileMenuOpen((prev) => !prev);
            }}
            onPointerEnter={openOnHover}
            onFocus={openOnHover}
            className="nav-menu-toggle flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-[0.417rem] text-white transition-colors hover:bg-white/20 md:px-4"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-haspopup="dialog"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            <span className="relative block size-5" aria-hidden="true">
              <span
                className={`nav-menu-bar ${mobileMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-[6px]"}`}
              />
              <span className={`nav-menu-bar ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span
                className={`nav-menu-bar ${mobileMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-[6px]"}`}
              />
            </span>
            <span className="hidden text-[0.833rem] font-semibold uppercase tracking-wide sm:inline">
              {mobileMenuOpen ? "Close" : "More"}
            </span>
          </button>
          </div>
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
            onPointerEnter={cancelHoverClose}
            onPointerLeave={closeOnHoverOut}
            className="portfolio-mobile-menu pointer-events-auto mx-auto mt-2 w-[min(96%,1120px)] rounded-2xl bg-[#050505] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:p-6"
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Menu">
              {/* Sections: the links not already surfaced in the bar. On mobile
                  the bar has no room for any, so the primaries appear here too. */}
              <nav className="flex flex-col gap-1" aria-label="Sections">
                <p className="nav-panel-heading">Sections</p>
                {primaryItems.map((item) => (
                  <a
                    key={item.id}
                    href={sectionHref(item.id)}
                    onClick={() => {
                      play("tap");
                      setMobileMenuOpen(false);
                    }}
                    className={`nav-panel-link md:hidden ${active === item.id ? "nav-panel-link-active" : ""}`}
                  >
                    {item.label}
                  </a>
                ))}
                {secondaryItems.map((item) => (
                  <a
                    key={item.id}
                    href={sectionHref(item.id)}
                    onClick={() => {
                      play("tap");
                      setMobileMenuOpen(false);
                    }}
                    className={`nav-panel-link ${active === item.id ? "nav-panel-link-active" : ""}`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Explore */}
              <nav className="flex flex-col gap-1" aria-label="Explore">
                <p className="nav-panel-heading">Explore</p>
                <Link
                  href="/games"
                  onClick={() => {
                    play("open");
                    setMobileMenuOpen(false);
                  }}
                  className="nav-panel-link"
                >
                  Game Hub
                </Link>
                <a
                  href={sectionHref("contact")}
                  onClick={() => {
                    play("tap");
                    setMobileMenuOpen(false);
                  }}
                  className="nav-panel-link"
                >
                  Let&apos;s Talk
                </a>
              </nav>

              {/* Preferences: theme and sound now live here rather than in the bar. */}
              <div className="flex flex-col gap-3">
                <p className="nav-panel-heading">Appearance</p>
                <div className="flex items-center rounded-full border border-white/15 bg-black/30 p-1">
                  {(["dark", "bright", "cyber"] as ThemePreset[]).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => changeTheme(preset)}
                      className={`flex-1 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                        themePreset === preset ? "bg-white text-black" : "text-white/70 hover:text-white"
                      }`}
                      aria-label={`Switch to ${preset} theme`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                    soundEnabled
                      ? "border-cyan-300/45 bg-cyan-400/[0.12] text-cyan-100"
                      : "border-white/15 bg-black/30 text-white/60 hover:text-white"
                  }`}
                  aria-pressed={soundEnabled}
                  aria-label={soundEnabled ? "Turn sound off" : "Turn sound on"}
                >
                  <span className="relative flex h-3 w-3 items-end gap-[2px]" aria-hidden="true">
                    <span className={`w-[3px] rounded-full ${soundEnabled ? "h-2 bg-cyan-200" : "h-1 bg-white/45"}`} />
                    <span className={`w-[3px] rounded-full ${soundEnabled ? "h-3 bg-cyan-100" : "h-2 bg-white/45"}`} />
                    <span className={`w-[3px] rounded-full ${soundEnabled ? "h-1.5 bg-cyan-300" : "h-1 bg-white/45"}`} />
                  </span>
                  {soundEnabled ? "Sound On" : "Sound Off"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>

    {/* Floating bottom nav. Holds the section links on desktop and rises into
        view once the page is scrolled, so the top bar stays minimal. */}
    <AnimatePresence>
      {docked ? (
        <motion.div
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 28, opacity: 0 }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="pointer-events-none fixed inset-x-0 bottom-8 z-[209] hidden items-center justify-center md:flex"
        >
          <div className="flex items-center justify-center gap-3">
            {/* Back to top, in its own gradient ring. */}
            <div className="nav-dock-ring group pointer-events-auto rounded-full p-px">
              <button
                type="button"
                onClick={() => {
                  play("tap");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex size-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/80"
                aria-label="Back to top"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="transition-transform duration-500 group-hover:-translate-y-1"
                >
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
              </button>
            </div>

            {/* Links pill: gradient border via a 1px padded wrapper. */}
            <nav className="nav-dock-ring pointer-events-auto rounded-full p-px" aria-label="Section navigation">
              <div className="relative z-10 rounded-full bg-black/85 p-1 backdrop-blur-md">
                <ul className="flex items-center justify-evenly">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={sectionHref(item.id)}
                        onClick={() => play("tap")}
                        className={`inline-block rounded-full px-4 py-[0.417rem] text-[0.833rem] font-medium tracking-wide transition-all hover:bg-white/10 ${
                          active === item.id ? "bg-white/10 text-white" : "text-white/75 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/games"
                      onClick={() => play("open")}
                      className="inline-block rounded-full px-4 py-[0.417rem] text-[0.833rem] font-medium tracking-wide text-cyan-100 transition-all hover:bg-white/10 hover:text-white"
                    >
                      Game Hub
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
    </>
  );
}
