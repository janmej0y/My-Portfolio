"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const compactViewport = window.innerWidth < 1024;
    if (prefersReducedMotion || coarsePointer || compactViewport) return;

    const lenis = new Lenis({
      duration: 0.95,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      lerp: 0.085,
      syncTouch: false,
      syncTouchLerp: 0.08,
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
