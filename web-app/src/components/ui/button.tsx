import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm"

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl cursor-pointer font-semibold tracking-[0.01em] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60"

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-neutral-900 text-white shadow-[0_8px_20px_-12px_rgba(15,23,42,0.7)] hover:bg-neutral-800 active:translate-y-px",
  secondary:
    "bg-amber-500 text-amber-950 shadow-[0_8px_20px_-12px_rgba(120,53,15,0.55)] hover:bg-amber-400 active:translate-y-px",
  outline:
    "border border-stone-300 bg-white text-stone-700 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.45)] hover:border-stone-400 hover:bg-stone-50",
  ghost: "bg-transparent text-stone-700 hover:bg-stone-100/80",
  danger:
    "bg-red-600 text-white shadow-[0_8px_20px_-12px_rgba(153,27,27,0.6)] hover:bg-red-500 active:translate-y-px",
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: "min-h-7 px-2.5 py-1 text-xs",
  sm: "min-h-9 px-3.5 py-1.5 text-xs",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-11 px-5 py-2.5 text-sm sm:text-base",
  icon: "h-10 w-10 p-0",
  "icon-sm": "h-9 w-9 p-0",
}

interface ButtonVariantProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {}

export function buttonVariants({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonVariantProps & { className?: string }) {
  return cn(baseClassName, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonVariants({ variant, size, fullWidth, className })}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"
