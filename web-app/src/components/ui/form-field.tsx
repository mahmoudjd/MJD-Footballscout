import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

interface FormFieldProps {
  children: ReactNode
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
}

export function FormField({
  children,
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-emerald-950">
        {label}
        {required ? (
          <span className="ml-1 text-emerald-700" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-emerald-950/60">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
