import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type TextareaSize = "sm" | "md"

interface TextareaVariantProps {
  textareaSize?: TextareaSize
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, TextareaVariantProps {}

const baseClassName =
  "w-full resize-y rounded-xl border border-emerald-950/15 bg-white text-sm leading-6 text-emerald-950 shadow-[0_9px_22px_-18px_rgba(15,50,36,0.45)] transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-stone-500 hover:border-emerald-900/30 focus-visible:border-emerald-700 focus-visible:ring-3 focus-visible:ring-lime-300/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500 disabled:opacity-70 aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-100"

const sizeClasses: Record<TextareaSize, string> = {
  sm: "min-h-24 px-3 py-2.5",
  md: "min-h-32 p-3.5",
}

export function textareaVariants({
  textareaSize = "sm",
  className,
}: TextareaVariantProps & { className?: string }) {
  return cn(baseClassName, sizeClasses[textareaSize], className)
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ textareaSize = "sm", className, ...props }, ref) => {
    return (
      <textarea ref={ref} className={textareaVariants({ textareaSize, className })} {...props} />
    )
  },
)

Textarea.displayName = "Textarea"
