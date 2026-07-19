import { ReactNode } from "react"
import { cn } from "@/lib/cn"

interface PageContainerProps {
  children: ReactNode
  className?: string
  size?: "default" | "wide" | "narrow"
  spacing?: "default" | "compact" | "relaxed"
}

export const appShellWidthClassName = "max-w-[92rem] 2xl:max-w-[104rem]"

const sizeClasses: Record<NonNullable<PageContainerProps["size"]>, string> = {
  default: "",
  wide: "",
  narrow: "max-w-4xl",
}

const spacingClasses: Record<NonNullable<PageContainerProps["spacing"]>, string> = {
  default: "px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
  compact: "px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
  relaxed: "px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14",
}

export function PageContainer({
  children,
  className,
  size = "default",
  spacing = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full animate-[page-in_320ms_ease-out] motion-reduce:animate-none",
        appShellWidthClassName,
        sizeClasses[size],
        spacingClasses[spacing],
        className,
      )}
    >
      {children}
    </div>
  )
}
