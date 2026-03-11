"use client";

import { useEffect, useMemo, useState } from "react";
import { smoothScrollToTarget } from "@/lib/scroll";

const DEFAULT_SECTION_IDS = ["hero", "about", "skills", "projects", "contact"];

type UseSectionTrackerOptions = {
  sectionIds?: string[];
};

export function useSectionTracker(options: UseSectionTrackerOptions = {}) {
  const sectionIds = options.sectionIds ?? DEFAULT_SECTION_IDS;
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "hero");

  useEffect(() => {
    const updateActiveSection = () => {
      const probe = window.scrollY + window.innerHeight * 0.45;
      let current = sectionIds[0] ?? "hero";

      sectionIds.forEach((id) => {
        const node = document.getElementById(id);
        if (node && probe >= node.offsetTop) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sectionIds]);

  const activeIndex = useMemo(() => {
    const index = sectionIds.indexOf(activeSection);
    return index >= 0 ? index : 0;
  }, [activeSection, sectionIds]);

  const goToNextSection = () => {
    const nextIndex = activeIndex >= sectionIds.length - 1 ? 0 : activeIndex + 1;
    const targetId = sectionIds[nextIndex];
    smoothScrollToTarget(`#${targetId}`);
  };

  return {
    activeSection,
    sectionIds,
    goToNextSection,
  };
}
