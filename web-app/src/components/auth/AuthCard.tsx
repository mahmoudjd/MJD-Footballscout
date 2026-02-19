import type { PropsWithChildren } from "react"
import { Text } from "@/components/ui/text"
import { cn } from "@/lib/cn"

interface AuthCardProps extends PropsWithChildren {
  title: string
  description: string
  className?: string
}

export function AuthCard({ title, description, className, children }: AuthCardProps) {
  return (
    <section
      className={cn(
        "mx-auto mt-14 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.5)] sm:p-8",
        className,
      )}
    >
      <header className="mb-6">
        <Text as="h1" variant="h2" weight="extrabold">
          {title}
        </Text>
        <Text as="p" variant="body" tone="muted" className="mt-1">
          {description}
        </Text>
      </header>

      {children}
    </section>
  )
}
