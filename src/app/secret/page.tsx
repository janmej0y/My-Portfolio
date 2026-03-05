"use client";

import Image from "next/image";
import { useState } from "react";

export default function SecretPage() {
  const [videoSrc, setVideoSrc] = useState("");
  const [open, setOpen] = useState(false);

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

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-center text-cyan-200">
      <div className="mx-auto max-w-2xl rounded-2xl border border-cyan-300 p-8 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
        <h1 className="text-3xl font-bold">Secret Room Unlocked</h1>
        <p className="mt-3 text-slate-300">Welcome to the hidden zone.</p>

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

        <a
          href="/"
          className="mt-8 inline-block rounded-md border border-cyan-300 px-5 py-2 text-cyan-100 transition hover:bg-cyan-300 hover:text-black"
        >
          Back to Home
        </a>
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
