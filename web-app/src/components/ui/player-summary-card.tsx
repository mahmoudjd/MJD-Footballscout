import { ReactNode } from "react"
import { PlayerType } from "@/lib/types/type"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"
import Image from "next/image"
import { getPlayerImageSrc } from "@/lib/player-image"

interface PlayerSummaryCardProps {
  player: PlayerType
  actions?: ReactNode
  compact?: boolean
  className?: string
  tone?: "default" | "soft"
}

const toneClasses: Record<NonNullable<PlayerSummaryCardProps["tone"]>, string> = {
  default: "border-stone-200 bg-white",
  soft: "border-stone-200 bg-linear-to-br from-white to-stone-50/80",
}

export function PlayerSummaryCard({
  player,
  actions,
  compact = false,
  className,
  tone = "default",
}: PlayerSummaryCardProps) {
  return (
    <article className={cn("rounded-xl border p-4 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.5)]", toneClasses[tone], className)}>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Image
          src={getPlayerImageSrc(player.image)}
          alt={player.name}
          width={compact ? 56 : 64}
          height={compact ? 56 : 64}
          className={cn(compact ? "h-14 w-14" : "h-16 w-16", "rounded-full border border-stone-200 object-cover")}
          sizes={compact ? "56px" : "64px"}
        />
        <div className="min-w-0 flex-1">
          <Text as="p" weight="semibold" className="truncate text-slate-900">
            {player.name}
          </Text>
          <Text as="p" variant="caption" tone="muted" className="truncate">
            {player.currentClub || player.country}
          </Text>
          <Text as="p" variant="caption" tone="subtle" className="mt-1">
            {player.position} • {player.age}y • ELO {player.elo}
          </Text>
        </div>
        {actions ? <div className="w-full sm:w-auto sm:shrink-0">{actions}</div> : null}
      </div>
    </article>
  )
}
