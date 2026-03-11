"use client";

type ScrollTarget = string | HTMLElement | null | undefined;

export function smoothScrollToTarget(target: ScrollTarget, offset = -88) {
  if (typeof window === "undefined" || !target) return;

  const element =
    typeof target === "string"
      ? (document.querySelector(target) as HTMLElement | null) ?? document.getElementById(target.replace(/^#/, ""))
      : target;

  if (!element) return;

  const lenis = (window as Window & { __portfolioLenis?: { scrollTo: (target: HTMLElement, options?: { offset?: number }) => void } }).__portfolioLenis;

  if (lenis) {
    lenis.scrollTo(element, { offset });
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
}
