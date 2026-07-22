"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { navLinks } from "@/components/layout/header/nav-links"
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
  const userName = session?.user?.name || "Account"
  const userInitial = userName.charAt(0).toUpperCase() || "A"
  const userRole = session?.user?.role === "admin" ? "Admin" : "User"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-950/10 bg-[#f8faf7]/92 text-emerald-950 shadow-[0_12px_35px_-28px_rgba(6,78,59,0.45)] backdrop-blur-xl">
      <div
        className={cn(
          "mx-auto flex h-[72px] w-full items-center justify-between px-4 sm:px-6 lg:px-8",
          appShellWidthClassName,
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-lime-500/60 focus-visible:outline-none"
        >
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-emerald-950 shadow-[0_10px_24px_-14px_rgba(6,78,59,0.75)] transition-transform group-hover:-translate-y-0.5">
            <Image src="/mjd-logo.png" alt="MJD Football Scout" width={44} height={44} priority />
          </span>
          <span className="hidden sm:block">
            <Text
              as="span"
              weight="extrabold"
              className="block leading-none tracking-[-0.025em] text-emerald-950"
            >
              MJD Football
            </Text>
            <Text
              as="span"
              variant="caption"
              className="mt-1 block font-semibold tracking-[0.14em] text-emerald-700 uppercase"
            >
              Scout intelligence
            </Text>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-2xl border border-emerald-950/10 bg-linear-to-br from-white/95 to-emerald-50/75 p-1.5 text-sm font-semibold shadow-[0_14px_30px_-24px_rgba(6,78,59,0.4)] md:flex">
          {navLinks.map((link) => {
            const Icon = OutlineIcons[link.icon]
            const targetHref =
              link.authRequired && status !== "authenticated"
                ? `/login?callbackUrl=${encodeURIComponent(link.href)}`
                : link.href
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`)

            return (
              <Link
                key={link.href}
                href={targetHref}
                className={
                  isActive
                    ? "inline-flex min-h-10 touch-manipulation items-center gap-1.5 rounded-xl bg-linear-to-r from-emerald-950 to-emerald-800 px-3 py-2 text-white shadow-[0_10px_20px_-14px_rgba(6,78,59,0.75)] transition-[box-shadow,transform] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-1 focus-visible:outline-none motion-reduce:transform-none"
                    : "inline-flex min-h-10 touch-manipulation items-center gap-1.5 rounded-xl px-3 py-2 text-emerald-950/60 transition-[background-color,color,transform] hover:-translate-y-0.5 hover:bg-white hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none motion-reduce:transform-none"
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <Text
                  as="span"
                  tone="inherit"
                  className={link.compactUntilWide ? "sr-only xl:not-sr-only" : undefined}
                >
                  {link.label}
                </Text>
              </Link>
            )
          })}

          {status === "authenticated" ? (
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
              className="inline-flex min-h-10 touch-manipulation items-center rounded-xl bg-lime-300 px-4 py-2 text-sm font-bold text-emerald-950 shadow-sm transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-lime-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
