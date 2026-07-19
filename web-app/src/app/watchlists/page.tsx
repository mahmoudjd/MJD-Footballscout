import type { Metadata } from "next"
import { WatchlistsPageView } from "@/features/watchlists/components/WatchlistsPageView"

export const metadata: Metadata = {
  title: "Watchlists",
  description: "Organize scouting targets into focused watchlist boards.",
}

export default function WatchlistsPage() {
  return <WatchlistsPageView />
}
