import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type InputSize = "sm" | "md"

interface InputVariantProps {
  inputSize?: InputSize
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, InputVariantProps {}

const baseClassName =
  "w-full rounded-xl border border-emerald-950/15 bg-white text-sm text-emerald-950 shadow-[0_9px_22px_-18px_rgba(15,50,36,0.45)] transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-stone-400 hover:border-emerald-900/30 focus-visible:border-emerald-700 focus-visible:ring-3 focus-visible:ring-lime-300/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500 disabled:opacity-70 aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-100"

const sizeClasses: Record<InputSize, string> = {
  sm: "min-h-10 px-3 py-2",
  md: "min-h-11 px-3.5 py-2.5",
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
