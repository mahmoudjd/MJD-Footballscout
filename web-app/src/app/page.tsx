import type { Metadata } from "next"
import { HomePageView } from "@/features/home/components/HomePageView"

export const metadata: Metadata = {
  title: "Football Scouting Workspace",
  description: "Search, compare, and organize football talent in one scouting workspace.",
}

export default function HomePage() {
  return <HomePageView />
}
