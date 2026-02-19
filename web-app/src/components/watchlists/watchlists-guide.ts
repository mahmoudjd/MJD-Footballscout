import type { GuideSection } from "@/components/ui/feature-guide"

export const watchlistGuideSections: GuideSection[] = [
  {
    id: "create",
    label: "1. Create",
    description: "Create dedicated boards for different scouting strategies.",
    points: [
      "Set a clear watchlist name (e.g. U23 targets).",
      "Add optional description for scouting context.",
      "Select a board from the left panel to work on it.",
    ],
  },
  {
    id: "manage",
    label: "2. Manage",
    description: "Edit board details and maintain your selected players.",
    points: [
      "Use Add player to include players not in the board.",
      "Remove players that no longer fit your strategy.",
      "Save edits to keep name and description updated.",
    ],
  },
  {
    id: "prioritize",
    label: "3. Prioritize",
    description: "Reorder players to keep your priority list current.",
    points: [
      "Move players up/down to update scouting priority.",
      "Top entries should represent next actions.",
      "Delete board only when it is no longer needed.",
    ],
  },
]
