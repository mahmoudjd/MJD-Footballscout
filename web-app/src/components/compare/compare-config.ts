import type { GuideSection } from "@/components/ui/feature-guide"

export const INITIAL_CANDIDATE_LIMIT = 20
export const CANDIDATE_STEP = 20
export const INITIAL_RESULT_LIMIT = 15
export const RESULT_STEP = 15

export const compareGuideSections: GuideSection[] = [
  {
    id: "select",
    label: "1. Select",
    description: "Pick players from the left side before running the comparison.",
    points: [
      "Use search to quickly find players by name, club, country, or position.",
      "Click Add/Selected to include or remove players from your set.",
      "Choose at least two players to compare.",
    ],
  },
  {
    id: "run",
    label: "2. Compare",
    description: "Apply your current selection or run an all-players comparison.",
    points: [
      "Use Compare selected players for your current set.",
      "Use Compare all players for a full ranking over available players.",
      "You can keep editing selection while results stay visible.",
    ],
  },
  {
    id: "read",
    label: "3. Read Results",
    description: "Interpret leaders and scoreboard to make scouting decisions.",
    points: [
      "Leaders cards highlight top ELO, value, and youngest players.",
      "Scoreboard ranks players by combined score.",
      "Use Show more results to review a larger sample.",
    ],
  },
]

export function parseIds(raw: string | null) {
  if (!raw) return []
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  )
}

export function selectionsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false
  }
  return true
}
