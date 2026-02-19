"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { OutlineIcons } from "@/components/outline-icons"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
    return ["/watchlists", "/login", "/signup"].some((route) => isPathActive(pathname, route))
  }, [pathname])

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <nav
          aria-label="Mobile tab navigation"
          className="mx-auto flex w-full max-w-xl items-center justify-between rounded-3xl border border-slate-200 bg-white/95 px-2 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur"
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
                  "inline-flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none",
                  isActive
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                )}
              >
                <Icon className="h-5 w-5" />
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
              "inline-flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none",
              moreActive
                ? "bg-cyan-50 text-cyan-700"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
            )}
            aria-label="Open more actions"
          >
            <OutlineIcons.Bars4Icon className="h-5 w-5" />
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
                  ? "/watchlists"
                  : `/login?callbackUrl=${encodeURIComponent("/watchlists")}`
              }
              prefetch={false}
              onClick={() => setIsMoreOpen(false)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              <OutlineIcons.HeartIcon className="h-5 w-5" />
              Watchlists
            </Link>

            {status === "authenticated" ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <Text as="p" variant="body" weight="semibold">
                  {userName}
                </Text>
                <Text as="p" variant="caption" tone="muted">
                  {userRole}
                </Text>
              </div>
            ) : (
              <Text as="p" variant="caption" tone="muted" className="rounded-2xl bg-slate-50 px-3 py-2">
                Du bist aktuell nicht eingeloggt.
              </Text>
            )}

            {status === "authenticated" ? (
              <Button
                type="button"
                variant="outline"
                fullWidth
                className="justify-start border-slate-300 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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
