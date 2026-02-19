import { OutlineIcons } from "@/components/outline-icons"

export type NavLink = {
  href: string
  label: string
  icon: keyof typeof OutlineIcons
  authRequired?: boolean
}

export const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: "GlobeAltIcon" },
  { href: "/players", label: "Players", icon: "UserGroupIcon" },
  { href: "/search", label: "Search", icon: "SparklesIcon" },
  { href: "/compare", label: "Compare", icon: "ArrowsRightLeftIcon", authRequired: true },
  { href: "/watchlists", label: "Watchlists", icon: "HeartIcon", authRequired: true },
]
