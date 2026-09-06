"use client";

import { useEffect, useRef } from "react";

type TrailPoint = {
  x: number;
  y: number;
  life: number;
};

const MAX_POINTS = 26;
const FADE_PER_MS = 0.0022;

/**
 * Canvas ribbon that follows the pointer (mouse move or finger slide).
 * Kept out of React state on purpose: the trail redraws every frame, so
 * storing points in a ref avoids a re-render per pointer event.
 */
export default function PointerTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();

    const readAccent = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim();
      return raw ? raw.split(/\s+/).join(", ") : "34, 211, 238";
    };

    let accent = readAccent();

    const addPoint = (x: number, y: number) => {
      const points = pointsRef.current;
      const last = points[points.length - 1];
      // Skip micro-moves so the ribbon does not bunch up while hovering in place.
      if (last && Math.hypot(x - last.x, y - last.y) < 4) return;
      points.push({ x, y, life: 1 });
      if (points.length > MAX_POINTS) points.shift();
    };

    const onPointerMove = (event: PointerEvent) => {
      addPoint(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) addPoint(touch.clientX, touch.clientY);
    };

    const draw = (now: number) => {
      rafRef.current = window.requestAnimationFrame(draw);

      const delta = lastFrameRef.current ? now - lastFrameRef.current : 16;
      lastFrameRef.current = now;

      const points = pointsRef.current;
      for (const point of points) {
        point.life -= delta * FADE_PER_MS;
      }
      while (points.length && points[0].life <= 0) points.shift();

      context.clearRect(0, 0, width, height);
      if (points.length < 2) return;

      context.lineCap = "round";
      context.lineJoin = "round";

      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const progress = index / points.length;
        const life = Math.max(0, current.life);

        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(current.x, current.y);
        context.lineWidth = 1.5 + progress * 8.5 * life;
        context.strokeStyle = `rgba(${accent}, ${0.5 * life * progress})`;
        context.shadowBlur = 14 * life;
        context.shadowColor = `rgba(${accent}, ${0.34 * life})`;
        context.stroke();
      }

      context.shadowBlur = 0;
    };

    rafRef.current = window.requestAnimationFrame(draw);

    const onThemeChange = () => {
      accent = readAccent();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("portfolio-theme-change", onThemeChange);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", resize);
      window.removeEventListener("portfolio-theme-change", onThemeChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[134]"
    />
  );
}
