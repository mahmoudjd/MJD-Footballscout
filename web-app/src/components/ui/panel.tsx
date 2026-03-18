import { ReactNode } from "react"
import { cn } from "@/lib/cn"

interface PanelProps {
  children: ReactNode
  className?: string
  tone?: "default" | "glass" | "soft"
  spacing?: "default" | "compact" | "none"
  radius?: "default" | "large"
}

const toneClasses: Record<NonNullable<PanelProps["tone"]>, string> = {
  default:
    "bg-white/96 border border-stone-200/90 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur-[1px]",
  glass:
    "bg-white/14 border border-white/30 text-white shadow-[0_20px_42px_-24px_rgba(15,23,42,0.55)] backdrop-blur-sm",
  soft:
    "bg-linear-to-br from-stone-50 via-white to-neutral-50 border border-stone-200/80 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.35)]",
}

const spacingClasses: Record<NonNullable<PanelProps["spacing"]>, string> = {
  default: "p-4 sm:p-5",
  compact: "p-3.5 sm:p-4",
  none: "p-0",
}

const radiusClasses: Record<NonNullable<PanelProps["radius"]>, string> = {
  default: "rounded-2xl",
  large: "rounded-3xl",
}

export function Panel({
  children,
  className,
  tone = "default",
  spacing = "default",
  radius = "default",
}: PanelProps) {
  return (
    <section className={cn(radiusClasses[radius], spacingClasses[spacing], toneClasses[tone], className)}>
      {children}
    </section>
  )
}
