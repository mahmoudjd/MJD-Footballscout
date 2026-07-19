import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"
import { OutlineIcons } from "@/components/icons/outline-icons"

interface StatusStateProps {
  title: string
  description?: string
  tone?: "loading" | "error" | "empty"
  className?: string
  action?: ReactNode
}

const toneStyles: Record<NonNullable<StatusStateProps["tone"]>, string> = {
  loading: "border-lime-300/70 bg-lime-50 text-emerald-950",
  error: "border-rose-200 bg-rose-50/80 text-rose-900",
  empty: "border-emerald-950/10 bg-emerald-50/45 text-emerald-950",
}

const toneIconStyles: Record<NonNullable<StatusStateProps["tone"]>, string> = {
  loading: "bg-lime-200 text-emerald-800",
  error: "bg-rose-100 text-rose-700",
  empty: "bg-emerald-100 text-emerald-700",
}

export function StatusState({
  title,
  description,
  tone = "empty",
  className,
  action,
}: StatusStateProps) {
  const Icon =
    tone === "loading"
      ? OutlineIcons.ArrowPathIcon
      : tone === "error"
        ? OutlineIcons.XMarkIcon
        : OutlineIcons.QuestionMarkCircleIcon

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-[0_16px_32px_-28px_currentColor] sm:p-5",
        toneStyles[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className={cn(
              "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              toneIconStyles[tone],
            )}
            aria-hidden
          >
            <Icon className={cn("h-5 w-5", tone === "loading" ? "animate-spin" : "")} />
          </span>
          <div className="min-w-0">
            <Text
              as="p"
              variant="body"
              weight="semibold"
              tone="inherit"
              className="tracking-[0.01em]"
            >
              {title}
            </Text>
            {description ? (
              <Text as="p" variant="body" tone="inherit" className="mt-1 opacity-85">
                {description}
              </Text>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0 sm:ml-auto">{action}</div> : null}
      </div>
    </div>
  )
}
