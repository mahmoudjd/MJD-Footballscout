"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { OutlineIcons } from "@/components/icons/outline-icons"
import {
  primaryNavLinks,
  secondaryNavLinks,
  type NavLink,
} from "@/components/layout/header/nav-links"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { appShellWidthClassName } from "@/components/ui/page-container"
import { cn } from "@/lib/cn"

const Header = () => {
  const pathname = usePathname()
  const { status, data: session } = useSession()
  const isAuthed = status === "authenticated"
  const userName = session?.user?.name || "Account"
  const userInitial = userName.charAt(0).toUpperCase() || "A"
  const userRole = session?.user?.role === "admin" ? "Admin" : "User"

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  const resolveHref = (link: NavLink) =>
    link.authRequired && !isAuthed
      ? `/login?callbackUrl=${encodeURIComponent(link.href)}`
      : link.href

  const moreActive = secondaryNavLinks.some((link) => isActive(link.href))

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-950/10 bg-[#f8faf7]/90 text-emerald-950 backdrop-blur-xl">
      <div
        className={cn(
          "mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8",
          appShellWidthClassName,
        )}
      >
        {/* Brand */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-lime-500/60 focus-visible:outline-none"
        >
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-emerald-950">
            <Image src="/mjd-logo.png" alt="MJD Football Scout" width={40} height={40} priority />
          </span>
          <span className="hidden sm:block">
            <Text
              as="span"
              weight="bold"
              className="block leading-none tracking-[-0.02em] text-emerald-950"
            >
              MJD Football
            </Text>
            <Text
              as="span"
              variant="caption"
              className="mt-0.5 block font-semibold tracking-[0.14em] text-emerald-700 uppercase"
            >
              Scout intelligence
            </Text>
          </span>
        </Link>

        {/* Primary navigation */}
        <nav className="hidden items-center gap-0.5 text-sm font-semibold md:flex">
          {primaryNavLinks.map((link) => {
            const Icon = OutlineIcons[link.icon]
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={resolveHref(link)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 touch-manipulation items-center gap-1.5 rounded-lg px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none",
                  active
                    ? "bg-emerald-950 text-white"
                    : "text-emerald-950/60 hover:bg-emerald-950/5 hover:text-emerald-950",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <Text as="span" tone="inherit">
                  {link.label}
                </Text>
              </Link>
            )
          })}

          {/* More */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More sections"
                className={cn(
                  "inline-flex min-h-10 touch-manipulation items-center gap-1.5 rounded-lg px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none",
                  moreActive
                    ? "bg-emerald-950 text-white"
                    : "text-emerald-950/60 hover:bg-emerald-950/5 hover:text-emerald-950",
                )}
              >
                <Text as="span" tone="inherit">
                  More
                </Text>
                <OutlineIcons.ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {secondaryNavLinks.map((link) => {
                const Icon = OutlineIcons[link.icon]
                return (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={resolveHref(link)} prefetch={false} className="gap-2">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Account */}
        <div className="hidden shrink-0 items-center md:flex">
          {isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 border-emerald-950/10 bg-white text-emerald-950 hover:bg-emerald-50"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-lime-300 text-xs font-bold text-emerald-950">
                    {userInitial}
                  </span>
                  <Text as="span" tone="inherit" className="hidden max-w-32 truncate lg:inline">
                    {userName}
                  </Text>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                <DropdownMenuLabel className="pt-0">{userRole}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" prefetch={false}>
                    Profile & Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  tone="danger"
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
            <Link
              href="/login"
              className="inline-flex min-h-10 touch-manipulation items-center rounded-lg bg-lime-300 px-4 py-2 text-sm font-bold text-emerald-950 transition-colors hover:bg-lime-200 focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
