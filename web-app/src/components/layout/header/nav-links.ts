import { OutlineIcons } from "@/components/icons/outline-icons"

export type NavLink = {
  href: string
  label: string
  icon: keyof typeof OutlineIcons
  authRequired?: boolean
  compactUntilWide?: boolean
}

export const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: "GlobeAltIcon" },
  { href: "/players", label: "Players", icon: "UserGroupIcon" },
  { href: "/search", label: "Search", icon: "SparklesIcon" },
  { href: "/compare", label: "Compare", icon: "ArrowsRightLeftIcon", authRequired: true },
  { href: "/watchlists", label: "Watchlists", icon: "HeartIcon", authRequired: true },
  {
    href: "/shadow-team",
    label: "Shadow Team",
    icon: "Squares2X2Icon",
    authRequired: true,
    compactUntilWide: true,
  },
  {
    href: "/recruitment",
    label: "Recruitment",
    icon: "RocketLaunchIcon",
    authRequired: true,
    compactUntilWide: true,
  },
  {
    href: "/help",
    label: "Help",
    icon: "QuestionMarkCircleIcon",
    compactUntilWide: true,
  },
]
