"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SoundName = "tap" | "open" | "success" | "switch";

const STORAGE_KEY = "portfolio-sound-enabled";
const SOUND_EVENT = "portfolio-sound-change";

function getStoredSoundPreference() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function useSoundEffects() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setEnabled(getStoredSoundPreference());

    const onPreferenceChange = () => setEnabled(getStoredSoundPreference());
    window.addEventListener(SOUND_EVENT, onPreferenceChange);
    window.addEventListener("storage", onPreferenceChange);

    return () => {
      window.removeEventListener(SOUND_EVENT, onPreferenceChange);
      window.removeEventListener("storage", onPreferenceChange);
    };
  }, []);

  const setSoundEnabled = useCallback((next: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, String(next));
    setEnabled(next);
    window.dispatchEvent(new Event(SOUND_EVENT));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(!getStoredSoundPreference());
  }, [setSoundEnabled]);

  const play = useCallback((name: SoundName = "tap") => {
    if (!getStoredSoundPreference()) return;

    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const audio = audioRef.current ?? new AudioContextCtor();
    audioRef.current = audio;

    if (audio.state === "suspended") {
      void audio.resume();
    }

    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    const settings: Record<SoundName, { frequency: number; end: number; volume: number; type: OscillatorType }> = {
      tap: { frequency: 720, end: 0.055, volume: 0.018, type: "sine" },
      open: { frequency: 520, end: 0.12, volume: 0.024, type: "triangle" },
      success: { frequency: 880, end: 0.16, volume: 0.026, type: "sine" },
      switch: { frequency: 640, end: 0.085, volume: 0.02, type: "triangle" },
    };

    const sound = settings[name];
    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(sound.frequency * 1.35, now + sound.end);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1600, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(sound.volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.end);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + sound.end + 0.02);
  }, []);

  return { enabled, play, setSoundEnabled, toggleSound };
}
