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
        "relative mx-auto my-8 w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl border border-emerald-950/10 bg-linear-to-br from-white via-white to-emerald-50/50 p-5 pt-7 shadow-[0_32px_70px_-36px_rgba(6,78,59,0.42)] sm:my-12 sm:p-8 sm:pt-10",
        className,
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-emerald-800 via-lime-400 to-emerald-600"
        aria-hidden="true"
      />
      <header className="mb-7">
        <Text
          as="h1"
          variant="h1"
          weight="extrabold"
          className="text-2xl text-emerald-950 sm:text-3xl"
        >
          {title}
        </Text>
        <Text as="p" variant="body" className="mt-2 text-emerald-950/65">
          {description}
        </Text>
      </header>

      {children}
    </section>
  )
}
