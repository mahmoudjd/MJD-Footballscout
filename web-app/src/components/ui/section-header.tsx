import { ReactNode } from "react"

interface SectionHeaderProps {
  title: string
  description?: string
  right?: ReactNode
  className?: string
}

export function SectionHeader({ title, description, right, className = "" }: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()}
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm text-gray-600">{description}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}
