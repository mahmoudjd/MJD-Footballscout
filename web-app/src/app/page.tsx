import type { Metadata } from "next"
import { HomePageView } from "@/features/home/components/HomePageView"

export const metadata: Metadata = {
  title: "Football Scouting Workspace",
  description:
    "A complete football scouting workspace for player discovery, comparisons, shortlists, squad planning, and recruitment decisions.",
}

export default function HomePage() {
  return <HomePageView />
}
