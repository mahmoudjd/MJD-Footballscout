import { JSX } from "react"
import { Text } from "@/components/ui/text"
import { cn } from "@/lib/cn"

interface InfoItemProps {
  icon: JSX.Element
  label: string
  value: string | number
  href?: string
}

const baseClassName =
  "group min-w-0 flex items-start gap-3 rounded-2xl border border-emerald-950/8 bg-linear-to-br from-white to-emerald-50/35 p-4 shadow-[0_16px_30px_-26px_rgba(15,50,36,0.38)]"

const ProfileInfoItem = ({ icon, label, value, href }: InfoItemProps) => {
  const content = (
    <>
      <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-800 shadow-inner">
        <span className="h-5 w-5" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <Text as="p" variant="overline" weight="bold" className="text-emerald-950/50">
          {label}
        </Text>
        <Text as="p" variant="body" weight="semibold" className="mt-1 break-words text-emerald-950">
          {value}
        </Text>
      </div>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          baseClassName,
          "touch-manipulation transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-emerald-700/25 hover:bg-emerald-50/60 hover:shadow-[0_20px_38px_-26px_rgba(6,78,59,0.42)] focus-visible:ring-2 focus-visible:ring-lime-500/70 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none",
        )}
      >
        {content}
      </a>
    )
  }

  return <div className={baseClassName}>{content}</div>
}

export default ProfileInfoItem
