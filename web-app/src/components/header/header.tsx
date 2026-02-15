"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { SolidIcons } from "@/components/solid-icons"
import { OutlineIcons } from "@/components/outline-icons"
import { Navbar } from "@/components/header/navbar"
import { useSession, signOut, signIn } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

const Header = () => {
  const [open, setOpen] = useState(false)
  const { status, data: session } = useSession()
  const userName = session?.user?.name || "Account"
  const userInitial = userName.charAt(0).toUpperCase() || "A"
  const userRole = session?.user?.role === "admin" ? "Admin" : "User"

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false)
      }
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 w-full bg-linear-to-r from-cyan-800 to-cyan-600 text-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={false}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
        >
          <Image
            src="/mjd-logo.png"
            alt="Logo"
            width={52}
            height={52}
            className="rounded-full shadow-md"
            priority
          />
          <span className="text-lg font-extrabold tracking-wide select-none sm:text-xl">MJD</span>
        </Link>

        <button
          type="button"
          className="rounded-md p-2 transition hover:bg-cyan-500 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <SolidIcons.Bars4Icon className="h-7 w-7 text-white" />
        </button>

        <nav className="hidden items-center gap-5 text-sm font-semibold md:flex xl:gap-7 xl:text-base">
          {navLinks.map((link) => {
            const Icon = OutlineIcons[link.icon]
            return (
              <Link
                key={link.href}
                href={
                  link.authRequired && status !== "authenticated"
                    ? `/login?callbackUrl=${encodeURIComponent(link.href)}`
                    : link.href
                }
                prefetch={false}
                className="inline-flex items-center gap-1.5 rounded-md transition hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}

          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-cyan-700/60 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">
                    {userInitial}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm lg:inline">{userName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                <DropdownMenuLabel className="pt-0">{userRole}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/compare" prefetch={false}>
                    Open compare
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/watchlists" prefetch={false}>
                    Open watchlists
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 data-highlighted:bg-red-50 data-highlighted:text-red-700"
                  onSelect={(event) => {
                    event.preventDefault()
                    signOut({ callbackUrl: "/" })
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={() => signIn()}
              className="cursor-pointer rounded-md transition hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
            >
              Login
            </button>
          )}
        </nav>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close mobile navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
        />
      )}

      <Navbar status={status} open={open} setOpen={setOpen} />
    </header>
  )
}

export default Header
