import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type TextareaSize = "sm" | "md"

interface TextareaVariantProps {
  textareaSize?: TextareaSize
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, TextareaVariantProps {}

const baseClassName =
  "w-full rounded-xl border border-slate-300 bg-white text-sm shadow-sm transition-colors duration-200 hover:border-slate-400 focus:border-cyan-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const sizeClasses: Record<TextareaSize, string> = {
  sm: "px-3 py-2",
  md: "p-2.5",
}

export function textareaVariants({
  textareaSize = "sm",
  className,
}: TextareaVariantProps & { className?: string }) {
  return cn(baseClassName, sizeClasses[textareaSize], className)
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ textareaSize = "sm", className, ...props }, ref) => {
    return <textarea ref={ref} className={textareaVariants({ textareaSize, className })} {...props} />
  },
)

Textarea.displayName = "Textarea"
