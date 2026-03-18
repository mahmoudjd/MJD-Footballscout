import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

interface StatTileProps {
  label: string
  value: string | number
  className?: string
  tone?: "default" | "glass"
}

export function StatTile({ label, value, className, tone = "default" }: StatTileProps) {
  const toneClasses = {
    default: {
      container: "border-stone-200 bg-white",
      label: "text-stone-500",
      value: "text-stone-900",
    },
    glass: {
      container: "border-white/30 bg-white/12 text-white backdrop-blur-md",
      label: "text-slate-200",
      value: "text-amber-100",
    },
  }[tone]

  return (
    <div className={cn("rounded-2xl border p-4 shadow-[0_14px_26px_-24px_rgba(15,23,42,0.5)]", toneClasses.container, className)}>
      <Text as="p" variant="overline" className={toneClasses.label}>
        {label}
      </Text>
      <Text as="p" variant="h2" weight="extrabold" className={cn("mt-2", toneClasses.value)}>
        {value}
      </Text>
    </div>
  )
}
