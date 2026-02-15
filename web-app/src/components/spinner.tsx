interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  tone?: "brand" | "light"
  label?: string
  className?: string
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-14 w-14 border-4",
}

const toneClasses: Record<NonNullable<SpinnerProps["tone"]>, string> = {
  brand: "border-slate-300 border-t-cyan-700",
  light: "border-white/30 border-t-white",
}

export function Spinner({ size = "md", tone = "brand", label, className = "" }: SpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
    >
      <div
        className={`${sizeClasses[size]} ${toneClasses[tone]} animate-spin rounded-full`}
        aria-hidden="true"
      />
      {label ? <span className="text-sm text-slate-600">{label}</span> : null}
    </div>
  )
}
