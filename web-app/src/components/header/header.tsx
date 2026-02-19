"use client"
import Link from "next/link"
import Image from "next/image"
import { OutlineIcons } from "@/components/outline-icons"
import { navLinks } from "@/components/header/nav-links"
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
  const { status, data: session } = useSession()
  const userName = session?.user?.name || "Account"
  const userInitial = userName.charAt(0).toUpperCase() || "A"
  const userRole = session?.user?.role === "admin" ? "Admin" : "User"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-300/30 bg-linear-to-r from-cyan-900 via-cyan-800 to-teal-700 text-white shadow-lg backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={false}
          className="group flex items-center gap-3 rounded-xl px-1 py-0.5 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
        >
          <Image
            src="/mjd-logo.png"
            alt="Logo"
            width={52}
            height={52}
            className="rounded-full shadow-md ring-2 ring-white/30 transition group-hover:ring-white/50"
            priority
          />
          <Text
            as="span"
            variant="title"
            tone="inherit"
            weight="extrabold"
            className="tracking-wide select-none sm:text-xl"
          >
            MJD
          </Text>
        </Link>

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
                className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition hover:bg-white/10 hover:text-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
              >
                <Icon className="h-4 w-4" />
                <Text as="span" tone="inherit">
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
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-white focus-visible:ring-cyan-200"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">
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
            <Button
              type="button"
              onClick={() => signIn()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 hover:text-cyan-100 focus-visible:ring-cyan-200"
            >
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
