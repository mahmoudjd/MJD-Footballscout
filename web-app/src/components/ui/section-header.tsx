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
  level?: "h1" | "h2"
}

export function SectionHeader({
  title,
  description,
  right,
  className,
  icon = "SparklesIcon",
  badge,
  tone = "default",
  level = "h1",
}: SectionHeaderProps) {
  const Icon = OutlineIcons[icon]
  const toneClasses = {
    default: {
      container:
        "border-emerald-950/8 bg-linear-to-br from-white via-white to-emerald-50/45 shadow-[0_24px_50px_-36px_rgba(15,50,36,0.38)]",
      iconWrap: "border-emerald-800/10 bg-emerald-100/70 text-emerald-800 shadow-inner",
      title: "text-emerald-950",
      description: "text-emerald-950/65",
      badge: "border-lime-300/70 bg-lime-100/70 text-emerald-900",
    },
    glass: {
      container:
        "border-white/30 bg-white/12 shadow-[0_16px_40px_-24px_rgba(2,6,23,0.75)] backdrop-blur-md",
      iconWrap: "border-white/25 bg-white/20 text-lime-100",
      title: "text-white",
      description: "text-slate-100/90",
      badge: "border-white/35 bg-white/20 text-lime-50",
    },
  }[tone]

  return (
    <header
      className={cn(
        "overflow-hidden rounded-3xl border p-4 sm:p-6",
        toneClasses.container,
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
              toneClasses.iconWrap,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Text
                as={level}
                variant="h1"
                weight="extrabold"
                className={cn("text-2xl sm:text-3xl", toneClasses.title)}
              >
                {title}
              </Text>
              {badge ? (
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide tabular-nums",
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
        {right ? (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:self-end">{right}</div>
        ) : null}
      </div>
    </header>
  )
}
