import { ReactNode } from "react"
import { cn } from "@/lib/cn"

interface PageContainerProps {
  children: ReactNode
  className?: string
  size?: "default" | "wide" | "narrow"
  spacing?: "default" | "compact" | "relaxed"
}

const sizeClasses: Record<NonNullable<PageContainerProps["size"]>, string> = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
}

const spacingClasses: Record<NonNullable<PageContainerProps["spacing"]>, string> = {
  default: "px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
  compact: "px-4 py-4 sm:px-6 sm:py-6 lg:px-8",
  relaxed: "px-4 py-8 sm:px-6 sm:py-10 lg:px-8",
}

export function PageContainer({
  children,
  className,
  size = "default",
  spacing = "default",
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full", sizeClasses[size], spacingClasses[spacing], className)}>{children}</div>
  )
}
