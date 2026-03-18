"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { navLinks } from "@/components/layout/header/nav-links"
import { useSession, signOut, signIn } from "next-auth/react"
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

const Header = () => {
  const pathname = usePathname()
  const { status, data: session } = useSession()
  const userName = session?.user?.name || "Account"
  const userInitial = userName.charAt(0).toUpperCase() || "A"
  const userRole = session?.user?.role === "admin" ? "Admin" : "User"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-300/70 bg-linear-to-r from-stone-50/95 via-white/95 to-stone-100/90 text-stone-900 shadow-[0_10px_28px_-22px_rgba(41,37,36,0.38)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={false}
          className="group drop-shadow-amber-400/70 items-center flex gap-3 rounded-xl px-1 py-0.5 focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:outline-none"
        >
          <Image
            src="/mjd-logo.png"
            alt="Logo"
            width={52}
            height={52}
            className="rounded-full border border-stone-300 shadow-sm transition group-hover:shadow-md bg-amber-500"
            priority
          />
          <Text
            as="span"
            variant="title"
            tone="inherit"
            weight="extrabold"
            className="tracking-wide text-stone-800 select-none sm:text-xl"
          >
            MJD
          </Text>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-semibold md:flex xl:gap-3 xl:text-base">
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
                prefetch={false}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 transition focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none"
              >
                <span
                  className={
                    isActive
                      ? "inline-flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/85 px-2.5 py-1.5 text-amber-900 shadow-[0_6px_16px_-12px_rgba(180,83,9,0.5)]"
                      : "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-stone-600 hover:border-stone-200 hover:bg-stone-100/85 hover:text-stone-900"
                  }
                >
                  <Icon className="h-4 w-4" />
                  <Text as="span" tone="inherit">
                    {link.label}
                  </Text>
                </span>
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
                  className="gap-2 border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-amber-950">
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
            <Button type="button" onClick={() => signIn()} variant="secondary" size="sm">
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
