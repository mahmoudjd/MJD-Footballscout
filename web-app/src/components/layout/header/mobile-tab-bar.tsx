"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/cn"

type MobileTabItem = {
  href: string
  label: string
  icon: keyof typeof OutlineIcons
  authRequired?: boolean
}

const primaryTabs: MobileTabItem[] = [
  { href: "/", label: "Home", icon: "GlobeAltIcon" },
  { href: "/players", label: "Players", icon: "UserGroupIcon" },
  { href: "/search", label: "Search", icon: "SparklesIcon" },
  { href: "/compare", label: "Compare", icon: "ArrowsRightLeftIcon", authRequired: true },
]

function isPathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileTabBar() {
  const pathname = usePathname()
  const { status, data: session } = useSession()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const userName = session?.user?.name || "Guest"
  const userRole = session?.user?.role === "admin" ? "Admin" : "User"

  const moreActive = useMemo(() => {
    return [
      "/watchlists",
      "/shadow-team",
      "/recruitment",
      "/profile",
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/help",
    ].some((route) => isPathActive(pathname, route))
  }, [pathname])

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <nav
          aria-label="Mobile tab navigation"
          className="mx-auto flex w-full max-w-xl items-center justify-between rounded-3xl border border-emerald-950/10 bg-[#f8faf7]/95 px-2 py-2 shadow-[0_18px_40px_rgba(15,50,36,0.16)] backdrop-blur-xl"
        >
          {primaryTabs.map((tab) => {
            const Icon = OutlineIcons[tab.icon]
            const isActive = isPathActive(pathname, tab.href)
            const href =
              tab.authRequired && status !== "authenticated"
                ? `/login?callbackUrl=${encodeURIComponent(tab.href)}`
                : tab.href
            return (
              <Link
                key={tab.href}
                href={href}
                prefetch={false}
                className={cn(
                  "inline-flex min-w-0 flex-1 touch-manipulation flex-col items-center gap-1 rounded-2xl border border-transparent px-2 py-2 transition-[background-color,border-color,color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none active:scale-[0.98] motion-reduce:transform-none",
                  isActive
                    ? "border-emerald-900 bg-emerald-950 text-white shadow-sm"
                    : "text-stone-500 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-950",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <Text as="span" variant="caption" tone="inherit" className="truncate text-[11px]">
                  {tab.label}
                </Text>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "inline-flex min-w-0 flex-1 touch-manipulation flex-col items-center gap-1 rounded-2xl border border-transparent px-2 py-2 transition-[background-color,border-color,color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none active:scale-[0.98] motion-reduce:transform-none",
              moreActive
                ? "border-emerald-900 bg-emerald-950 text-white shadow-sm"
                : "text-stone-500 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-950",
            )}
            aria-label="Open more actions"
          >
            <OutlineIcons.Bars4Icon className="h-5 w-5" aria-hidden="true" />
            <Text as="span" variant="caption" tone="inherit" className="text-[11px]">
              More
            </Text>
          </button>
        </nav>
      </div>

      <Dialog open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DialogContent
          size="sm"
          className="top-auto bottom-[calc(6.25rem+env(safe-area-inset-bottom))] max-h-[70vh] w-[calc(100%-1rem)] max-w-md -translate-y-0 rounded-3xl p-5"
        >
          <DialogHeader>
            <DialogTitle>More</DialogTitle>
            <DialogDescription>Account und weitere Bereiche</DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-2">
            <Link
              href={
                status === "authenticated"
                  ? "/recruitment"
                  : `/login?callbackUrl=${encodeURIComponent("/recruitment")}`
              }
              prefetch={false}
              onClick={() => setIsMoreOpen(false)}
              className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-3 py-2.5 text-sm font-semibold text-emerald-950/70 transition-[background-color,border-color,color] hover:border-emerald-700/20 hover:bg-emerald-50 hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
            >
              <OutlineIcons.RocketLaunchIcon className="h-5 w-5" aria-hidden="true" />
              Recruitment Workspace
            </Link>

            <Link
              href={
                status === "authenticated"
                  ? "/shadow-team"
                  : `/login?callbackUrl=${encodeURIComponent("/shadow-team")}`
              }
              prefetch={false}
              onClick={() => setIsMoreOpen(false)}
              className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-3 py-2.5 text-sm font-semibold text-emerald-950/70 transition-[background-color,border-color,color] hover:border-emerald-700/20 hover:bg-emerald-50 hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
            >
              <OutlineIcons.Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
              Squad Builder
            </Link>

            <Link
              href="/help"
              prefetch={false}
              onClick={() => setIsMoreOpen(false)}
              className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-3 py-2.5 text-sm font-semibold text-emerald-950/70 transition-[background-color,border-color,color] hover:border-emerald-700/20 hover:bg-emerald-50 hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
            >
              <OutlineIcons.QuestionMarkCircleIcon className="h-5 w-5" aria-hidden="true" />
              Help & What’s New
            </Link>

            <Link
              href={
                status === "authenticated"
                  ? "/watchlists"
                  : `/login?callbackUrl=${encodeURIComponent("/watchlists")}`
              }
              prefetch={false}
              onClick={() => setIsMoreOpen(false)}
              className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-3 py-2.5 text-sm font-semibold text-emerald-950/70 transition-[background-color,border-color,color] hover:border-emerald-700/20 hover:bg-emerald-50 hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
            >
              <OutlineIcons.HeartIcon className="h-5 w-5" aria-hidden="true" />
              Watchlists
            </Link>

            {status === "authenticated" ? (
              <Link
                href="/profile"
                prefetch={false}
                onClick={() => setIsMoreOpen(false)}
                className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-3 py-2.5 text-sm font-semibold text-emerald-950/70 transition-[background-color,border-color,color] hover:border-emerald-700/20 hover:bg-emerald-50 hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
              >
                <OutlineIcons.UserIcon className="h-5 w-5" aria-hidden="true" />
                Profile & Security
              </Link>
            ) : null}

            {status === "authenticated" ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                <Text as="p" variant="body" weight="semibold">
                  {userName}
                </Text>
                <Text as="p" variant="caption" tone="muted">
                  {userRole}
                </Text>
              </div>
            ) : (
              <Text
                as="p"
                variant="caption"
                tone="muted"
                className="rounded-2xl bg-stone-50 px-3 py-2"
              >
                Du bist aktuell nicht eingeloggt.
              </Text>
            )}

            {status === "authenticated" ? (
              <Button
                type="button"
                variant="outline"
                fullWidth
                className="justify-start border-stone-300 text-stone-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  setIsMoreOpen(false)
                  signOut({ callbackUrl: "/" })
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                type="button"
                fullWidth
                className="justify-start"
                onClick={() => {
                  setIsMoreOpen(false)
                  signIn(undefined, { callbackUrl: pathname || "/" })
                }}
              >
                Login
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
