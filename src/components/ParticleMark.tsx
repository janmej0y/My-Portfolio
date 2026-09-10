"use client";

import { MutableRefObject, useEffect, useRef } from "react";

/**
 * WebGL particle field masked to a glyph.
 *
 * A 2D canvas rasterises the letter; its raw pixel data becomes an RGBA mask
 * texture. Particles are seeded densely at points that already fall inside the
 * glyph, and the fragment shader discards any fragment landing where the mask
 * is transparent - so the letterform is built out of particles rather than
 * drawn as one.
 *
 * Positions are integrated on the CPU each frame (spring toward home, damping,
 * speed cap) and uploaded with bufferSubData. That is what gives the field its
 * settling, alive quality; interpolating straight to the target reads as a
 * slide rather than a swarm.
 */

const VERT = `
attribute vec2 a_position;
attribute vec3 a_motion;   // x: phase, y: speed, z: disturbance 0-1
attribute vec3 a_color;
attribute float a_size;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_pixel_ratio;
uniform float u_fade;

varying vec3 v_color;
varying float v_alpha;
varying float v_interaction;

void main() {
  float wave = sin(u_time * a_motion.y + a_motion.x);
  vec2 clipPosition = a_position / u_resolution * 2.0 - 1.0;
  clipPosition.y *= -1.0;

  gl_Position = vec4(clipPosition, 0.0, 1.0);
  gl_PointSize = a_size * u_pixel_ratio * (
    0.94 + sin(u_time * a_motion.y * 0.72 + a_motion.x) * 0.06
  );

  v_color = a_color;
  v_alpha = (0.9 + wave * 0.08) * u_fade;
  v_interaction = a_motion.z;
}
`;

const FRAG = `
precision mediump float;

uniform sampler2D u_mask;
uniform vec2 u_buffer_resolution;

varying vec3 v_color;
varying float v_alpha;
varying float v_interaction;

void main() {
  vec2 maskUv = vec2(
    gl_FragCoord.x / u_buffer_resolution.x,
    1.0 - gl_FragCoord.y / u_buffer_resolution.y
  );
  float maskAlpha = texture2D(u_mask, maskUv).a;
  vec2 point = gl_PointCoord - vec2(0.5);
  float distanceFromCenter = length(point);

  // A disturbed particle stays visible outside the glyph; a settled one does not.
  if ((maskAlpha < 0.2 && v_interaction < 0.02) || distanceFromCenter > 0.5) {
    discard;
  }

  float particleAlpha = 1.0 - smoothstep(0.16, 0.5, distanceFromCenter);
  float maskCoverage = smoothstep(0.2, 0.8, maskAlpha);
  float interactionCoverage = smoothstep(0.0, 0.15, v_interaction);
  gl_FragColor = vec4(
    v_color,
    particleAlpha * v_alpha * mix(maskCoverage, 1.0, interactionCoverage)
  );
}
`;

/** Brand palette, sampled per particle. */
const PALETTE: [number, number, number][] = [
  [34, 211, 238],
  [56, 189, 248],
  [167, 139, 250],
  [217, 70, 239],
  [255, 255, 255],
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type ParticleMarkProps = {
  glyph?: string;
  /** 0 = scattered, 1 = settled. Scales how hard particles spring home. */
  progressRef: MutableRefObject<number>;
  /** 0 = held, 1 = fully burst outward. */
  burstRef: MutableRefObject<number>;
  onUnsupported?: () => void;
};

/** Per-particle render attributes: pos(2) motion(3) color(3) size(1). */
const RENDER_STRIDE = 9;
/** Per-particle simulation state: pos(2) home(2) velocity(2) scale(1). */
const SIM_STRIDE = 7;

export default function ParticleMark({
  glyph = "J",
  progressRef,
  burstRef,
  onUnsupported,
}: ParticleMarkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) {
      onUnsupported?.();
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      onUnsupported?.();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      onUnsupported?.();
      return;
    }

    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!buffer || !texture) {
      onUnsupported?.();
      return;
    }

    const loc = {
      position: gl.getAttribLocation(program, "a_position"),
      motion: gl.getAttribLocation(program, "a_motion"),
      color: gl.getAttribLocation(program, "a_color"),
      size: gl.getAttribLocation(program, "a_size"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      ratio: gl.getUniformLocation(program, "u_pixel_ratio"),
      fade: gl.getUniformLocation(program, "u_fade"),
      bufferRes: gl.getUniformLocation(program, "u_buffer_resolution"),
      mask: gl.getUniformLocation(program, "u_mask"),
    };

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!maskCtx) {
      onUnsupported?.();
      return;
    }

    let width = 0;
    let height = 0;
    let ratio = 1;
    let count = 0;
    let frame = 0;
    let disposed = false;
    let render = new Float32Array();
    let sim = new Float32Array();
    let last = performance.now();
    const start = performance.now();

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      ratio = Math.min(window.devicePixelRatio || 1, 1.75);

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      maskCanvas.width = Math.max(1, Math.round(width));
      maskCanvas.height = Math.max(1, Math.round(height));

      const fontSize = Math.min(width * 0.62, height * 0.78);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.fillStyle = "#ffffff";
      maskCtx.textAlign = "center";
      maskCtx.textBaseline = "middle";
      maskCtx.font = `700 ${fontSize}px "Sora", "Trebuchet MS", system-ui, sans-serif`;
      maskCtx.fillText(glyph, maskCanvas.width / 2, maskCanvas.height / 2);

      const { data } = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

      // Scale everything off the glyph size so density holds across viewports.
      const scale = Math.sqrt(clamp(fontSize / 144, 0.75, 2));
      // Sampling step sets the particle count, and every particle is simulated
      // on the CPU each frame. A ~1.4px grid gives ~28k particles, which a
      // desktop absorbs but a phone cannot - it pushed LCP to 38s under
      // Lighthouse's 4x CPU throttle. Coarser grid on weak hardware.
      const nav = navigator as Navigator & { deviceMemory?: number };
      const weak =
        (nav.hardwareConcurrency ?? 8) <= 4 ||
        (nav.deviceMemory ?? 8) <= 4 ||
        window.matchMedia("(pointer: coarse)").matches;
      const density = weak ? 3.2 : 1.4;
      const step = Math.max(1, Math.round(density * scale));
      const minSize = 2 * scale;
      const maxSize = 3.2 * scale;

      const alphaAt = (x: number, y: number) => {
        const cx = clamp(Math.round(x), 0, maskCanvas.width - 1);
        const cy = clamp(Math.round(y), 0, maskCanvas.height - 1);
        return data[(cy * maskCanvas.width + cx) * 4 + 3];
      };

      const renderList: number[] = [];
      const simList: number[] = [];
      let paletteIndex = Math.floor(Math.random() * PALETTE.length);
      const diagonal = Math.hypot(width, height);

      for (let y = step / 2; y < height; y += step) {
        for (let x = step / 2; x < width; x += step) {
          // Jitter off the grid so the fill never looks like a screen door;
          // fall back to the exact grid point if the jitter leaves the glyph.
          let px = x + rand(-0.34 * step, 0.34 * step);
          let py = y + rand(-0.34 * step, 0.34 * step);
          if (alphaAt(px, py) < 96) {
            px = x;
            py = y;
          }
          if (alphaAt(px, py) < 96) continue;

          const tint = PALETTE[paletteIndex % PALETTE.length];
          paletteIndex += 1;

          // Start scattered on a ring outside the frame; physics pulls them in.
          const angle = Math.random() * Math.PI * 2;
          const radius = diagonal * rand(0.55, 1.05);
          const sx = width / 2 + Math.cos(angle) * radius;
          const sy = height / 2 + Math.sin(angle) * radius;

          renderList.push(
            sx,
            sy,
            Math.random() * Math.PI * 2,
            rand(0.85, 1.35),
            1, // starts disturbed so it is visible outside the mask in flight
            tint[0] / 255,
            tint[1] / 255,
            tint[2] / 255,
            rand(minSize, maxSize),
          );
          simList.push(sx, sy, px, py, 0, 0, rand(1.25, 2.25));
        }
      }

      count = renderList.length / RENDER_STRIDE;
      render = new Float32Array(renderList);
      sim = new Float32Array(simList);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, render, gl.DYNAMIC_DRAW);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Upload the raw ImageData buffer: its alpha channel is the mask.
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        maskCanvas.width,
        maskCanvas.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
      );
    };

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const bytes = RENDER_STRIDE * Float32Array.BYTES_PER_ELEMENT;
    gl.enableVertexAttribArray(loc.position);
    gl.vertexAttribPointer(loc.position, 2, gl.FLOAT, false, bytes, 0);
    gl.enableVertexAttribArray(loc.motion);
    gl.vertexAttribPointer(loc.motion, 3, gl.FLOAT, false, bytes, 2 * 4);
    gl.enableVertexAttribArray(loc.color);
    gl.vertexAttribPointer(loc.color, 3, gl.FLOAT, false, bytes, 5 * 4);
    gl.enableVertexAttribArray(loc.size);
    gl.vertexAttribPointer(loc.size, 1, gl.FLOAT, false, bytes, 8 * 4);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(loc.mask, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    // Fonts must be ready or the mask rasterises in a fallback face and the
    // whole letterform changes shape once the real font lands.
    build();
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) build();
      });
    }

    const simulate = (dt: number) => {
      const burst = burstRef.current;
      // The loader's timeline scales how hard particles are pulled home, so the
      // glyph finishes assembling in step with the rest of the sequence.
      const assemble = clamp(progressRef.current, 0, 1);

      for (let i = 0; i < count; i += 1) {
        const r = i * RENDER_STRIDE;
        const s = i * SIM_STRIDE;

        let px = sim[s];
        let py = sim[s + 1];
        const hx = sim[s + 2];
        const hy = sim[s + 3];
        let vx = sim[s + 4];
        let vy = sim[s + 5];
        const scale = sim[s + 6];

        if (burst > 0) {
          // Detonate: push away from the glyph centre, accelerating.
          const ax = px - width / 2;
          const ay = py - height / 2;
          const len = Math.max(Math.hypot(ax, ay), 0.1);
          const push = burst * burst * 26 * scale;
          vx += (ax / len) * push;
          vy += (ay / len) * push;
          px += vx * dt * 45;
          py += vy * dt * 45;
          sim[s] = px;
          sim[s + 1] = py;
          sim[s + 4] = vx;
          sim[s + 5] = vy;
          render[r] = px;
          render[r + 1] = py;
          render[r + 4] = 1; // stay visible outside the mask while bursting
          continue;
        }

        // Spring toward home with damping and a speed ceiling.
        const dx = hx - px;
        const dy = hy - py;
        const dist = Math.hypot(dx, dy);
        const reach = 20 * scale;
        const settleRadius = 2 * reach;
        const maxSpeed = 15 * scale;

        let pull = (0.05 + 0.08 * Math.pow(dist / reach, 1.5)) * 0.6;
        if (dist > settleRadius) pull = Math.max(pull, Math.min(1, (dist - settleRadius) / reach));
        // Ramp from a gentle drift to the full spring across the fly-in.
        pull *= 0.35 + assemble * 1.15;

        // Idle jitter, only once close enough that it reads as shimmer.
        let jx = 0;
        let jy = 0;
        if (dist <= reach) {
          const j = scale * (1 - dist / reach) * 0.6;
          jx = rand(-j / 2, j / 2);
          jy = rand(-j / 2, j / 2);
        }

        vx = (vx + dx * pull + jx) * 0.9;
        vy = (vy + dy * pull + jy) * 0.9;

        const speed = Math.hypot(vx, vy);
        if (speed > maxSpeed) {
          const k = maxSpeed / speed;
          vx *= k;
          vy *= k;
        }

        px += vx * dt * 45;
        py += vy * dt * 45;

        sim[s] = px;
        sim[s + 1] = py;
        sim[s + 4] = vx;
        sim[s + 5] = vy;
        render[r] = px;
        render[r + 1] = py;
        // Disturbance fades as the particle nears home, so the mask starts
        // clipping it exactly as it arrives - that is what "forms" the glyph.
        render[r + 4] = Math.min(1, dist / Math.max(reach, 1));
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, render);
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!count) return;

      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      simulate(dt);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(loc.resolution, width, height);
      gl.uniform2f(loc.bufferRes, canvas.width, canvas.height);
      gl.uniform1f(loc.time, (now - start) / 1000);
      gl.uniform1f(loc.ratio, ratio);
      gl.uniform1f(loc.fade, Math.max(0, 1 - burstRef.current));
      gl.drawArrays(gl.POINTS, 0, count);
    };

    frame = requestAnimationFrame(draw);

    const onResize = () => build();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    };
  }, [glyph, onUnsupported, progressRef, burstRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block size-full" />;
}
