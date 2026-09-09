"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";

export default function ScrollProgressBar() {
  const { progress } = useScrollProgress();
  const [nativeTimeline, setNativeTimeline] = useState(false);

  // Where scroll timelines exist the bar is driven entirely by CSS, off the
  // main thread. Detected after mount so server and client markup agree.
  useEffect(() => {
    setNativeTimeline(
      typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll(root block)"),
    );
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-1 bg-transparent">
      {nativeTimeline ? (
        <div className="sda-progress h-full bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400" />
      ) : (
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400"
          style={{ scaleX: progress }}
        />
      )}
    </div>
  );
}
