import { ReactNode } from "react"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

interface SectionHeaderProps {
  title: string
  description?: string
  right?: ReactNode
  className?: string
  icon?: keyof typeof OutlineIcons
  badge?: string
  tone?: "default" | "glass"
}

export function SectionHeader({
  title,
  description,
  right,
  className,
  icon = "SparklesIcon",
  badge,
  tone = "default",
}: SectionHeaderProps) {
  const Icon = OutlineIcons[icon]
  const toneClasses = {
    default: {
      container:
        "border-stone-200/90 bg-linear-to-br from-white via-white to-stone-50 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.35)]",
      iconWrap: "bg-stone-100 text-stone-700",
      title: "text-slate-900",
      description: "text-stone-600",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
    },
    glass: {
      container: "border-white/30 bg-white/12 shadow-[0_16px_40px_-24px_rgba(2,6,23,0.75)] backdrop-blur-md",
      iconWrap: "bg-white/20 text-amber-100",
      title: "text-white",
      description: "text-slate-100/90",
      badge: "border-white/35 bg-white/20 text-amber-50",
    },
  }[tone]

  return (
    <div className={cn("rounded-2xl border p-4 sm:p-6", toneClasses.container, className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200/80",
              toneClasses.iconWrap,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Text
                as="h2"
                variant="h2"
                weight="extrabold"
                className={cn("sm:text-2xl", toneClasses.title)}
              >
                {title}
              </Text>
              {badge ? (
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    toneClasses.badge,
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </div>
            {description ? (
              <Text
                as="p"
                variant="body"
                className={cn("mt-1.5 max-w-3xl", toneClasses.description)}
              >
                {description}
              </Text>
            ) : null}
          </div>
        </div>
        {right ? <div className="sm:self-end">{right}</div> : null}
      </div>
    </div>
  )
}
