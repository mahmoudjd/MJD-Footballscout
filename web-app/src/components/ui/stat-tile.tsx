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
      container: "border-emerald-950/8 bg-linear-to-br from-white to-emerald-50/50",
      label: "text-emerald-950/55",
      value: "text-emerald-950",
    },
    glass: {
      container: "border-white/30 bg-white/12 text-white backdrop-blur-md",
      label: "text-slate-200",
      value: "text-lime-100",
    },
  }[tone]

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-[0_18px_34px_-28px_rgba(15,50,36,0.42)]",
        toneClasses.container,
        className,
      )}
    >
      <Text as="p" variant="overline" className={toneClasses.label}>
        {label}
      </Text>
      <Text
        as="p"
        variant="h2"
        weight="extrabold"
        className={cn("mt-2 tabular-nums", toneClasses.value)}
      >
        {value}
      </Text>
    </div>
  )
}
