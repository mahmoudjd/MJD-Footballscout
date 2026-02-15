"use client"

import Link from "next/link"
import { signIn, signOut } from "next-auth/react"
import { OutlineIcons } from "@/components/outline-icons"

interface NavbarProps {
  status: string
  open: boolean
  setOpen: (value: boolean) => void
}

type NavLink = {
  href: string
  label: string
  icon: keyof typeof OutlineIcons
  authRequired?: boolean
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: "GlobeAltIcon" },
  { href: "/players", label: "Players", icon: "UserIcon" },
  { href: "/search", label: "Search", icon: "SparklesIcon" },
  { href: "/compare", label: "Compare", icon: "ArrowsRightLeftIcon", authRequired: true },
  { href: "/watchlists", label: "Watchlists", icon: "HeartIcon", authRequired: true },
]

export function Navbar({ status, open, setOpen }: NavbarProps) {
  return (
    <nav
      id="mobile-navigation"
      className={`fixed top-0 left-0 z-40 h-full w-72 max-w-[85vw] bg-gradient-to-br from-cyan-900 to-cyan-600 text-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      } flex flex-col justify-between rounded-r-2xl`}
      aria-hidden={!open}
      aria-label="Mobile navigation"
    >
      <ul className="mt-24 flex flex-col space-y-5 px-6 text-base font-semibold sm:text-lg">
        {navLinks.map((link) => {
          const Icon = OutlineIcons[link.icon]
          return (
            <li key={link.href}>
              <Link
                href={
                  link.authRequired && status !== "authenticated"
                    ? `/login?callbackUrl=${encodeURIComponent(link.href)}`
                    : link.href
                }
                prefetch={false}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1 transition hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="px-6 py-6">
        {status === "authenticated" ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full cursor-pointer rounded-md border border-white/35 px-3 py-2 text-left transition hover:border-red-200 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={() => signIn()}
            className="w-full cursor-pointer rounded-md border border-white/35 px-3 py-2 text-left transition hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}
