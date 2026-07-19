import type { HTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type ChipTone =
  "slate" | "cyan" | "emerald" | "amber" | "violet" | "rose" | "danger" | "success" | "neutral"

type ChipSize = "xs" | "sm"

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone
  size?: ChipSize
}

const toneClasses: Record<ChipTone, string> = {
  slate: "border-stone-200 bg-stone-100/90 text-stone-700",
  cyan: "border-sky-200 bg-sky-50 text-sky-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-lime-300 bg-lime-100/70 text-emerald-900",
  violet: "border-indigo-200 bg-indigo-50 text-indigo-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-100 text-emerald-800",
  neutral:
    "border-emerald-950/10 bg-white text-stone-700 shadow-[0_5px_14px_-12px_rgba(15,50,36,0.45)]",
}

const sizeClasses: Record<ChipSize, string> = {
  xs: "px-2 py-0.5 text-xs",
  sm: "px-2.5 py-1 text-xs",
}

export function chipVariants({ tone = "slate", size = "sm", className }: ChipProps) {
  return cn(
    "inline-flex items-center rounded-full border font-semibold tracking-[0.01em] tabular-nums",
    toneClasses[tone],
    sizeClasses[size],
    className,
  )
}

export function Chip({ tone = "slate", size = "sm", className, ...props }: ChipProps) {
  return <span className={chipVariants({ tone, size, className })} {...props} />
}
