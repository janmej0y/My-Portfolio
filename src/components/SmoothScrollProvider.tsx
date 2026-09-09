"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Reduced motion is the only hard opt-out. Touch devices used to bail out
    // here too, which left mobile on raw native scroll - the finger-slide felt
    // abrupt and nothing eased. Lenis handles touch via syncTouch instead.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const touchDevice = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
      duration: 0.82,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      lerp: 0.105,
      anchors: true,
      // Touch needs its own feel: syncTouch keeps the content glued to the
      // finger, and the higher lerp lets the glide settle quickly instead of
      // drifting past where the user let go.
      syncTouch: touchDevice,
      syncTouchLerp: 0.075,
      touchMultiplier: touchDevice ? 1.6 : 1,
      touchInertiaExponent: 1.7,
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
