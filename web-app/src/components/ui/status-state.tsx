interface StatusStateProps {
  title: string
  description?: string
  tone?: "loading" | "error" | "empty"
  className?: string
}

const toneStyles = {
  loading: "border-cyan-200 bg-cyan-50 text-cyan-900",
  error: "border-red-200 bg-red-50 text-red-900",
  empty: "border-gray-200 bg-gray-50 text-gray-900",
}

export function StatusState({
  title,
  description,
  tone = "empty",
  className = "",
}: StatusStateProps) {
  return (
    <div className={`rounded-xl border p-4 ${toneStyles[tone]} ${className}`.trim()}>
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
    </div>
  )
}
