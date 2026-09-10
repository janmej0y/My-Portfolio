import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Caveat, Manrope, Sora } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import DeferUntilIdle from "@/components/DeferUntilIdle";
import { CASE_STUDIES, PROJECTS } from "@/lib/data";

const BackgroundFX = dynamic(() => import("@/components/BackgroundFX"), { ssr: false });
const InteractionFX = dynamic(() => import("@/components/InteractionFX"), { ssr: false });
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const PageLoader = dynamic(() => import("@/components/PageLoader"), { ssr: false });
const ScrollProgressBar = dynamic(() => import("@/components/ScrollProgressBar"), { ssr: false });
const StaleServiceWorkerCleaner = dynamic(() => import("@/components/StaleServiceWorkerCleaner"), { ssr: false });
const ThemeTransition = dynamic(() => import("@/components/ThemeTransition"), { ssr: false });
const VoiceBot = dynamic(() => import("@/components/VoiceBot"), { ssr: false });

// Weights are pinned to what the design actually uses. Without this the
// variable fonts ship every weight, which put ~130KB of woff2 on the critical
// path and stretched the request chain to ~870ms.
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  adjustFontFallback: true,
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
  variable: "--font-display",
  adjustFontFallback: true,
});

// Accent face only - eyebrows and short asides, never body copy. preload:false
// keeps it out of the critical path; it swaps in a moment later, which is fine
// for a handful of small labels.
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  weight: ["600"],
  variable: "--font-hand",
  preload: false,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://janmej0y.vercel.app"),
  title: "Janmejoy Mahato | Portfolio",
  description: "Minimal designer-style portfolio of Janmejoy Mahato.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Janmejoy Mahato | Portfolio",
    description: "Full stack developer",
    url: "https://janmej0y.vercel.app",
    siteName: "Janmejoy Portfolio",
    images: [{ url: "/assets/profile.jpg", width: 1200, height: 630, alt: "Janmejoy Mahato" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Janmejoy Mahato | Portfolio",
    description: "Full stack developer and security-minded engineer.",
    images: ["/assets/profile.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Janmejoy Mahato",
    url: "https://janmej0y.vercel.app",
    jobTitle: "Full Stack Developer",
    sameAs: [
      "https://github.com/janmej0y",
      "https://linkedin.com/in/janmej0y",
      "https://instagram.com/janmej0y",
    ],
    knowsAbout: ["Web Development", "Cybersecurity", "Next.js", "Node.js", "TypeScript"],
  };

  const workJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Portfolio Projects and Case Studies",
    itemListElement: [...CASE_STUDIES, ...PROJECTS.slice(0, 4)].map((item, index) => {
      const isCaseStudy = "summary" in item;
      const description = isCaseStudy ? item.summary : item.shortDescription;
      const url = isCaseStudy ? item.link : item.liveUrl;

      return {
        "@type": "CreativeWork",
        position: index + 1,
        name: item.title,
        description,
        url: url || "https://janmej0y.vercel.app",
      };
    }),
  };

  return (
    <html lang="en" className="theme-dark">
      <head>
        {/* The watermark is the LCP element but it is a CSS background, so the
            preload scanner cannot find it in the initial HTML. Preloading makes
            it discoverable immediately instead of waiting for the stylesheet. */}
        <link
          rel="preload"
          as="image"
          href="/assets/kali-dragon-red.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className={`${manrope.variable} ${sora.variable} ${caveat.variable} font-body`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }}
        />
        <SmoothScrollProvider>
          <StaleServiceWorkerCleaner />
          <PageLoader />
          <Navbar />
          <ThemeTransition />
          <ScrollProgressBar />
          <div aria-hidden="true" className="linux-watermark" />
          <div aria-hidden="true" className="kali-3d-bg" />
          {/* Ambient chrome: not visible at first paint, so it mounts once the
              browser is idle rather than competing with the initial render.
              Nothing here changes visually - it simply arrives a beat later. */}
          <DeferUntilIdle>
            <BackgroundFX />
            <InteractionFX />
            <VoiceBot />
          </DeferUntilIdle>
          <div className="portfolio-content-shell relative z-10">{children}</div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
