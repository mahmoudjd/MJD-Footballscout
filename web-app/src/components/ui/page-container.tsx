import { ReactNode } from "react"

interface PageContainerProps {
  children: ReactNode
  className?: string
  size?: "default" | "wide" | "narrow"
}

const sizeClasses = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
}

export function PageContainer({ children, className = "", size = "default" }: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full ${sizeClasses[size]} px-4 py-5 sm:px-6 sm:py-6 lg:px-8 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
