import type { HTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type ChipTone =
  | "slate"
  | "cyan"
  | "emerald"
  | "amber"
  | "violet"
  | "rose"
  | "danger"
  | "success"
  | "neutral"

type ChipSize = "xs" | "sm"

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone
  size?: ChipSize
}

const toneClasses: Record<ChipTone, string> = {
  slate: "border-slate-300 bg-slate-100 text-slate-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-100 text-emerald-700",
  neutral: "border-slate-200 bg-white text-slate-700",
}

const sizeClasses: Record<ChipSize, string> = {
  xs: "px-2 py-0.5 text-xs",
  sm: "px-2.5 py-1 text-xs",
}

export function chipVariants({ tone = "slate", size = "sm", className }: ChipProps) {
  return cn(
    "inline-flex items-center rounded-full border font-semibold",
    toneClasses[tone],
    sizeClasses[size],
    className,
  )
}

export function Chip({ tone = "slate", size = "sm", className, ...props }: ChipProps) {
  return <span className={chipVariants({ tone, size, className })} {...props} />
}
