"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type FlyingItem = {
  index: number;
  emoji: string;
  label: string;
  startX: number;
  startY: number;
};

const ITEMS = [
  { emoji: "\u{1F427}", label: "Linux" },
  { emoji: "\u{1F510}", label: "Security" },
  { emoji: "\u26A1", label: "Performance" },
  { emoji: "\u{1F3A8}", label: "Design" },
  { emoji: "\u{1F9E0}", label: "Problem Solving" },
  { emoji: "\u{1F680}", label: "Build" },
];

export default function PlayfulFooterItems() {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const timersRef = useRef<number[]>([]);
  const runningRef = useRef(false);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);
  const sirenTimerRef = useRef<number | null>(null);

  const [sequenceStarted, setSequenceStarted] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [launchedCount, setLaunchedCount] = useState(0);
  const [flying, setFlying] = useState<FlyingItem | null>(null);
  const [burstingIndex, setBurstingIndex] = useState<number | null>(null);
  const [burstSeed, setBurstSeed] = useState(0);

  const particles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / 16;
      const distance = 72 + (index % 5) * 12;
      return {
        id: index,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      stopAlertSound();
    };
  }, []);

  const startSirenFallback = () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => null);
    }

    if (sirenOscRef.current) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(560, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    let high = false;
    sirenTimerRef.current = window.setInterval(() => {
      high = !high;
      osc.frequency.setTargetAtTime(high ? 900 : 560, ctx.currentTime, 0.06);
    }, 200);

    sirenOscRef.current = osc;
    sirenGainRef.current = gain;
  };

  const stopAlertSound = () => {
    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }

    if (sirenTimerRef.current) {
      window.clearInterval(sirenTimerRef.current);
      sirenTimerRef.current = null;
    }
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
      } catch {}
      sirenOscRef.current.disconnect();
      sirenOscRef.current = null;
    }
    if (sirenGainRef.current) {
      sirenGainRef.current.disconnect();
      sirenGainRef.current = null;
    }
  };

  const runStep = (index: number) => {
    if (index >= ITEMS.length) {
      setFlying(null);
      setBurstingIndex(null);
      setCleared(true);
      runningRef.current = false;
      stopAlertSound();
      return;
    }

    const node = refs.current[index];
    const rect = node?.getBoundingClientRect();
    const startX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const startY = rect ? rect.top + rect.height / 2 : window.innerHeight - 80;

    setLaunchedCount(index + 1);
    setFlying({
      index,
      emoji: ITEMS[index].emoji,
      label: ITEMS[index].label,
      startX,
      startY,
    });
  };

  const startSequence = () => {
    if (runningRef.current || sequenceStarted || cleared) return;
    runningRef.current = true;
    setSequenceStarted(true);

    if (!alertAudioRef.current) {
      alertAudioRef.current = new Audio("/assets/alert.mp3");
      alertAudioRef.current.loop = true;
      alertAudioRef.current.volume = 0.75;
      alertAudioRef.current.preload = "auto";
    }
    alertAudioRef.current.currentTime = 0;
    alertAudioRef.current.play().catch(() => {
      const fallback = new Audio("/assets/gameover.mp3");
      fallback.loop = true;
      fallback.volume = 0.72;
      fallback.play()
        .then(() => {
          alertAudioRef.current = fallback;
        })
        .catch(() => {
          startSirenFallback();
        });
    });

    runStep(0);
  };

  const handleFlyComplete = (index: number) => {
    setFlying(null);
    setBurstSeed((prev) => prev + 1);
    setBurstingIndex(index);

    const endBurstTimer = window.setTimeout(() => {
      setBurstingIndex(null);
      const nextStepTimer = window.setTimeout(() => runStep(index + 1), 140);
      timersRef.current.push(nextStepTimer);
    }, 620);

    timersRef.current.push(endBurstTimer);
  };

  const visibleItems = sequenceStarted ? ITEMS.slice(launchedCount) : ITEMS;

  return (
    <div className="mt-12">
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/45">Interactive Footer Items</p>
      <div className="surface relative overflow-hidden rounded-2xl p-4 md:p-5">
        {!cleared ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              {visibleItems.map((item, visibleIndex) => {
                const actualIndex = sequenceStarted ? visibleIndex + launchedCount : visibleIndex;
                return (
                  <motion.button
                    key={`${item.label}-${actualIndex}`}
                    ref={(node) => {
                      refs.current[actualIndex] = node;
                    }}
                    type="button"
                    onClick={startSequence}
                    animate={{ y: [0, -3 - (actualIndex % 3), 0] }}
                    transition={{
                      duration: 1.9 + (actualIndex % 3) * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: actualIndex * 0.08,
                    }}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                  >
                    <span className="mr-1.5">{item.emoji}</span>
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
            <motion.div
              animate={{ x: [0, -5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="ml-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/85"
            >
              <span className="text-sm">←</span>
              <span>Touch me to see</span>
            </motion.div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm uppercase tracking-[0.18em] text-red-300/75">Footer Cleared</div>
        )}
      </div>

      <AnimatePresence>
        {sequenceStarted && !cleared ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[132] bg-red-700/85"
          >
            <div className="grid h-full place-items-center">
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="rounded-xl border border-red-200/70 bg-black/40 px-6 py-4 text-center text-red-100 shadow-[0_14px_40px_rgba(0,0,0,0.5)]"
              >
                <p className="text-xs uppercase tracking-[0.22em]">Alert</p>
                <p className="mt-2 text-lg font-semibold">Footer meltdown sequence initiated</p>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {flying ? (
          <motion.div
            key={`fly-${flying.index}`}
            initial={{
              left: flying.startX,
              top: flying.startY,
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            animate={{
              left: "50vw",
              top: "50vh",
              opacity: 0.2,
              scale: 1.2,
              rotate: 24,
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => handleFlyComplete(flying.index)}
            className="pointer-events-none fixed z-[136] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-200/60 bg-black/55 px-4 py-2 text-sm font-semibold text-red-100 shadow-[0_16px_45px_rgba(0,0,0,0.6)]"
          >
            <span className="mr-1.5">{flying.emoji}</span>
            {flying.label}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {burstingIndex !== null ? (
          <div className="pointer-events-none fixed inset-0 z-[137]">
            {particles.map((particle, index) => (
              <motion.span
                key={`burst-${burstSeed}-${burstingIndex}-${particle.id}`}
                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-red-100"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                animate={{ x: particle.dx, y: particle.dy, opacity: [0, 1, 0], scale: [0.3, 1.15, 0.55] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.58, delay: index * 0.04, ease: "easeOut" }}
              />
            ))}
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
