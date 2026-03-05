"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { MouseEvent } from "react";

type Offset = { x: number; y: number };

const ITEMS = [
  { emoji: "🐧", label: "Linux" },
  { emoji: "🔐", label: "Security" },
  { emoji: "⚡", label: "Performance" },
  { emoji: "🎨", label: "Design" },
  { emoji: "🧠", label: "Problem Solving" },
  { emoji: "🚀", label: "Build" },
];

export default function PlayfulFooterItems() {
  const [offsets, setOffsets] = useState<Offset[]>(() =>
    ITEMS.map(() => ({ x: 0, y: 0 })),
  );

  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSoundRef = useRef(0);

  const playMoveSound = () => {
    const now = performance.now();
    if (now - lastSoundRef.current < 90) return;
    lastSoundRef.current = now;

    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(780, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(510, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.024, ctx.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  };

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const radius = 150;

    let activeCount = 0;
    const next = refs.current.map((node) => {
      if (!node) return { x: 0, y: 0 };

      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = pointerX - cx;
      const dy = pointerY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > radius || dist === 0) return { x: 0, y: 0 };

      const force = ((radius - dist) / radius) * 18;
      if (force > 3) activeCount += 1;
      return { x: (-dx / dist) * force, y: (-dy / dist) * force - force * 0.15 };
    });

    setOffsets(next);
    if (activeCount > 0) {
      playMoveSound();
    }
  };

  const resetOffsets = () => {
    setOffsets(ITEMS.map(() => ({ x: 0, y: 0 })));
  };

  return (
    <div className="mt-12">
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/45">Interactive Footer Items</p>
      <div
        className="surface relative overflow-hidden rounded-2xl p-4 md:p-5"
        onMouseMove={handleMove}
        onMouseLeave={resetOffsets}
      >
        <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
          {ITEMS.map((item, index) => (
            <motion.div
              key={item.label}
              ref={(node) => {
                refs.current[index] = node;
              }}
              animate={{ y: [0, -4 - (index % 3), 0] }}
              transition={{
                duration: 1.9 + (index % 3) * 0.35,
                repeat: Infinity,
                ease: [0.42, 0, 0.58, 1] as const,
                delay: index * 0.08,
              }}
              className="will-change-transform"
            >
              <motion.button
                type="button"
                style={{ x: offsets[index]?.x ?? 0, y: offsets[index]?.y ?? 0 }}
                whileHover={{ scale: 1.08, rotate: [-2, 2, 0] }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              >
                <span className="mr-1.5">{item.emoji}</span>
                {item.label}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
