import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { CASE_STUDIES, PROJECTS } from "@/lib/data";

const BackgroundFX = dynamic(() => import("@/components/BackgroundFX"), { ssr: false });
const InteractionFX = dynamic(() => import("@/components/InteractionFX"), { ssr: false });
const PageLoader = dynamic(() => import("@/components/PageLoader"), { ssr: false });
const ScrollProgressBar = dynamic(() => import("@/components/ScrollProgressBar"), { ssr: false });
const ThemeTransition = dynamic(() => import("@/components/ThemeTransition"), { ssr: false });

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
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
      <body className={`${manrope.variable} ${sora.variable} font-body`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }}
        />
        <SmoothScrollProvider>
          <PageLoader />
          <ThemeTransition />
          <BackgroundFX />
          <ScrollProgressBar />
          <div aria-hidden="true" className="linux-watermark" />
          <div aria-hidden="true" className="kali-3d-bg" />
          <InteractionFX />
          <div className="relative z-10">{children}</div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
