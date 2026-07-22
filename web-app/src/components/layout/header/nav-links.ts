import { OutlineIcons } from "@/components/icons/outline-icons"

export type NavLink = {
  href: string
  label: string
  icon: keyof typeof OutlineIcons
  authRequired?: boolean
  /** Collapsed into the "More" dropdown instead of shown inline. */
  secondary?: boolean
}

export const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: "GlobeAltIcon" },
  { href: "/players", label: "Players", icon: "UserGroupIcon" },
  { href: "/search", label: "Search", icon: "SparklesIcon" },
  { href: "/compare", label: "Compare", icon: "ArrowsRightLeftIcon", authRequired: true },
  { href: "/watchlists", label: "Watchlists", icon: "HeartIcon", authRequired: true },
  {
    href: "/shadow-team",
    label: "Squad Builder",
    icon: "Squares2X2Icon",
    authRequired: true,
    secondary: true,
  },
  {
    href: "/recruitment",
    label: "Recruitment",
    icon: "RocketLaunchIcon",
    authRequired: true,
    secondary: true,
  },
  {
    href: "/help",
    label: "Help",
    icon: "QuestionMarkCircleIcon",
    secondary: true,
  },
]

export const primaryNavLinks = navLinks.filter((link) => !link.secondary)
export const secondaryNavLinks = navLinks.filter((link) => link.secondary)
