import type { Metadata } from "next";
import GameHubClient from "@/app/games/GameHubClient";

export const metadata: Metadata = {
  title: "Game Hub | Janmejoy Mahato",
  description: "A small game hub with interactive mini games built into Janmejoy Mahato's portfolio.",
  alternates: { canonical: "/games" },
};

export default function GamesPage() {
  return <GameHubClient />;
}
