import { ReactNode } from "react"
import { cn } from "@/lib/cn"

interface PanelProps {
  children: ReactNode
  className?: string
  tone?: "default" | "glass" | "soft"
  spacing?: "default" | "compact" | "none"
}

const toneClasses: Record<NonNullable<PanelProps["tone"]>, string> = {
  default:
    "bg-white/96 border border-emerald-950/8 shadow-[0_24px_55px_-38px_rgba(15,50,36,0.32)] backdrop-blur-[1px]",
  glass:
    "bg-white/14 border border-white/30 text-white shadow-[0_20px_42px_-24px_rgba(15,23,42,0.55)] backdrop-blur-sm",
  soft: "bg-linear-to-br from-[#f8faf7] via-white to-emerald-50/35 border border-emerald-950/8 shadow-[0_18px_36px_-28px_rgba(15,50,36,0.28)]",
}

const spacingClasses: Record<NonNullable<PanelProps["spacing"]>, string> = {
  default: "p-4 sm:p-5",
  compact: "p-3.5 sm:p-4",
  none: "p-0",
}

/** Cards use a single radius across the app — see docs/design-critique-2026-07.md. */
const panelRadiusClassName = "rounded-3xl"

export function Panel({ children, className, tone = "default", spacing = "default" }: PanelProps) {
  return (
    <section
      className={cn(panelRadiusClassName, spacingClasses[spacing], toneClasses[tone], className)}
    >
      {children}
    </section>
  )
}
