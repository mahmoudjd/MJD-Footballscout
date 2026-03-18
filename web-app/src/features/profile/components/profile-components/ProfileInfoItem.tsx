import { JSX } from "react"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"

interface InfoItemProps {
  icon: JSX.Element
  label: string
  value: string | number
  clickable?: boolean
  onClick?: () => void
}

const baseClassName =
  "group flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.45)] transition"

const ProfileInfoItem = ({ icon, label, value, clickable, onClick }: InfoItemProps) => {
  const content = (
    <>
      <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
        <span className="h-5 w-5">{icon}</span>
      </div>
      <div className="min-w-0">
        <Text as="p" variant="overline" weight="semibold" tone="subtle">
          {label}
        </Text>
        <Text as="p" variant="body" weight="semibold" className="mt-1 break-words text-slate-900">
          {value}
        </Text>
      </div>
    </>
  )

  if (clickable && onClick) {
    return (
      <Button
        type="button"
        onClick={onClick}
        variant="ghost"
        size="md"
        fullWidth
        className={`${baseClassName} justify-start bg-white p-4 text-left hover:border-stone-300 hover:bg-stone-50`}
      >
        {content}
      </Button>
    )
  }

  return <div className={baseClassName}>{content}</div>
}

export default ProfileInfoItem
