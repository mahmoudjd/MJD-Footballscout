import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type InputSize = "sm" | "md"

interface InputVariantProps {
  inputSize?: InputSize
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, InputVariantProps {}

const baseClassName =
  "w-full rounded-xl border border-stone-300 bg-white text-sm text-stone-800 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.3)] transition-all duration-200 placeholder:text-stone-400 hover:border-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const sizeClasses: Record<InputSize, string> = {
  sm: "px-3 py-2",
  md: "p-2.5",
}

export function inputVariants({
  inputSize = "sm",
  className,
}: InputVariantProps & { className?: string }) {
  return cn(baseClassName, sizeClasses[inputSize], className)
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = "sm", className, ...props }, ref) => {
    return <input ref={ref} className={inputVariants({ inputSize, className })} {...props} />
  },
)

Input.displayName = "Input"
