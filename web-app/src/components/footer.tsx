import { Text } from "@/components/ui/text"

export function Footer() {
  return (
    <footer className="hidden w-full border-t border-slate-200/80 bg-white/90 backdrop-blur-sm md:block">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-center px-4 text-xs text-slate-600 sm:text-sm">
        <Text as="p" variant="caption" tone="muted" className="sm:text-sm">
          &copy; {new Date().getFullYear()} Mahmoud Al Jarad
        </Text>
      </div>
    </footer>
  )
}
