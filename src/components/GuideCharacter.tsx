"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSectionTracker } from "@/hooks/useSectionTracker";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const GUIDE_SECTIONS = ["hero", "about", "skills", "projects", "contact"];
const GUIDE_LOTTIE_URL = "https://assets9.lottiefiles.com/packages/lf20_UJNc2t.json";

type LottieData = Record<string, unknown>;

export default function GuideCharacter() {
  const [animationData, setAnimationData] = useState<LottieData | null>(null);
  const { activeSection, goToNextSection } = useSectionTracker({ sectionIds: GUIDE_SECTIONS });

  useEffect(() => {
    let mounted = true;
    fetch(GUIDE_LOTTIE_URL)
      .then((response) => response.json() as Promise<LottieData>)
      .then((json) => {
        if (mounted) setAnimationData(json);
      })
      .catch(() => setAnimationData(null));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.button
      type="button"
      onClick={goToNextSection}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className="group fixed bottom-5 right-5 z-[125] flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-black/55 p-1 backdrop-blur-xl md:bottom-8 md:right-8 md:h-24 md:w-24"
      aria-label={`Guide character: jump from ${activeSection} to next section`}
      data-magnetic="true"
    >
      {animationData ? (
        <Lottie animationData={animationData} loop autoplay className="h-full w-full" />
      ) : (
        <span className="text-2xl">{"->"}</span>
      )}
      <span className="pointer-events-none absolute -top-9 rounded-md border border-white/20 bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-white/75 opacity-0 transition group-hover:opacity-100">
        Next
      </span>
    </motion.button>
  );
}
