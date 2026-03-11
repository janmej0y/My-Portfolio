"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

type GameTab = "typing" | "whack" | "snake";
type Point = { x: number; y: number };
type SoundKind = "tap" | "good" | "bad" | "win" | "eat" | "tick" | "spawn" | "move" | "start";

const prompts = [
  "Ship secure code before chasing flashy effects.",
  "Typed systems reduce bugs and improve confidence.",
  "Good UI feels simple because the engineering is not.",
  "Fast products still need thoughtful security decisions.",
];

const gridSize = 12;
const gameCards: Array<{ id: GameTab; label: string; note: string; detail: string }> = [
  { id: "typing", label: "Hacker Sprint", note: "Typing speed", detail: "Race a 30 second timer and keep accuracy high." },
  { id: "whack", label: "Whack-a-Bug", note: "Bug hunter", detail: "Tap fast before the bug jumps to another node." },
  { id: "snake", label: "Neon Snake", note: "Arcade run", detail: "Use touch or keys and survive longer each run." },
];

function randomPrompt(current?: string) {
  const pool = prompts.filter((item) => item !== current);
  return pool[Math.floor(Math.random() * pool.length)] ?? prompts[0];
}

function randomPoint(exclude: Point[] = []) {
  while (true) {
    const point = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    if (!exclude.some((cell) => cell.x === point.x && cell.y === point.y)) return point;
  }
}

function useGameSounds() {
  const [enabled, setEnabled] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);

  const play = (kind: SoundKind) => {
    if (!enabled || typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioRef.current) audioRef.current = new Ctx();
    const ctx = audioRef.current;
    if (ctx.state === "suspended") ctx.resume().catch(() => null);

    const config: Record<SoundKind, [number, number, OscillatorType, number, number?]> = {
      tap: [320, 0.05, "square", 0.025],
      good: [520, 0.09, "triangle", 0.04, 110],
      bad: [170, 0.14, "sawtooth", 0.03, -20],
      win: [720, 0.18, "triangle", 0.05, 180],
      eat: [580, 0.08, "triangle", 0.04, 80],
      tick: [260, 0.04, "sine", 0.015],
      spawn: [240, 0.07, "square", 0.025, 30],
      move: [430, 0.045, "square", 0.02, 55],
      start: [420, 0.12, "triangle", 0.035, 140],
    };

    const [freq, duration, type, volume, sweep] = config[kind];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (sweep) osc.frequency.linearRampToValueAtTime(freq + sweep, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  };

  useEffect(() => () => void audioRef.current?.close().catch(() => null), []);

  return { enabled, setEnabled, play };
}

export default function GameHubClient() {
  const [activeGame, setActiveGame] = useState<GameTab>("typing");
  const [selectedGame, setSelectedGame] = useState<GameTab | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const { enabled, setEnabled, play } = useGameSounds();

  const [typingPrompt, setTypingPrompt] = useState(() => randomPrompt());
  const [typingInput, setTypingInput] = useState("");
  const [typingTimeLeft, setTypingTimeLeft] = useState(30);
  const [typingStarted, setTypingStarted] = useState(false);
  const [typingCompleted, setTypingCompleted] = useState(0);
  const [typingCorrect, setTypingCorrect] = useState(0);
  const [typingTotal, setTypingTotal] = useState(0);
  const [typingBest, setTypingBest] = useState<number | null>(null);

  const [whackRunning, setWhackRunning] = useState(false);
  const [whackTimeLeft, setWhackTimeLeft] = useState(20);
  const [whackScore, setWhackScore] = useState(0);
  const [whackCombo, setWhackCombo] = useState(0);
  const [whackBest, setWhackBest] = useState(0);
  const [whackHole, setWhackHole] = useState<number | null>(null);

  const [snake, setSnake] = useState<Point[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]);
  const [snakeDir, setSnakeDir] = useState<Point>({ x: 1, y: 0 });
  const [snakeNextDir, setSnakeNextDir] = useState<Point>({ x: 1, y: 0 });
  const [snakeFood, setSnakeFood] = useState<Point>({ x: 8, y: 8 });
  const [snakeRunning, setSnakeRunning] = useState(false);
  const [snakeOver, setSnakeOver] = useState(false);
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeBest, setSnakeBest] = useState(0);

  const typingElapsed = 30 - typingTimeLeft;
  const typingWpm = useMemo(
    () => (typingElapsed <= 0 ? 0 : Math.round((typingCorrect / 5) / (typingElapsed / 60))),
    [typingCorrect, typingElapsed],
  );
  const typingAccuracy = useMemo(
    () => (typingTotal ? Math.round((typingCorrect / typingTotal) * 100) : 100),
    [typingCorrect, typingTotal],
  );

  const requestFullscreen = async () => {
    const stage = stageRef.current;
    if (!stage || typeof document === "undefined" || document.fullscreenElement === stage) return;
    if (!stage.requestFullscreen) return;

    try {
      await stage.requestFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = async () => {
    if (typeof document === "undefined" || !document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  };

  const openGame = (game: GameTab) => {
    setActiveGame(game);
    setSelectedGame(game);
    play("start");
  };

  const closeGameStage = () => {
    setSelectedGame(null);
    setIsFullscreen(false);
    setSnakeRunning(false);
    setWhackRunning(false);
    setTypingStarted(false);
    void exitFullscreen();
    play("tap");
  };

  const queueSnakeDirection = (next: Point) => {
    if (snakeDir.x + next.x === 0 && snakeDir.y + next.y === 0) return;
    setSnakeNextDir(next);
    play("move");
    if (!snakeRunning && activeGame === "snake") {
      setSnakeRunning(true);
      setSnakeOver(false);
      play("start");
    }
  };

  useEffect(() => {
    if (!typingStarted || typingTimeLeft <= 0) return;
    const timer = window.setTimeout(() => {
      setTypingTimeLeft((prev) => prev - 1);
      play("tick");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [typingStarted, typingTimeLeft, play]);

  useEffect(() => {
    if (typingTimeLeft !== 0 || !typingStarted) return;
    setTypingStarted(false);
    setTypingBest((prev) => (prev === null ? typingWpm : Math.max(prev, typingWpm)));
    play(typingWpm >= 35 ? "win" : "good");
  }, [typingStarted, typingTimeLeft, typingWpm, play]);

  useEffect(() => {
    if (!whackRunning || whackTimeLeft <= 0) return;
    const second = window.setTimeout(() => setWhackTimeLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(second);
  }, [whackRunning, whackTimeLeft]);

  useEffect(() => {
    if (!whackRunning || whackTimeLeft <= 0) {
      if (whackRunning && whackTimeLeft <= 0) {
        setWhackRunning(false);
        setWhackHole(null);
        setWhackBest((prev) => Math.max(prev, whackScore));
        play(whackScore >= 12 ? "win" : "good");
      }
      return;
    }

    const interval = window.setInterval(() => {
      setWhackHole(Math.floor(Math.random() * 9));
      play("spawn");
    }, 780);

    return () => window.clearInterval(interval);
  }, [whackRunning, whackTimeLeft, whackScore, play]);

  useEffect(() => {
    if (!snakeRunning) return;
    const interval = window.setInterval(() => {
      setSnake((prev) => {
        const nextHead = { x: prev[0].x + snakeNextDir.x, y: prev[0].y + snakeNextDir.y };
        const hitWall = nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= gridSize || nextHead.y >= gridSize;
        const hitSelf = prev.some((part) => part.x === nextHead.x && part.y === nextHead.y);

        if (hitWall || hitSelf) {
          setSnakeRunning(false);
          setSnakeOver(true);
          setSnakeBest((best) => Math.max(best, prev.length - 3));
          play("bad");
          return prev;
        }

        setSnakeDir(snakeNextDir);
        const nextSnake = [nextHead, ...prev];
        if (nextHead.x === snakeFood.x && nextHead.y === snakeFood.y) {
          setSnakeFood(randomPoint(nextSnake));
          setSnakeScore(nextSnake.length - 3);
          play("eat");
          return nextSnake;
        }

        nextSnake.pop();
        return nextSnake;
      });
    }, 170);

    return () => window.clearInterval(interval);
  }, [snakeFood, snakeNextDir, snakeRunning, play]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const next =
        event.key === "ArrowUp" || event.key.toLowerCase() === "w"
          ? { x: 0, y: -1 }
          : event.key === "ArrowDown" || event.key.toLowerCase() === "s"
            ? { x: 0, y: 1 }
            : event.key === "ArrowLeft" || event.key.toLowerCase() === "a"
              ? { x: -1, y: 0 }
              : event.key === "ArrowRight" || event.key.toLowerCase() === "d"
                ? { x: 1, y: 0 }
                : null;

      if (!next || activeGame !== "snake" || !selectedGame) return;
      event.preventDefault();
      queueSnakeDirection(next);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeGame, selectedGame, snakeDir, snakeRunning]);

  useEffect(() => {
    if (!selectedGame) return;
    const timer = window.setTimeout(() => {
      void requestFullscreen();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [selectedGame]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const activeElement = document.fullscreenElement;
      setIsFullscreen(activeElement === stageRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedGame ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedGame]);

  const resetTyping = () => {
    setTypingPrompt(randomPrompt(typingPrompt));
    setTypingInput("");
    setTypingTimeLeft(30);
    setTypingStarted(false);
    setTypingCompleted(0);
    setTypingCorrect(0);
    setTypingTotal(0);
    play("tap");
  };

  const onTypingChange = (value: string) => {
    if (typingTimeLeft <= 0) return;
    if (!typingStarted) {
      setTypingStarted(true);
      play("start");
    }
    setTypingInput(value);
    setTypingTotal((prev) => prev + 1);
    const correct = value.split("").filter((char, index) => typingPrompt[index] === char).length;
    setTypingCorrect(typingCompleted * typingPrompt.length + correct);
    const latestIndex = value.length - 1;
    if (latestIndex >= 0) {
      const latestCharCorrect = typingPrompt[latestIndex] === value[latestIndex];
      play(latestCharCorrect ? "tap" : "bad");
    }
    if (value === typingPrompt) {
      setTypingCompleted((prev) => prev + 1);
      setTypingPrompt(randomPrompt(typingPrompt));
      setTypingInput("");
      play("good");
    }
  };

  const startWhack = () => {
    setWhackRunning(true);
    setWhackTimeLeft(20);
    setWhackScore(0);
    setWhackCombo(0);
    setWhackHole(null);
    play("start");
  };

  const onWhack = (index: number) => {
    if (!whackRunning) return;
    if (index === whackHole) {
      setWhackScore((prev) => prev + 1);
      setWhackCombo((prev) => prev + 1);
      setWhackHole(null);
      play("good");
      return;
    }
    setWhackCombo(0);
    play("bad");
  };

  const resetSnake = () => {
    const base = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    setSnake(base);
    setSnakeDir({ x: 1, y: 0 });
    setSnakeNextDir({ x: 1, y: 0 });
    setSnakeFood(randomPoint(base));
    setSnakeRunning(false);
    setSnakeOver(false);
    setSnakeScore(0);
    play("tap");
  };

  const renderGamePanel = () => {
    if (activeGame === "typing") {
      return (
        <div className="surface flex h-full min-h-0 flex-col rounded-[28px] p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white md:text-2xl">Hacker Sprint</h2>
              <p className="mt-1 text-xs text-[#9ca3af] md:text-sm">Type the phrase exactly. The timer starts on the first key.</p>
            </div>
            <button type="button" onClick={resetTyping} className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white md:min-h-11 md:px-5 md:text-xs">
              Reset Run
            </button>
          </div>
          <div className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="flex min-h-0 flex-col rounded-3xl border border-white/10 bg-black/25 p-4 md:p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/75">Target Phrase</p>
              <p className="mt-3 text-base leading-7 text-white md:text-xl md:leading-8">{typingPrompt}</p>
              <textarea
                value={typingInput}
                onChange={(event) => onTypingChange(event.target.value)}
                disabled={typingTimeLeft === 0}
                rows={4}
                placeholder="Start typing..."
                className="mt-4 min-h-[140px] flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/35 md:min-h-[180px]"
              />
            </div>
            <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[{ label: "Time", value: `${typingTimeLeft}s` }, { label: "WPM", value: String(typingWpm) }, { label: "Accuracy", value: `${typingAccuracy}%` }, { label: "Best", value: typingBest === null ? "--" : String(typingBest) }].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/50">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-white md:text-2xl">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeGame === "whack") {
      return (
        <div className="surface flex h-full min-h-0 flex-col rounded-[28px] p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white md:text-2xl">Whack-a-Bug</h2>
              <p className="mt-1 text-xs text-[#9ca3af] md:text-sm">Hit the bug before it relocates.</p>
            </div>
            <button type="button" onClick={startWhack} className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black md:min-h-11 md:px-5 md:text-xs">
              Start Hunt
            </button>
          </div>
          <div className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid aspect-square max-h-[min(58vh,520px)] grid-cols-3 gap-3 self-center xl:max-h-[calc(100vh-260px)]">
              {Array.from({ length: 9 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onWhack(index)}
                  className={`aspect-square rounded-3xl border text-sm font-semibold uppercase tracking-[0.2em] transition sm:text-lg md:text-2xl ${
                    whackHole === index && whackRunning ? "border-rose-300/40 bg-rose-400/[0.14] text-rose-100" : "border-white/10 bg-black/25 text-white/35 hover:border-white/20"
                  }`}
                >
                  {whackHole === index && whackRunning ? "BUG" : "..." }
                </button>
              ))}
            </div>
            <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[{ label: "Time", value: `${whackTimeLeft}s` }, { label: "Score", value: String(whackScore) }, { label: "Combo", value: String(whackCombo) }, { label: "Best", value: String(whackBest) }].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/50">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-white md:text-2xl">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="surface flex h-full min-h-0 flex-col rounded-[28px] p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white md:text-2xl">Neon Snake</h2>
            <p className="mt-1 text-xs text-[#9ca3af] md:text-sm">Use arrow keys, WASD, or the touch pad. Eat the pulse and avoid collisions.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSnakeRunning(true);
                setSnakeOver(false);
                play("start");
              }}
              className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black md:min-h-11 md:px-5 md:text-xs"
            >
              Start Run
            </button>
            <button type="button" onClick={resetSnake} className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white md:min-h-11 md:px-5 md:text-xs">
              Reset Snake
            </button>
          </div>
        </div>
        <div className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex min-h-0 flex-col gap-3">
            <div className="mx-auto grid aspect-square w-full max-w-[min(90vw,520px)] gap-1 rounded-[28px] border border-white/10 bg-black/25 p-3 xl:max-w-[calc(100vh-290px)]" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
              {Array.from({ length: gridSize * gridSize }, (_, index) => {
                const x = index % gridSize;
                const y = Math.floor(index / gridSize);
                const isSnake = snake.some((part) => part.x === x && part.y === y);
                const isHead = snake[0]?.x === x && snake[0]?.y === y;
                const isFood = snakeFood.x === x && snakeFood.y === y;
                return <div key={index} className={`aspect-square rounded-[6px] ${isHead ? "bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]" : isSnake ? "bg-cyan-500/70" : isFood ? "bg-fuchsia-300 shadow-[0_0_16px_rgba(217,70,239,0.8)]" : "bg-white/[0.04]"}`} />;
              })}
            </div>
            <div className="mx-auto grid w-full max-w-[220px] grid-cols-3 gap-2 sm:hidden">
              <div />
              <button type="button" onClick={() => queueSnakeDirection({ x: 0, y: -1 })} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm font-semibold text-white">
                Up
              </button>
              <div />
              <button type="button" onClick={() => queueSnakeDirection({ x: -1, y: 0 })} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm font-semibold text-white">
                Left
              </button>
              <button type="button" onClick={() => queueSnakeDirection({ x: 0, y: 1 })} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm font-semibold text-white">
                Down
              </button>
              <button type="button" onClick={() => queueSnakeDirection({ x: 1, y: 0 })} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm font-semibold text-white">
                Right
              </button>
            </div>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[{ label: "Score", value: String(snakeScore) }, { label: "Best", value: String(snakeBest) }, { label: "Status", value: snakeOver ? "Game Over" : snakeRunning ? "Running" : "Ready" }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-white/50">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white md:text-2xl">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen px-5 pb-16 pt-24 sm:px-6 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
          className="surface rounded-[28px] p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/75">Game Hub</p>
              <h1 className="display-title mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Launch into break mode</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[#9ca3af] sm:text-base">
                Pick a game and the hub expands into an immersive fullscreen stage on desktop and mobile.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  play("tap");
                  setEnabled((prev) => !prev);
                }}
                className={`interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                  enabled ? "border-cyan-300/35 text-cyan-100" : "border-white/20 text-white/70"
                }`}
              >
                {enabled ? "Sound On" : "Sound Off"}
              </button>
              <Link href="/" className="interactive-lift inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Back to Home
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {gameCards.map((game) => (
              <motion.button
                key={game.id}
                type="button"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => openGame(game.id)}
                className="group rounded-[26px] border border-white/10 bg-black/20 p-5 text-left transition hover:border-cyan-300/35 hover:bg-cyan-400/[0.06]"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/75">{game.note}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{game.label}</p>
                <p className="mt-3 text-sm leading-6 text-white/65">{game.detail}</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 transition group-hover:border-cyan-300/35 group-hover:text-cyan-100">
                  Play Fullscreen
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedGame ? (
          <motion.div
            key="game-stage-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE_STANDARD }}
            className="fixed inset-0 z-[90] bg-[#030712]/92 backdrop-blur-xl"
          >
            <motion.div
              ref={stageRef}
              layoutId={`game-stage-${selectedGame}`}
              initial={{ opacity: 0, scale: 0.92, y: 48 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 28 }}
              transition={{ duration: 0.34, ease: EASE_STANDARD }}
              className="flex h-screen w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#07111d_0%,#020617_100%)]"
            >
              <div className="border-b border-white/10 bg-[#020817]/88 px-4 py-3 backdrop-blur md:px-6 md:py-4">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={closeGameStage} className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white md:min-h-11 md:px-5 md:text-xs">
                      Back to Hub
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isFullscreen) {
                          void exitFullscreen();
                        } else {
                          void requestFullscreen();
                        }
                        play("tap");
                      }}
                      className="interactive-lift inline-flex min-h-10 items-center justify-center rounded-full border border-cyan-300/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100 md:min-h-11 md:px-5 md:text-xs"
                    >
                      {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {gameCards.map((game) => (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => {
                          setActiveGame(game.id);
                          play("tap");
                        }}
                        className={`rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition md:px-4 md:text-xs ${
                          activeGame === game.id ? "border-cyan-300/45 bg-cyan-400/[0.12] text-cyan-100" : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {game.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden px-4 py-4 md:px-6 md:py-5">
                <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden">
                  {renderGamePanel()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
