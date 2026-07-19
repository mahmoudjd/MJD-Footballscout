import Link from "next/link"
import { Text } from "@/components/ui/text"
import { appShellWidthClassName } from "@/components/ui/page-container"
import { cn } from "@/lib/cn"

const footerLinks = [
  { href: "/players", label: "Players" },
  { href: "/search", label: "Search" },
  { href: "/compare", label: "Compare" },
  { href: "/watchlists", label: "Watchlists" },
  { href: "/help", label: "Help" },
  { href: "/help#whats-new", label: "What’s New" },
]

export function Footer() {
  return (
    <footer className="hidden w-full border-t border-emerald-950/10 bg-[#f8faf7] md:block">
      <div
        className={cn(
          "mx-auto flex min-h-20 w-full items-center justify-between gap-6 px-4 py-4 text-xs text-stone-500 sm:px-6 sm:text-sm lg:px-8",
          appShellWidthClassName,
        )}
      >
        <Text as="p" variant="caption" tone="muted" className="sm:text-sm">
          &copy; {new Date().getFullYear()} MJD Football Scout
        </Text>
        <nav aria-label="Footer navigation" className="flex items-center gap-1">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-950/60 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
