"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";
import { smoothScrollToTarget } from "@/lib/scroll";

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

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const quickPrompts = [
  "Best project for hiring?",
  "What tech stack do you use most?",
  "Tell me about your education",
  "How can I contact you?",
];
const TOUR_SECTIONS = ["hero", "about", "education", "projects", "skills", "certifications", "contact"] as const;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const maybeWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return maybeWindow.SpeechRecognition ?? maybeWindow.webkitSpeechRecognition ?? null;
}

export default function VoiceBot() {
  const [isCompact, setIsCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I am JanBot. Ask me anything about Janmejoy's projects, skills, education, or contact details.",
    },
  ]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const scrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolling(true);
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => setIsScrolling(false), 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const syncViewport = () => setIsCompact(window.innerWidth < 768);

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return false;
    smoothScrollToTarget(section);
    return true;
  };

  const goToTourStep = (index: number) => {
    const safeIndex = ((index % TOUR_SECTIONS.length) + TOUR_SECTIONS.length) % TOUR_SECTIONS.length;
    const target = TOUR_SECTIONS[safeIndex];
    const ok = scrollToSection(target);
    if (ok) setTourIndex(safeIndex);
    return ok;
  };

  const speakReply = (text: string) => {
    if (!voiceOutput || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.02;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const sendQuestion = async (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || sending) return;
    const normalized = cleanQuestion.toLowerCase();
    const sectionAliases: Record<string, string> = {
      hero: "hero",
      about: "about",
      education: "education",
      projects: "projects",
      skills: "skills",
      certifications: "certifications",
      contact: "contact",
    };
    const directSection = Object.entries(sectionAliases).find(([phrase]) =>
      normalized.includes(`go to ${phrase}`) || normalized.includes(`scroll to ${phrase}`) || normalized.includes(`open ${phrase}`),
    );

    if (directSection) {
      const targetId = directSection[1];
      const ok = scrollToSection(targetId);
      if (ok) {
        const idx = TOUR_SECTIONS.findIndex((section) => section === targetId);
        if (idx >= 0) setTourIndex(idx);
        addAssistantMessage(`Taking you to ${targetId.replace("-", " ")} section. Smooth landing complete.`);
      } else {
        addAssistantMessage("That section was not found. Try: go to hero section or go to contact section.");
      }
      return;
    }

    if (normalized.includes("take me through") || normalized.includes("walk through") || normalized.includes("portfolio tour")) {
      setTourActive(true);
      const ok = goToTourStep(tourIndex);
      if (ok) addAssistantMessage("Tour mode activated. I will guide section by section. Sit back, scroll spy style.");
      return;
    }
    if (normalized.includes("next section") || normalized === "next") {
      const ok = goToTourStep(tourIndex + 1);
      if (ok) addAssistantMessage(`Jumping to ${TOUR_SECTIONS[(tourIndex + 1) % TOUR_SECTIONS.length]}. Guided missile deployed.`);
      return;
    }
    if (normalized.includes("stop tour")) {
      setTourActive(false);
      addAssistantMessage("Tour paused. Manual mode restored.");
      return;
    }

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: cleanQuestion };
    const nextMessages = [...messagesRef.current, userMsg];
    setMessages(nextMessages);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await response.json()) as { success: boolean; reply?: string; message?: string };
      const reply =
        response.ok && data.success && data.reply
          ? data.reply
          : data.message || "JanBot is reloading its humor engine. Try again in a moment.";

      setMessages((prev) => {
        const assistantReply: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", text: reply };
        const withReply = [...prev, assistantReply];
        messagesRef.current = withReply;
        return withReply;
      });
      speakReply(reply);
    } catch {
      const fallback = "Network glitch. JanBot tripped over a cable, but your portfolio details are still legendary.";
      setMessages((prev) => {
        const fallbackReply: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", text: fallback };
        const withFallback = [...prev, fallbackReply];
        messagesRef.current = withFallback;
        return withFallback;
      });
      speakReply(fallback);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!tourActive) return;
    const timer = window.setInterval(() => {
      setTourIndex((prev) => {
        const next = (prev + 1) % TOUR_SECTIONS.length;
        goToTourStep(next);
        if (next === TOUR_SECTIONS.length - 1) {
          setTourActive(false);
          addAssistantMessage("Tour complete. Portfolio conquered. You now know the map better than Google.");
        }
        return next;
      });
    }, 4200);

    return () => window.clearInterval(timer);
  }, [tourActive]);

  const onSend = async (event?: FormEvent) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    await sendQuestion(question);
  };

  const addAssistantMessage = (text: string) => {
    setMessages((prev) => {
      const assistantMsg: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", text };
      const next = [...prev, assistantMsg];
      messagesRef.current = next;
      return next;
    });
    speakReply(text);
  };

  const onVoiceToggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      addAssistantMessage("Voice input is not supported in this browser. Type your message and I will still roast politely.");
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    setListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) return;
      setInput(transcript);
      await sendQuestion(transcript);
      setInput("");
    };

    recognition.onerror = () => {
      setListening(false);
      addAssistantMessage("I heard static noise from the digital universe. Tap Mic and try again.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[128] w-[min(calc(100vw-1rem),360px)] sm:bottom-5 sm:right-5 sm:w-[min(92vw,360px)]">
      {open ? (
        <motion.div
          className={`pointer-events-auto overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/18 shadow-[0_10px_24px_rgba(2,6,23,0.24)] backdrop-blur-sm transition-opacity ${
            isScrolling ? "opacity-55" : "opacity-95"
          }`}
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/25 px-3 py-2.5 sm:flex-nowrap sm:gap-3">
            <Image
              src="/assets/voice-bot.png"
              alt="JanBot assistant"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-cyan-300/40 bg-black/35 p-1"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/90">AI Voice Bot</p>
              <p className="truncate text-xs text-white/65">
                {listening ? "Listening..." : "Sarcastic mode locked in"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVoiceOutput((prev) => !prev)}
              aria-label={voiceOutput ? "Mute voice output" : "Enable voice output"}
              className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] sm:px-3 sm:text-[11px] ${
                voiceOutput
                  ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-100"
                  : "border-white/20 bg-black/30 text-white/70"
              }`}
            >
              {voiceOutput ? "Voice" : "Mute"}
            </button>
            <button
              type="button"
              onClick={onVoiceToggle}
              aria-label={listening ? "Stop listening" : "Start voice input"}
              className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] sm:px-3 sm:text-[11px] ${
                listening
                  ? "border-fuchsia-300/60 bg-fuchsia-400/18 text-fuchsia-100"
                  : "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
              }`}
            >
              {listening ? "Stop" : "Mic"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Collapse chat"
              className="rounded-full border border-cyan-300/50 bg-cyan-400/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-100 sm:px-3 sm:text-[11px]"
            >
              Hide
            </button>
          </div>

          <div className="p-3">
            {!isCompact ? (
              <div className="mb-2 flex items-center gap-1.5">
                <span className="rounded-full border border-white/20 bg-black/28 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
                  Voice command: go to projects section
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-white/45">{tourActive ? "Tour On" : "Tour Off"}</span>
              </div>
            ) : null}

            {!isCompact ? (
              <div className="mb-2 flex items-center gap-1.5">
                <span className="rounded-full border border-red-300/30 bg-red-400/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-100">
                  Automatic sarcastic roast mode
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-white/45">Auto</span>
              </div>
            ) : null}

            <div ref={scrollerRef} className="max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-64">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl px-3 py-2 text-xs leading-5 ${
                    message.role === "assistant"
                      ? "border border-cyan-300/25 bg-cyan-400/10 text-cyan-50"
                      : "ml-6 border border-white/18 bg-white/8 text-white/90"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            {!isCompact ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/75 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <form onSubmit={onSend} className="mt-2.5 flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask something about Janmejoy..."
                className="h-10 w-full rounded-full border border-white/15 bg-black/35 px-3 text-xs text-white outline-none placeholder:text-white/45 focus:border-cyan-300/45"
                aria-label="Ask portfolio chatbot"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-10 items-center justify-center rounded-full border border-cyan-300/50 bg-cyan-400/15 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "..." : "Send"}
              </button>
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open JanBot"
          className={`pointer-events-auto ml-auto flex items-center gap-3 rounded-2xl border border-cyan-300/25 bg-black/30 px-3 py-2 shadow-[0_10px_24px_rgba(2,6,23,0.24)] backdrop-blur-sm transition-opacity ${
            isScrolling ? "opacity-55" : "opacity-95"
          }`}
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
        >
          <Image
            src="/assets/voice-bot.png"
            alt="JanBot assistant"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border border-cyan-300/40 bg-black/35 p-1"
          />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/90">Open JanBot</p>
            <p className="text-[11px] text-white/60">Tap to unlock chat and voice</p>
          </div>
        </motion.button>
      )}
    </div>
  );
}
