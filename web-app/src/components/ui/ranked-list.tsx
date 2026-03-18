import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

interface RankedListItem {
  key: string
  label: string
  value: string | number
}

interface RankedListProps {
  title: string
  items: RankedListItem[]
  emptyText: string
  className?: string
  tone?: "default" | "glass"
}

export function RankedList({
  title,
  items,
  emptyText,
  className,
  tone = "default",
}: RankedListProps) {
  const toneClasses = {
    default: {
      container: "border-stone-200 bg-white",
      title: "text-stone-700",
      label: "text-stone-700",
      value: "border-stone-200 bg-stone-100 text-stone-700",
      empty: "text-stone-500",
    },
    glass: {
      container: "border-white/30 bg-white/12 text-white backdrop-blur-md",
      title: "text-slate-100",
      label: "text-slate-100",
      value: "border-amber-200/40 bg-amber-200/20 text-amber-50",
      empty: "text-slate-200/90",
    },
  }[tone]

  return (
    <div className={cn("rounded-2xl border p-4 shadow-[0_14px_26px_-24px_rgba(15,23,42,0.5)]", toneClasses.container, className)}>
      <Text as="h4" variant="overline" weight="bold" className={cn("tracking-wider", toneClasses.title)}>
        {title}
      </Text>
      <ul className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((entry) => (
            <li key={entry.key} className="flex items-center justify-between text-sm">
              <Text as="span" className={toneClasses.label}>
                {entry.label}
              </Text>
              <span className={cn("rounded-full border px-2.5 py-0.5 font-semibold", toneClasses.value)}>
                {entry.value}
              </span>
            </li>
          ))
        ) : (
          <li>
            <Text as="span" className={toneClasses.empty}>
              {emptyText}
            </Text>
          </li>
        )}
      </ul>
    </div>
  )
}
