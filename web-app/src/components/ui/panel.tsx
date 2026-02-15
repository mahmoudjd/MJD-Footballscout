import { ReactNode } from "react"

interface PanelProps {
  children: ReactNode
  className?: string
  tone?: "default" | "glass" | "soft"
}

const toneClasses = {
  default: "bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-[1px]",
  glass: "bg-white/12 border border-white/25 text-white shadow-xl backdrop-blur-sm",
  soft: "bg-slate-50/95 border border-slate-200 shadow-sm",
}

export function Panel({ children, className = "", tone = "default" }: PanelProps) {
  return (
    <section className={`rounded-2xl p-4 sm:p-6 ${toneClasses[tone]} ${className}`.trim()}>
      {children}
    </section>
  )
}
