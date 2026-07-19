import type { Metadata } from "next"
import { SearchPageView } from "@/features/search/components/SearchPageView"

export const metadata: Metadata = {
  title: "Search Players",
  description: "Find player profiles and refresh football data on demand.",
}

export default function SearchPage() {
  return <SearchPageView />
}
