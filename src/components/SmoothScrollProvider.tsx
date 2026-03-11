"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: coarsePointer ? 0.8 : 1,
      smoothWheel: true,
      wheelMultiplier: coarsePointer ? 0.8 : 0.9,
      touchMultiplier: coarsePointer ? 0.95 : 1.05,
      lerp: coarsePointer ? 0.12 : 0.085,
      syncTouch: coarsePointer,
      syncTouchLerp: coarsePointer ? 0.12 : 0.08,
      anchors: true,
    });

    document.documentElement.classList.add("lenis");
    (window as Window & { __portfolioLenis?: Lenis }).__portfolioLenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    const onResize = () => lenis.resize();
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        return;
      }
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.documentElement.classList.remove("lenis");
      delete (window as Window & { __portfolioLenis?: Lenis }).__portfolioLenis;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
