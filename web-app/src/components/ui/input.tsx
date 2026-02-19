import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type InputSize = "sm" | "md"

interface InputVariantProps {
  inputSize?: InputSize
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, InputVariantProps {}

const baseClassName =
  "w-full rounded-xl border border-slate-300 bg-white text-sm shadow-sm transition-colors duration-200 hover:border-slate-400 focus:border-cyan-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"

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
