import type { Metadata } from "next";
import SecretRoomClient from "@/app/secret/SecretRoomClient";

export const metadata: Metadata = {
  title: "Secret Room | Janmejoy Mahato",
  description: "Private showcase and analytics dashboard.",
  alternates: { canonical: "/secret" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SecretPage() {
  return <SecretRoomClient />;
}
