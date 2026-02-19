import type { GuideSection } from "@/components/ui/feature-guide"

export const playersGuideSections: GuideSection[] = [
  {
    id: "filter",
    label: "1. Filter",
    description: "Narrow the players table using position, age, ELO, value and club criteria.",
    points: [
      "Use quick filters for position, age group, and nationality.",
      "Use min/max fields to target exact scouting ranges.",
      "Reset filters to return to the full list.",
    ],
  },
  {
    id: "sort",
    label: "2. Sort",
    description: "Sort by ELO, age, market value, name, or last update time.",
    points: [
      "Choose Sort By and Order to control ranking direction.",
      "Combine sorting with filters for shortlists.",
      "Pagination keeps the list readable on all devices.",
    ],
  },
  {
    id: "actions",
    label: "3. Actions",
    description: "Use table actions for maintenance and data freshness.",
    points: [
      "Admins can delete players directly from the table.",
      "Admins can trigger Update all players for full refresh.",
      "Non-admin users can still search, filter, and inspect players.",
    ],
  },
]
