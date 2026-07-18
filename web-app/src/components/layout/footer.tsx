import Link from "next/link"
import { Text } from "@/components/ui/text"

export function Footer() {
  return (
    <footer className="hidden w-full border-t border-stone-200/80 bg-white/90 backdrop-blur-sm md:block">
      <div className="mx-auto flex min-h-12 w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs text-stone-600 sm:text-sm">
        <Text as="p" variant="caption" tone="muted" className="sm:text-sm">
          &copy; {new Date().getFullYear()} Mahmoud Al Jarad
        </Text>
        <nav aria-label="Help navigation" className="flex items-center gap-1">
          <Link
            href="/help"
            className="rounded-lg px-2.5 py-2 font-semibold text-stone-600 transition-colors hover:bg-amber-50 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            Help
          </Link>
          <Link
            href="/help#whats-new"
            className="rounded-lg px-2.5 py-2 font-semibold text-stone-600 transition-colors hover:bg-amber-50 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            What’s New
          </Link>
        </nav>
      </div>
    </footer>
  )
}
