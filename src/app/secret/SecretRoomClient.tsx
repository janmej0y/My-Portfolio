"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type TrackResponse = {
  success?: boolean;
  totalVisits?: number;
  redisConfigured?: boolean;
};

export default function SecretRoomClient() {
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const [open, setOpen] = useState(false);
  const [visits, setVisits] = useState<number | null>(null);
  const [redisConfigured, setRedisConfigured] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/secret")
      .then((response) => response.json())
      .then((data: { hasAccess?: boolean }) => setUnlocked(Boolean(data.hasAccess)))
      .catch(() => setUnlocked(false));
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    fetch("/api/track")
      .then((response) => response.json())
      .then((data: TrackResponse) => {
        setVisits(typeof data.totalVisits === "number" ? data.totalVisits : null);
        setRedisConfigured(Boolean(data.redisConfigured));
      })
      .catch(() => {
        setVisits(null);
        setRedisConfigured(false);
      });
  }, [unlocked]);

  const openVideo = async (src: string) => {
    try {
      const response = await fetch(src, { method: "HEAD" });
      if (!response.ok) throw new Error("missing");
      setVideoSrc(src);
      setOpen(true);
    } catch {
      alert("Secret video is not available yet. Add files in public/assets/videos/");
    }
  };

  const unlock = async () => {
    setStatus("Checking...");
    try {
      const response = await fetch("/api/secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !data.success) {
        setStatus(data.message || "Incorrect passcode.");
        return;
      }
      setUnlocked(true);
      setPasscode("");
      setStatus("Access granted.");
    } catch {
      setStatus("Failed to unlock secret room.");
    }
  };

  const logout = async () => {
    await fetch("/api/secret", { method: "DELETE" }).catch(() => null);
    setUnlocked(false);
    setStatus("Locked.");
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-black px-4 py-14 text-center text-cyan-200">
        <div className="mx-auto max-w-md rounded-2xl border border-cyan-300/35 p-8 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <h1 className="text-2xl font-semibold">Secret Room</h1>
          <p className="mt-2 text-sm text-white/65">Enter your passcode to unlock private showcase and metrics.</p>
          <input
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") unlock();
            }}
            className="mt-5 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2.5 text-center text-white outline-none focus:border-cyan-300/55"
            placeholder="Enter passcode"
            aria-label="Secret room passcode"
          />
          <button
            type="button"
            onClick={unlock}
            className="mt-4 w-full rounded-lg bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-black"
          >
            Unlock
          </button>
          {status ? <p className="mt-3 text-sm text-cyan-100/85">{status}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-center text-cyan-200">
      <div className="mx-auto max-w-3xl rounded-2xl border border-cyan-300 p-8 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
        <h1 className="text-3xl font-bold">Secret Room Unlocked</h1>
        <p className="mt-3 text-slate-300">Private showcase + analytics dashboard.</p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/15 bg-black/35 p-4 text-left">
            <p className="text-xs uppercase tracking-[0.14em] text-white/50">Total Visitors</p>
            <p className="mt-2 text-2xl font-semibold text-white">{visits ?? "--"}</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/35 p-4 text-left">
            <p className="text-xs uppercase tracking-[0.14em] text-white/50">Redis Status</p>
            <p className="mt-2 text-2xl font-semibold text-white">{redisConfigured ? "Connected" : "Not Configured"}</p>
          </div>
        </div>

        <button
          onClick={() => openVideo("/assets/videos/video1.mp4")}
          className="mt-8 block w-full overflow-hidden rounded-xl border border-cyan-300"
        >
          <Image src="/assets/projects/voting.png" alt="Secret video 1 preview" width={800} height={450} className="h-56 w-full object-cover" />
        </button>

        <button
          onClick={() => openVideo("/assets/videos/video2.mp4")}
          className="mt-5 block w-full overflow-hidden rounded-xl border border-cyan-300"
        >
          <Image src="/assets/projects/RentHub.png" alt="Secret video 2 preview" width={800} height={450} className="h-56 w-full object-cover" />
        </button>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={logout}
            className="inline-block rounded-md border border-cyan-300 px-5 py-2 text-cyan-100 transition hover:bg-cyan-300 hover:text-black"
          >
            Lock Secret Room
          </button>
          <a
            href="/"
            className="inline-block rounded-md border border-white/30 px-5 py-2 text-white transition hover:bg-white hover:text-black"
          >
            Back to Home
          </a>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4" onClick={() => setOpen(false)}>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-5 top-4 text-4xl text-cyan-100"
            aria-label="Close player"
          >
            &times;
          </button>
          <div className="w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <video src={videoSrc} controls autoPlay className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </main>
  );
}
