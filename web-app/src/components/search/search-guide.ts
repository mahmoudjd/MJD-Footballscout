import type { GuideSection } from "@/components/ui/feature-guide"

export const searchGuideSections: GuideSection[] = [
  {
    id: "type",
    label: "1. Type",
    description: "Start typing a player name to get instant local suggestions.",
    points: [
      "Local matching updates while you type.",
      "Use at least 3 characters for backend search.",
      "Try full name or short name for better matching.",
    ],
  },
  {
    id: "search",
    label: "2. Search",
    description: "Run a server-side search to fetch fresh results.",
    points: [
      "Click Search or press Enter.",
      "If you are not logged in, you will be redirected to login first.",
      "The app refreshes players cache after successful search.",
    ],
  },
  {
    id: "review",
    label: "3. Review",
    description: "Use the result list to open profiles and continue scouting.",
    points: [
      "Empty state helps when no players match your query.",
      "Loading state shows ongoing server processing.",
      "Open player cards to inspect details faster.",
    ],
  },
]
