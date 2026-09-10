"use client";

import { useEffect, useRef } from "react";

type TrailPoint = {
  x: number;
  y: number;
  life: number;
};

type Ripple = {
  x: number;
  y: number;
  life: number;
};

const MAX_POINTS = 30;
const FADE_PER_MS = 0.0016;

/** Stroke width at the head of the ribbon. Touch gets more, since a fingertip
    covers roughly 40-50px and a thin line simply never becomes visible. */
const HEAD_WIDTH_MOUSE = 16;
const HEAD_WIDTH_TOUCH = 30;

/** Soft halo drawn under the ribbon so it reads on busy backgrounds. */
const GLOW_MOUSE = 26;
const GLOW_TOUCH = 44;

/**
 * Canvas ribbon that follows the pointer (mouse move or finger slide).
 * Kept out of React state on purpose: the trail redraws every frame, so
 * storing points in a ref avoids a re-render per pointer event.
 */
export default function PointerTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
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
    let running = false;

    const ensureRunning = () => {
      if (running) return;
      running = true;
      lastFrameRef.current = 0;
      rafRef.current = window.requestAnimationFrame(draw);
    };
    // Sizing follows the last input used, so a hybrid device gets the right
    // treatment for whichever the person is actually using.
    let touchMode = window.matchMedia("(pointer: coarse)").matches;

    const addPoint = (x: number, y: number) => {
      const points = pointsRef.current;
      const last = points[points.length - 1];
      // Skip micro-moves so the ribbon does not bunch up while hovering in place.
      if (last && Math.hypot(x - last.x, y - last.y) < 4) return;
      points.push({ x, y, life: 1 });
      if (points.length > MAX_POINTS) points.shift();
      ensureRunning();
    };

    const onPointerMove = (event: PointerEvent) => {
      touchMode = event.pointerType !== "mouse";
      addPoint(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchMode = true;
      addPoint(touch.clientX, touch.clientY);
    };

    /** A tap or click drops an expanding ring at that spot. */
    const addRipple = (x: number, y: number) => {
      ripplesRef.current.push({ x, y, life: 1 });
      if (ripplesRef.current.length > 6) ripplesRef.current.shift();
      ensureRunning();
    };

    const onPointerDown = (event: PointerEvent) => {
      touchMode = event.pointerType !== "mouse";
      addRipple(event.clientX, event.clientY);
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchMode = true;
      addRipple(touch.clientX, touch.clientY);
    };

    const draw = (now: number) => {
      // Idle out when there is nothing to draw. The loop previously ran every
      // frame for the life of the page, which kept the main thread busy and
      // inflated TBT even while the pointer was still.
      if (!pointsRef.current.length && !ripplesRef.current.length) {
        rafRef.current = 0;
        running = false;
        context.clearRect(0, 0, width, height);
        return;
      }
      rafRef.current = window.requestAnimationFrame(draw);

      const delta = lastFrameRef.current ? now - lastFrameRef.current : 16;
      lastFrameRef.current = now;

      const points = pointsRef.current;
      for (const point of points) {
        point.life -= delta * FADE_PER_MS;
      }
      while (points.length && points[0].life <= 0) points.shift();

      const ripples = ripplesRef.current;
      for (const ripple of ripples) {
        ripple.life -= delta * 0.0018;
      }
      while (ripples.length && ripples[0].life <= 0) ripples.shift();

      context.clearRect(0, 0, width, height);

      const headWidth = touchMode ? HEAD_WIDTH_TOUCH : HEAD_WIDTH_MOUSE;
      const glow = touchMode ? GLOW_TOUCH : GLOW_MOUSE;

      // Tap rings: drawn first so the ribbon stays on top of them.
      for (const ripple of ripples) {
        const eased = 1 - ripple.life;
        const radius = 12 + eased * (touchMode ? 90 : 64);
        context.beginPath();
        context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        context.lineWidth = 2 + ripple.life * 3;
        context.strokeStyle = `rgba(${accent}, ${0.5 * ripple.life})`;
        context.shadowBlur = glow * 0.6;
        context.shadowColor = `rgba(${accent}, ${0.5 * ripple.life})`;
        context.stroke();
      }
      context.shadowBlur = 0;

      if (points.length < 2) return;

      context.lineCap = "round";
      context.lineJoin = "round";

      // The ribbon is filled as a tapered polygon rather than stroked at a
      // constant width. Stroking cannot taper, so the old version was a flat
      // band; building an outline from per-point normals gives a real
      // thick-to-thin shape that reads as motion.
      const build = (widthScale: number) => {
        const left: [number, number][] = [];
        const right: [number, number][] = [];

        for (let i = 0; i < points.length; i += 1) {
          const p0 = points[Math.max(0, i - 1)];
          const p1 = points[Math.min(points.length - 1, i + 1)];
          let dx = p1.x - p0.x;
          let dy = p1.y - p0.y;
          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;

          // Width grows toward the head and shrinks as the point fades.
          const t = i / (points.length - 1 || 1);
          const half = (headWidth * widthScale * 0.5) * Math.pow(t, 0.8) * Math.max(0, points[i].life);

          left.push([points[i].x - dy * half, points[i].y + dx * half]);
          right.push([points[i].x + dy * half, points[i].y - dx * half]);
        }

        context.beginPath();
        context.moveTo(left[0][0], left[0][1]);
        for (let i = 1; i < left.length; i += 1) context.lineTo(left[i][0], left[i][1]);
        for (let i = right.length - 1; i >= 0; i -= 1) context.lineTo(right[i][0], right[i][1]);
        context.closePath();
      };

      const tail = points[0];
      const head = points[points.length - 1];
      const headLife = Math.max(0, head.life);

      // Gradient runs along the ribbon so the tail cools into the accent while
      // the head stays hot and near-white.
      const ramp = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
      ramp.addColorStop(0, `rgba(${accent}, 0)`);
      ramp.addColorStop(0.45, `rgba(${accent}, ${0.45 * headLife})`);
      ramp.addColorStop(1, `rgba(255, 255, 255, ${0.92 * headLife})`);

      // Halo underneath, one blurred fill.
      build(1.7);
      context.fillStyle = `rgba(${accent}, ${0.18 * headLife})`;
      context.shadowBlur = glow;
      context.shadowColor = `rgba(${accent}, 0.8)`;
      context.fill();

      // Bright core on top.
      build(1);
      context.fillStyle = ramp;
      context.shadowBlur = 10;
      context.shadowColor = `rgba(${accent}, 0.9)`;
      context.fill();

      // Bright dot at the head so there is always a clear focal point.
      if (head) {
        context.beginPath();
        context.arc(head.x, head.y, (touchMode ? 9 : 6) * headLife, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${0.9 * headLife})`;
        context.shadowBlur = glow;
        context.shadowColor = `rgba(${accent}, ${0.95 * headLife})`;
        context.fill();
      }

      context.shadowBlur = 0;
    };

    const onThemeChange = () => {
      accent = readAccent();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("portfolio-theme-change", onThemeChange);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("resize", resize);
      window.removeEventListener("portfolio-theme-change", onThemeChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="cursor-layer pointer-events-none fixed inset-0 z-[230]"
    />
  );
}
