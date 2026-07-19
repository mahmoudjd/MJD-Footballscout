import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm"

const baseClassName =
  "inline-flex touch-manipulation items-center justify-center gap-2 rounded-xl border border-transparent font-semibold tracking-[0.01em] [-webkit-tap-highlight-color:transparent] transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-lime-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-safe:active:scale-[0.98]"

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-emerald-950 bg-emerald-950 text-white shadow-[0_10px_24px_-14px_rgba(6,78,59,0.8)] hover:-translate-y-0.5 hover:border-emerald-900 hover:bg-emerald-900 hover:shadow-[0_16px_30px_-16px_rgba(6,78,59,0.72)]",
  secondary:
    "border-lime-300 bg-lime-300 text-emerald-950 shadow-[0_10px_24px_-14px_rgba(101,163,13,0.7)] hover:-translate-y-0.5 hover:border-lime-200 hover:bg-lime-200 hover:shadow-[0_16px_30px_-16px_rgba(101,163,13,0.62)]",
  outline:
    "border-emerald-950/14 bg-white text-emerald-950 shadow-[0_8px_20px_-17px_rgba(15,50,36,0.4)] hover:-translate-y-0.5 hover:border-emerald-900/25 hover:bg-emerald-50/70 hover:shadow-[0_14px_26px_-18px_rgba(15,50,36,0.36)]",
  ghost: "text-stone-700 hover:bg-emerald-50 hover:text-emerald-950",
  danger:
    "border-red-600 bg-red-600 text-white shadow-[0_10px_22px_-14px_rgba(153,27,27,0.62)] hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-500",
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: "min-h-8 px-3 py-1.5 text-xs",
  sm: "min-h-10 px-3.5 py-2 text-xs",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-sm sm:text-base",
  icon: "h-11 w-11 p-0",
  "icon-sm": "h-10 w-10 p-0",
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
  return cn(
    baseClassName,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", fullWidth = false, type = "button", ...props },
    ref,
  ) => {
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
