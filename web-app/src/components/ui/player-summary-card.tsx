import { ReactNode } from "react"
import { PlayerType } from "@/lib/types/type"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

interface PlayerSummaryCardProps {
  player: PlayerType
  actions?: ReactNode
  compact?: boolean
  className?: string
  tone?: "default" | "soft"
}

const toneClasses: Record<NonNullable<PlayerSummaryCardProps["tone"]>, string> = {
  default: "border-slate-200 bg-white",
  soft: "border-cyan-100 bg-linear-to-br from-white to-cyan-50/60",
}

export function PlayerSummaryCard({
  player,
  actions,
  compact = false,
  className,
  tone = "default",
}: PlayerSummaryCardProps) {
  return (
    <article className={cn("rounded-xl border p-4 shadow-sm", toneClasses[tone], className)}>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <img
          src={player.image}
          alt={player.name}
          className={cn(compact ? "h-14 w-14" : "h-16 w-16", "rounded-full border border-slate-200 object-cover")}
          loading="lazy"
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
