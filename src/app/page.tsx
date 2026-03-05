import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Janmejoy Mahato | Full Stack Developer Portfolio",
  description:
    "Premium portfolio of Janmejoy Mahato showcasing full-stack projects, cybersecurity work, and engineering case studies.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Janmejoy Mahato | Full Stack Developer Portfolio",
    description:
      "Explore projects, case studies, and security-focused product work by Janmejoy Mahato.",
    url: "/",
    images: [{ url: "/assets/profile.jpg", width: 1200, height: 630, alt: "Janmejoy Mahato Portfolio" }],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
