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
    "bg-white/95 border border-slate-200/90 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur-[1px]",
  glass:
    "bg-white/14 border border-white/35 text-white shadow-[0_14px_38px_-18px_rgba(15,23,42,0.55)] backdrop-blur-sm",
  soft:
    "bg-linear-to-br from-cyan-50 via-white to-slate-50 border border-cyan-100/70 shadow-[0_8px_24px_-18px_rgba(14,116,144,0.4)]",
}

const spacingClasses: Record<NonNullable<PanelProps["spacing"]>, string> = {
  default: "p-4 sm:p-6",
  compact: "p-3 sm:p-4",
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
