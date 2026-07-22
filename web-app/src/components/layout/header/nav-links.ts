import { OutlineIcons } from "@/components/icons/outline-icons"

export type NavLink = {
  href: string
  /** Full label. Used in the desktop nav and the mobile "More" sheet. */
  label: string
  /**
   * Shorter label for width-constrained contexts (the mobile tab bar, where five
   * items share the viewport). Falls back to `label` when omitted.
   */
  shortLabel?: string
  icon: keyof typeof OutlineIcons
  authRequired?: boolean
  /** Collapsed into the desktop "More" dropdown instead of shown inline. */
  secondary?: boolean
  /**
   * Shown as a tab in the mobile bottom bar. Capped at four — the fifth slot is
   * always "More". Everything without this flag is reachable via that sheet.
   */
  mobileTab?: boolean
}

/**
 * Single source of truth for product navigation across the desktop header, the
 * mobile tab bar and the mobile "More" sheet.
 *
 * Order follows the native mobile app's tab order (see
 * `mobile-app/src/app/(tabs)/_layout.tsx`): Search sits directly after Home
 * because search is the app's primary function, then find (Players) → build
 * (Squad Builder) → analyse (Compare) → track (Watchlists).
 */
export const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: "GlobeAltIcon", mobileTab: true },
  { href: "/search", label: "Search", icon: "SparklesIcon", mobileTab: true },
  { href: "/players", label: "Players", icon: "UserGroupIcon", mobileTab: true },
  {
    href: "/shadow-team",
    label: "Squad Builder",
    shortLabel: "Squad",
    icon: "Squares2X2Icon",
    authRequired: true,
    mobileTab: true,
  },
  { href: "/compare", label: "Compare", icon: "ArrowsRightLeftIcon", authRequired: true },
  { href: "/watchlists", label: "Watchlists", icon: "HeartIcon", authRequired: true },
  {
    href: "/recruitment",
    label: "Recruitment Workspace",
    shortLabel: "Recruitment",
    icon: "RocketLaunchIcon",
    authRequired: true,
    secondary: true,
  },
  {
    href: "/help",
    label: "Help & What’s New",
    shortLabel: "Help",
    icon: "QuestionMarkCircleIcon",
    secondary: true,
  },
]

/** Shown inline in the desktop header. */
export const primaryNavLinks = navLinks.filter((link) => !link.secondary)

/** Collapsed into the desktop "More" dropdown. */
export const secondaryNavLinks = navLinks.filter((link) => link.secondary)

/** The four tabs in the mobile bottom bar. */
export const mobileTabLinks = navLinks.filter((link) => link.mobileTab)

/** Everything the mobile bottom bar can't show, surfaced in the "More" sheet. */
export const mobileMoreLinks = navLinks.filter((link) => !link.mobileTab)

/** Label to render for a link in a width-constrained context. */
export function navLinkShortLabel(link: NavLink) {
  return link.shortLabel ?? link.label
}

/**
 * Auth-gated destinations bounce through the login page and return afterwards,
 * so a signed-out tap never dead-ends on a permission error.
 */
export function resolveNavHref(link: NavLink, isAuthenticated: boolean) {
  return link.authRequired && !isAuthenticated
    ? `/login?callbackUrl=${encodeURIComponent(link.href)}`
    : link.href
}

export function isNavPathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
