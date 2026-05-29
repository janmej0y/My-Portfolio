"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { EXPERIENCE_ITEMS, PROJECTS } from "@/lib/data";

const TILE_COLUMNS = 8;
const TILE_ROWS = 9;
const PARTICLE_COUNT = 34;
const TOTAL_DURATION = 6400;
const STATUS_STEPS = ["Vault", "Identity", "Pixels", "Proof", "Projects", "Enter"];
const FEATURED_PROJECT_KEYS = ["vampforge", "authsphere", "tapas-grocery", "voting"];
const PHASE_TIMINGS = [
  { phase: "Vault", at: 0 },
  { phase: "Identity", at: 1350 },
  { phase: "Pixels", at: 2550 },
  { phase: "Proof", at: 3650 },
  { phase: "Projects", at: 4300 },
  { phase: "Enter", at: 5400 },
] as const;
const PROJECT_METRICS: Record<string, string> = {
  vampforge: "AI Platform",
  authsphere: "Secure Auth",
  "tapas-grocery": "Supabase Commerce",
  voting: "JWT Voting",
};

type Tile = {
  id: string;
  column: number;
  row: number;
  x: number;
  y: number;
};

type Particle = {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
};

function playVaultTone(stage: "unlock" | "burst" | "enter") {
  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  const audio = new AudioContextCtor();
  const now = audio.currentTime;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(stage === "burst" ? 0.035 : 0.025, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  gain.connect(audio.destination);

  const frequencies = stage === "unlock" ? [96, 144, 216] : stage === "burst" ? [520, 740, 980] : [880, 660, 440];
  frequencies.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    oscillator.type = stage === "unlock" ? "sawtooth" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.04);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.24, now + 0.32 + index * 0.04);
    oscillator.connect(gain);
    oscillator.start(now + index * 0.04);
    oscillator.stop(now + 0.5 + index * 0.04);
  });

  window.setTimeout(() => void audio.close(), 720);
}

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [phase, setPhase] = useState<(typeof PHASE_TIMINGS)[number]["phase"]>("Vault");
  const { enabled: soundEnabled } = useSoundEffects();
  const vaultTicks = useMemo(() => Array.from({ length: 36 }, (_, index) => index), []);

  const tiles = useMemo<Tile[]>(() => {
    return Array.from({ length: TILE_COLUMNS * TILE_ROWS }, (_, index) => {
      const column = index % TILE_COLUMNS;
      const row = Math.floor(index / TILE_COLUMNS);
      const fromCenterX = column - (TILE_COLUMNS - 1) / 2;
      const fromCenterY = row - (TILE_ROWS - 1) / 2;

      return {
        id: `${column}-${row}`,
        column,
        row,
        x: fromCenterX * 24,
        y: fromCenterY * 18,
      };
    });
  }, []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
      const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
      const radius = 150 + (index % 7) * 20;

      return {
        id: `particle-${index}`,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 3 + (index % 4),
        delay: (index % 8) * 0.035,
      };
    });
  }, []);

  const featuredProjects = useMemo(() => {
    const curated = FEATURED_PROJECT_KEYS.map((key) => PROJECTS.find((project) => project.key === key)).filter(
      (project): project is (typeof PROJECTS)[number] => Boolean(project),
    );

    return curated.length > 0 ? curated : PROJECTS.slice(0, 4);
  }, []);
  const experience = EXPERIENCE_ITEMS[0];
  const activeProjects = isCompact ? featuredProjects.slice(0, 1) : featuredProjects;
  const activeParticles = isCompact ? particles.slice(0, 14) : particles;
  const activeTiles = isCompact ? tiles.filter((_, index) => index % 2 === 0) : tiles;
  const preloadImages = useMemo(
    () => ["/assets/profile.jpg", ...featuredProjects.map((project) => project.image)],
    [featuredProjects],
  );

  const finishIntro = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    const syncViewport = () => setIsCompact(window.innerWidth < 640 || window.matchMedia("(pointer: coarse)").matches);
    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const jobs = preloadImages.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new window.Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = src;
        }),
    );

    Promise.all(jobs).then(() => {
      if (!cancelled) setAssetsReady(true);
    });

    const fallback = window.setTimeout(() => setAssetsReady(true), 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [preloadImages]);

  useEffect(() => {
    if (!visible || !assetsReady) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisible(false);
      return;
    }

    const soundTimers = [
      window.setTimeout(() => soundEnabled && playVaultTone("unlock"), 420),
      window.setTimeout(() => soundEnabled && playVaultTone("burst"), 2750),
      window.setTimeout(() => soundEnabled && playVaultTone("enter"), 5050),
    ];
    const phaseTimers = PHASE_TIMINGS.map(({ phase: nextPhase, at }) =>
      window.setTimeout(() => setPhase(nextPhase), at),
    );
    const endTimer = window.setTimeout(finishIntro, TOTAL_DURATION);

    return () => {
      soundTimers.forEach((timer) => window.clearTimeout(timer));
      phaseTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(endTimer);
    };
  }, [assetsReady, finishIntro, soundEnabled, visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="status"
          aria-label="Opening Janmejoy portfolio intro animation"
          aria-live="polite"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.7, ease: "easeInOut" } }}
          className="fixed inset-0 z-[160] overflow-hidden bg-[#02040a]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(6,182,212,0.22),transparent_31%),radial-gradient(circle_at_78%_18%,rgba(217,70,239,0.14),transparent_27%),radial-gradient(circle_at_18%_78%,rgba(14,165,233,0.12),transparent_26%),linear-gradient(135deg,#020617,#050816_48%,#03131f)]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:38px_38px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0_42%,rgba(0,0,0,0.6)_82%)]" />
          <motion.div
            aria-hidden="true"
            initial={{ x: "-35%", opacity: 0 }}
            animate={{ x: "135%", opacity: [0, 0.52, 0] }}
            transition={{ duration: 4.1, delay: 0.55, ease: "easeInOut" }}
            className="absolute top-0 h-full w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] blur-sm"
          />

          <div className="absolute left-4 top-4 z-50 hidden rounded-full border border-white/12 bg-white/[0.045] px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cyan-50/70 backdrop-blur sm:block">
            Janmejoy Portfolio / Secure Entry
          </div>

          <button
            type="button"
            onClick={finishIntro}
            aria-label="Skip intro animation and enter portfolio"
            className="pointer-events-auto absolute right-4 top-4 z-50 rounded-full border border-white/16 bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur transition hover:border-cyan-200/45 hover:text-white"
          >
            Skip
          </button>

          <motion.div
            aria-hidden="true"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: [1, 1, 0], scale: [1, 1.02, 1.16] }}
            transition={{ duration: 2.2, times: [0, 0.72, 1], delay: 0.2, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 z-30 h-[min(82vw,33rem)] w-[min(82vw,33rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/35 bg-[conic-gradient(from_90deg,rgba(34,211,238,0.18),rgba(255,255,255,0.055),rgba(217,70,239,0.16),rgba(34,211,238,0.18))] shadow-[0_0_110px_rgba(34,211,238,0.26)]"
          >
            {vaultTicks.map((tick) => (
              <span
                key={tick}
                className="absolute left-1/2 top-1/2 h-[47%] w-px origin-bottom -translate-x-1/2 -translate-y-full"
                style={{ transform: `translate(-50%, -100%) rotate(${tick * 10}deg)` }}
              >
                <span className={`block h-3 w-px rounded-full ${tick % 3 === 0 ? "bg-cyan-100/70" : "bg-white/22"}`} />
              </span>
            ))}
            <motion.div
              animate={{ rotate: [0, 34, 110] }}
              transition={{ duration: 1.75, delay: 0.26, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-[7%] rounded-full border border-white/18 bg-[radial-gradient(circle,rgba(2,6,23,0.94)_0_24%,rgba(8,47,73,0.9)_25%_30%,rgba(15,23,42,0.9)_31%_46%,rgba(2,6,23,0.98)_47%_100%)] shadow-[inset_0_0_60px_rgba(255,255,255,0.05)]"
            />
            <motion.div
              animate={{ rotate: [0, -55, -160] }}
              transition={{ duration: 1.75, delay: 0.32, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-[20%] rounded-full border border-cyan-200/45 bg-[conic-gradient(from_0deg,transparent_0_12%,rgba(34,211,238,0.55)_13%_17%,transparent_18%_38%,rgba(255,255,255,0.28)_39%_43%,transparent_44%_100%)]"
            />
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: [1, 0.56, 0.08], opacity: [1, 1, 0] }}
              transition={{ duration: 1.45, delay: 0.66, ease: "easeInOut" }}
              className="absolute inset-[35%] rounded-full border border-cyan-100/70 bg-cyan-200/16 shadow-[0_0_32px_rgba(165,243,252,0.62)]"
            />
            <p className="absolute left-1/2 top-[calc(50%+8rem)] -translate-x-1/2 text-center text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-cyan-50/70">
              Vault sequence active
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: [1, 1, 1.08], opacity: [1, 1, 0.86] }}
            transition={{ duration: 0.95, times: [0, 0.55, 1], delay: 5.35, ease: "easeInOut" }}
            className="relative z-10 flex h-full items-center justify-center px-5 py-16"
          >
            <div className="grid w-full max-w-6xl items-center gap-7 md:grid-cols-[minmax(245px,340px)_1fr]">
              <div className="relative mx-auto w-full max-w-[310px] [perspective:1200px]">
                <motion.div
                  aria-hidden="true"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: [0, 0.75, 0.75, 0], scale: [0.9, 1, 1.04, 1.1] }}
                  transition={{ duration: 3.7, times: [0, 0.24, 0.76, 1], delay: 1.05, ease: "easeOut" }}
                  className="absolute inset-[-10px] rounded-[34px] border border-cyan-100/16 bg-cyan-200/[0.035] shadow-[0_0_70px_rgba(34,211,238,0.18)]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.82, y: 26, rotateX: 8 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.82, 1, 1, 0.96], y: [26, 0, 0, -12], rotateX: [8, 0, 0, -4] }}
                  transition={{ duration: 3.45, times: [0, 0.25, 0.76, 1], delay: 1.15, ease: "easeOut" }}
                  className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/18 bg-white/8 shadow-[0_32px_90px_rgba(2,6,23,0.52)] [transform-style:preserve-3d]"
                >
                  <Image
                    src="/assets/profile.jpg"
                    alt="Janmejoy Mahato"
                    fill
                    priority
                    sizes="310px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.28),transparent_34%,transparent_70%,rgba(34,211,238,0.24))]" />
                  <motion.div
                    aria-hidden="true"
                    initial={{ y: "-120%", opacity: 0 }}
                    animate={{ y: ["-120%", "120%"], opacity: [0, 0.9, 0] }}
                    transition={{ duration: 1.2, delay: 1.75, ease: "easeInOut" }}
                    className="absolute inset-x-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(165,243,252,0.34),transparent)]"
                  />
                  <div aria-hidden="true" className="absolute left-3 top-3 h-8 w-8 border-l border-t border-cyan-100/55" />
                  <div aria-hidden="true" className="absolute right-3 top-3 h-8 w-8 border-r border-t border-cyan-100/55" />
                  <div aria-hidden="true" className="absolute bottom-3 left-3 h-8 w-8 border-b border-l border-cyan-100/55" />
                  <div aria-hidden="true" className="absolute bottom-3 right-3 h-8 w-8 border-b border-r border-cyan-100/55" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0, 1, 0.96] }}
                    transition={{ duration: 1.85, times: [0, 0.32, 0.48, 1], delay: 2.45 }}
                    className="absolute inset-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${TILE_COLUMNS}, 1fr)`,
                      gridTemplateRows: `repeat(${TILE_ROWS}, 1fr)`,
                    }}
                  >
                    {activeTiles.map((tile, index) => {
                      const tileStyle: CSSProperties = {
                        backgroundImage: "url('/assets/profile.jpg')",
                        backgroundSize: `${TILE_COLUMNS * 100}% ${TILE_ROWS * 100}%`,
                        backgroundPosition: `${(tile.column / (TILE_COLUMNS - 1)) * 100}% ${
                          (tile.row / (TILE_ROWS - 1)) * 100
                        }%`,
                      };

                      return (
                        <motion.span
                          key={tile.id}
                          style={tileStyle}
                          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                          animate={{
                            opacity: [1, 1, 0],
                            x: [0, tile.x, tile.x * 2.45],
                            y: [0, tile.y, tile.y * 2.45],
                            scale: [1, 0.92, 0.12],
                            rotate: [0, (index % 2 === 0 ? 1 : -1) * 18],
                          }}
                          transition={{
                            duration: 1.25,
                            delay: 2.72 + (index % TILE_COLUMNS) * 0.02 + tile.row * 0.014,
                            ease: "easeInOut",
                          }}
                          className="block border border-white/[0.035]"
                        />
                      );
                    })}
                  </motion.div>
                </motion.div>

                {activeParticles.map((particle) => (
                  <motion.span
                    key={particle.id}
                    aria-hidden="true"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 0], x: particle.x, y: particle.y, scale: [0.4, 1, 0.2] }}
                    transition={{ duration: 0.95, delay: 2.95 + particle.delay, ease: "easeOut" }}
                    className="absolute left-1/2 top-1/2 rounded-full bg-cyan-100 shadow-[0_0_16px_rgba(165,243,252,0.9)]"
                    style={{ height: particle.size, width: particle.size }}
                  />
                ))}
              </div>

              <div className="min-h-[420px] text-center md:text-left">
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [16, 0, 0, -14] }}
                  transition={{ duration: 2, times: [0, 0.28, 0.78, 1], delay: 1.35, ease: "easeOut" }}
                  className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-100/70"
                >
                  Access granted
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
                  animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -18], filter: ["blur(12px)", "blur(0px)", "blur(0px)", "blur(8px)"] }}
                  transition={{ duration: 2.45, times: [0, 0.24, 0.76, 1], delay: 3.05, ease: "easeOut" }}
                  className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-normal text-white [text-wrap:balance] sm:text-5xl md:text-6xl"
                >
                  Welcome to Janmejoy Portfolio
                </motion.h1>
                <motion.div
                  aria-hidden="true"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.9, times: [0, 0.22, 0.82, 1], delay: 3.42, ease: "easeOut" }}
                  className="mx-auto mt-4 h-px max-w-xl origin-left bg-gradient-to-r from-transparent via-cyan-100 to-transparent md:mx-0"
                />
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -10] }}
                  transition={{ duration: 1.9, times: [0, 0.24, 0.8, 1], delay: 3.52, ease: "easeOut" }}
                  className="mx-auto mt-4 max-w-xl text-sm font-medium uppercase tracking-[0.22em] text-white/60 md:mx-0"
                >
                  Full Stack Developer / Cybersecurity Enthusiast
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [18, 0, 0, -18], scale: [0.95, 1, 1, 1.04] }}
                  transition={{ duration: 1.8, times: [0, 0.2, 0.82, 1], delay: 3.85, ease: "easeOut" }}
                  className="mt-7 rounded-2xl border border-cyan-200/22 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(255,255,255,0.045))] p-4 text-left shadow-[0_0_42px_rgba(34,211,238,0.14)] backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-cyan-100/70">Experience badge</p>
                      <p className="mt-2 text-xl font-semibold text-white">{experience?.role ?? "Full Stack Developer"}</p>
                      <p className="mt-1 text-sm text-white/58">{experience?.company ?? "3+ Years"} / {experience?.location ?? "Remote"}</p>
                    </div>
                    <span className="w-fit rounded-full border border-cyan-200/20 bg-black/35 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                      Verified
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.55, times: [0, 0.24, 0.8, 1], delay: 4.45, ease: "easeOut" }}
                  className="mt-4 hidden gap-3 sm:grid sm:grid-cols-2"
                >
                  {activeProjects.map((project, index) => (
                    <motion.article
                      key={project.key}
                      initial={{ opacity: 0, scale: 0.72, y: 28 }}
                      animate={{ opacity: [0, 1, 1, 0], scale: [0.72, 1, 1, 1.12], y: [28, 0, 0, -24] }}
                      transition={{ duration: 1.15, delay: 4.52 + index * 0.09, ease: "easeOut" }}
                      className="relative min-h-[82px] overflow-hidden rounded-xl border border-fuchsia-200/18 bg-[linear-gradient(145deg,rgba(217,70,239,0.1),rgba(255,255,255,0.04))] p-3 text-left shadow-[0_0_34px_rgba(217,70,239,0.12)] backdrop-blur"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-100/70 to-transparent" />
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                          <Image src={project.image} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-fuchsia-100/55">Module 0{index + 1}</p>
                          <div className="mt-0.5 flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{project.title}</p>
                            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/55">
                              {PROJECT_METRICS[project.key] ?? "Featured"}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/56">{project.shortDescription}</p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-x-5 bottom-7 z-40 mx-auto max-w-4xl">
            <div className="grid grid-cols-3 gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/45 sm:grid-cols-6">
              {STATUS_STEPS.map((step, index) => (
                <motion.div
                  key={step}
                  animate={{ opacity: phase === step ? 1 : 0.42 }}
                  transition={{ duration: 0.32 }}
                  className="flex items-center gap-2"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${phase === step ? "bg-cyan-100 shadow-[0_0_12px_rgba(165,243,252,0.9)]" : "bg-white/30"}`} />
                  <span>{step}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: TOTAL_DURATION / 1000 - 0.45, ease: "easeInOut" }}
                className="h-full origin-left rounded-full bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300"
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 0, 1, 0], y: [8, 8, 0, -8] }}
              transition={{ duration: 1.15, times: [0, 0.24, 0.55, 1], delay: 5.18, ease: "easeOut" }}
              className="mt-3 text-center text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cyan-50/70"
            >
              System ready
            </motion.p>
          </div>

          <motion.div
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 0, 1.05, 1.85], opacity: [0, 0, 0.9, 0] }}
            transition={{ duration: 0.95, times: [0, 0.34, 0.6, 1], delay: 5.42, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 z-20 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/70"
          />
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 0] }}
            transition={{ duration: 0.86, times: [0, 0.38, 0.56, 1], delay: 5.58 }}
            className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.96),rgba(165,243,252,0.88)_38%,rgba(217,70,239,0.58)_100%)]"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
