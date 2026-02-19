import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

interface StatusStateProps {
  title: string
  description?: string
  tone?: "loading" | "error" | "empty"
  className?: string
}

const toneStyles: Record<NonNullable<StatusStateProps["tone"]>, string> = {
  loading: "border-cyan-200 bg-cyan-50/80 text-cyan-900",
  error: "border-red-200 bg-red-50 text-red-900",
  empty: "border-slate-200 bg-slate-50/90 text-slate-900",
}

const toneIcon: Record<NonNullable<StatusStateProps["tone"]>, string> = {
  loading: "⏳",
  error: "⚠️",
  empty: "ℹ️",
}

export function StatusState({
  title,
  description,
  tone = "empty",
  className,
}: StatusStateProps) {
  return (
    <div className={cn("rounded-xl border p-4", toneStyles[tone], className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-base" aria-hidden>
          {toneIcon[tone]}
        </span>
        <div>
          <Text as="p" variant="body" weight="semibold" tone="inherit">
            {title}
          </Text>
          {description ? (
            <Text as="p" variant="body" tone="inherit" className="mt-1 opacity-90">
              {description}
            </Text>
          ) : null}
        </div>
      </div>
    </div>
  )
}
