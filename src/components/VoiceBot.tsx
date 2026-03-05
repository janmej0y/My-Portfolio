"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const maybe = (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor; SpeechRecognition?: SpeechRecognitionCtor });
  return maybe.SpeechRecognition ?? maybe.webkitSpeechRecognition ?? null;
}

function applyTheme(theme: "dark" | "bright" | "cyber") {
  document.documentElement.classList.remove("theme-dark", "theme-bright", "theme-cyber", "bright-mode");
  document.documentElement.classList.add(`theme-${theme}`);
  localStorage.setItem("theme-preset", theme);
}

export default function VoiceBot() {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Say: go to projects / open resume / dark theme");
  const [lastCommand, setLastCommand] = useState("");

  const recognition = useMemo(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return null;
    const instance = new Ctor();
    instance.continuous = false;
    instance.interimResults = false;
    instance.lang = "en-US";
    return instance;
  }, []);

  const runCommand = (spoken: string) => {
    const text = spoken.toLowerCase();

    const sectionMatch = text.match(/(hero|about|education|projects|skills|contact)/);
    if (sectionMatch?.[1]) {
      const section = sectionMatch[1];
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setStatus(`Navigated to ${section}.`);
      return;
    }

    if (text.includes("open resume")) {
      window.open("/assets/resume.pdf", "_blank", "noopener,noreferrer");
      setStatus("Opened resume.");
      return;
    }
    if (text.includes("open github")) {
      window.open("https://github.com/janmej0y", "_blank", "noopener,noreferrer");
      setStatus("Opened GitHub.");
      return;
    }
    if (text.includes("open linkedin")) {
      window.open("https://linkedin.com/in/janmej0y", "_blank", "noopener,noreferrer");
      setStatus("Opened LinkedIn.");
      return;
    }
    if (text.includes("open secret")) {
      window.location.href = "/secret";
      return;
    }
    if (text.includes("dark theme")) {
      applyTheme("dark");
      setStatus("Theme set to dark.");
      return;
    }
    if (text.includes("bright theme")) {
      applyTheme("bright");
      setStatus("Theme set to bright.");
      return;
    }
    if (text.includes("cyber theme")) {
      applyTheme("cyber");
      setStatus("Theme set to cyber.");
      return;
    }

    setStatus("Command not recognized. Try: go to projects, open resume, dark theme.");
  };

  const startListening = () => {
    if (!recognition) {
      setStatus("Voice recognition is not supported in this browser.");
      return;
    }

    recognition.onresult = (event) => {
      const spoken = event.results[0]?.[0]?.transcript?.trim() ?? "";
      setLastCommand(spoken);
      runCommand(spoken);
    };

    recognition.onerror = () => {
      setListening(false);
      setStatus("Voice command failed. Please try again.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    setStatus("Listening...");
    setListening(true);
    recognition.start();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[128] w-[min(88vw,270px)]">
      <motion.div
        className="surface rounded-2xl p-3"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center gap-3">
          <motion.img
            src="/assets/voice-bot.png"
            alt="Voice assistant bot"
            className="h-12 w-12 rounded-full border border-cyan-300/40 bg-black/35 p-1"
            animate={listening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={listening ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
          />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-200/90">Voice Bot</p>
            <p className="truncate text-xs text-white/65">{lastCommand || "Awaiting command"}</p>
          </div>
          <button
            type="button"
            onClick={startListening}
            aria-label="Start voice command"
            className={`ml-auto rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
              listening
                ? "border-emerald-300/60 bg-emerald-400/20 text-emerald-200"
                : "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
            }`}
            data-magnetic="true"
          >
            {listening ? "On" : "Speak"}
          </button>
        </div>
        <p className="mt-2 text-xs text-white/70">{status}</p>
      </motion.div>
    </div>
  );
}
