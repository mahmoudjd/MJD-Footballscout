import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"
import { OutlineIcons } from "@/components/icons/outline-icons"

interface StatusStateProps {
  title: string
  description?: string
  tone?: "loading" | "error" | "empty"
  className?: string
}

const toneStyles: Record<NonNullable<StatusStateProps["tone"]>, string> = {
  loading: "border-amber-200 bg-amber-50/70 text-amber-950",
  error: "border-rose-200 bg-rose-50/80 text-rose-900",
  empty: "border-stone-200 bg-stone-50/90 text-stone-900",
}

const toneIconStyles: Record<NonNullable<StatusStateProps["tone"]>, string> = {
  loading: "bg-amber-100 text-amber-700",
  error: "bg-rose-100 text-rose-700",
  empty: "bg-stone-200 text-stone-600",
}

export function StatusState({
  title,
  description,
  tone = "empty",
  className,
}: StatusStateProps) {
  const Icon =
    tone === "loading"
      ? OutlineIcons.ArrowPathIcon
      : tone === "error"
        ? OutlineIcons.XMarkIcon
        : OutlineIcons.QuestionMarkCircleIcon

  return (
    <div className={cn("rounded-xl border p-4 sm:p-5", toneStyles[tone], className)}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            toneIconStyles[tone],
          )}
          aria-hidden
        >
          <Icon className={cn("h-4 w-4", tone === "loading" ? "animate-spin" : "")} />
        </span>
        <div>
          <Text as="p" variant="body" weight="semibold" tone="inherit" className="tracking-[0.01em]">
            {title}
          </Text>
          {description ? (
            <Text as="p" variant="body" tone="inherit" className="mt-1 opacity-85">
              {description}
            </Text>
          ) : null}
        </div>
      </div>
    </div>
  )
}
