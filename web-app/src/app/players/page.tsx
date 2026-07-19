import type { Metadata } from "next"
import PlayersPageView from "@/features/players/components/PlayersPageView"

export const metadata: Metadata = {
  title: "Players",
  description: "Browse and filter the complete football player database.",
}

export default function PlayersPage() {
  return <PlayersPageView />
}
