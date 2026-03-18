import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type TextareaSize = "sm" | "md"

interface TextareaVariantProps {
  textareaSize?: TextareaSize
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, TextareaVariantProps {}

const baseClassName =
  "w-full rounded-xl border border-stone-300 bg-white text-sm text-stone-800 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.3)] transition-all duration-200 placeholder:text-stone-400 hover:border-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"

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
