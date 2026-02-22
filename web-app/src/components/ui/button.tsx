import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm"

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl cursor-pointer font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-60"

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-cyan-700 text-white hover:bg-cyan-600",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-500",
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: "min-h-7 px-2 py-1 text-xs",
  sm: "min-h-8 px-3 py-1.5 text-xs",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-11 px-5 py-2.5 text-sm sm:text-base",
  icon: "h-10 w-10 p-0",
  "icon-sm": "h-8 w-8 p-0",
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
