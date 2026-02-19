import type { HTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "body-lg"
  | "body"
  | "caption"
  | "overline"
  | "mono"

type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "primary"
  | "success"
  | "danger"
  | "inverse"
  | "inherit"
type TextWeight = "regular" | "medium" | "semibold" | "bold" | "extrabold"
type TextAlign = "left" | "center" | "right"
type TextElement = "p" | "span" | "div" | "label" | "h1" | "h2" | "h3" | "h4" | "strong" | "small"

interface TextVariantsInput {
  variant?: TextVariant
  tone?: TextTone
  weight?: TextWeight
  align?: TextAlign
  className?: string
}

interface TextProps extends HTMLAttributes<HTMLElement>, TextVariantsInput {
  as?: TextElement
}

const variantClasses: Record<TextVariant, string> = {
  display: "text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl",
  h1: "text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl",
  h2: "text-2xl font-bold leading-tight tracking-tight",
  h3: "text-xl font-bold leading-tight",
  title: "text-lg font-semibold leading-tight",
  "body-lg": "text-base leading-relaxed",
  body: "text-sm leading-relaxed",
  caption: "text-xs leading-normal",
  overline: "text-[11px] font-semibold tracking-wide uppercase",
  mono: "font-mono text-sm",
}

const toneClasses: Record<TextTone, string> = {
  default: "text-slate-900",
  muted: "text-slate-600",
  subtle: "text-slate-500",
  primary: "text-cyan-700",
  success: "text-emerald-700",
  danger: "text-red-700",
  inverse: "text-white",
  inherit: "text-current",
}

const weightClasses: Record<TextWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
}

const alignClasses: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

export function textVariants({
  variant = "body",
  tone = "default",
  weight,
  align = "left",
  className,
}: TextVariantsInput) {
  return cn(
    variantClasses[variant],
    toneClasses[tone],
    alignClasses[align],
    weight ? weightClasses[weight] : "",
    className,
  )
}

export function Text({
  as: Component = "p",
  variant = "body",
  tone = "default",
  weight,
  align = "left",
  className,
  ...props
}: TextProps) {
  return <Component className={textVariants({ variant, tone, weight, align, className })} {...props} />
}
