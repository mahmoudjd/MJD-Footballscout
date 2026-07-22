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
import {
  isNavPathActive,
  mobileMoreLinks,
  mobileTabLinks,
  navLinkShortLabel,
  resolveNavHref,
} from "@/components/layout/header/nav-links"
import { cn } from "@/lib/cn"

const tabClassName =
  "inline-flex min-w-0 flex-1 touch-manipulation flex-col items-center gap-1 rounded-2xl border border-transparent px-2 py-2 transition-[background-color,border-color,color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none active:scale-[0.98] motion-reduce:transform-none"

const tabActiveClassName = "border-emerald-900 bg-emerald-950 text-white shadow-sm"

const tabIdleClassName =
  "text-stone-600 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-950"

const sheetLinkClassName =
  "inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-3 py-2.5 text-sm font-semibold text-emerald-950/75 transition-[background-color,border-color,color] hover:border-emerald-700/20 hover:bg-emerald-50 hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"

/** Account routes are not product navigation, but they still live in the sheet. */
const accountRoutes = ["/profile", "/login", "/signup", "/forgot-password", "/reset-password"]

export function MobileTabBar() {
  const pathname = usePathname()
  const { status, data: session } = useSession()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const isAuthenticated = status === "authenticated"
  const userName = session?.user?.name || "Guest"
  const userRole = session?.user?.role === "admin" ? "Admin" : "User"

  const moreActive = useMemo(() => {
    const moreRoutes = [...mobileMoreLinks.map((link) => link.href), ...accountRoutes]
    return moreRoutes.some((route) => isNavPathActive(pathname, route))
  }, [pathname])

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <nav
          aria-label="Mobile tab navigation"
          className="mx-auto flex w-full max-w-xl items-center justify-between rounded-3xl border border-emerald-950/10 bg-[#f8faf7]/95 px-2 py-2 shadow-[0_18px_40px_rgba(15,50,36,0.16)] backdrop-blur-xl"
        >
          {mobileTabLinks.map((tab) => {
            const Icon = OutlineIcons[tab.icon]
            const isActive = isNavPathActive(pathname, tab.href)
            return (
              <Link
                key={tab.href}
                href={resolveNavHref(tab, isAuthenticated)}
                prefetch={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(tabClassName, isActive ? tabActiveClassName : tabIdleClassName)}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <Text as="span" variant="caption" tone="inherit" className="truncate text-[11px]">
                  {navLinkShortLabel(tab)}
                </Text>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={cn(tabClassName, moreActive ? tabActiveClassName : tabIdleClassName)}
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
            <DialogDescription>Account and other sections</DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-2">
            {mobileMoreLinks.map((link) => {
              const Icon = OutlineIcons[link.icon]
              return (
                <Link
                  key={link.href}
                  href={resolveNavHref(link, isAuthenticated)}
                  prefetch={false}
                  onClick={() => setIsMoreOpen(false)}
                  className={sheetLinkClassName}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {link.label}
                </Link>
              )
            })}

            {isAuthenticated ? (
              <Link
                href="/profile"
                prefetch={false}
                onClick={() => setIsMoreOpen(false)}
                className={sheetLinkClassName}
              >
                <OutlineIcons.UserIcon className="h-5 w-5" aria-hidden="true" />
                Profile &amp; Security
              </Link>
            ) : null}

            {isAuthenticated ? (
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
                You are not signed in.
              </Text>
            )}

            {isAuthenticated ? (
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
