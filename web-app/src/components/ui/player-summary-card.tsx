import { ReactNode } from "react"
import { PlayerType } from "@/lib/types/type"

interface PlayerSummaryCardProps {
  player: PlayerType
  actions?: ReactNode
  compact?: boolean
}

export function PlayerSummaryCard({ player, actions, compact = false }: PlayerSummaryCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <img
          src={player.image}
          alt={player.name}
          className={`${compact ? "h-14 w-14" : "h-16 w-16"} rounded-full object-cover`}
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{player.name}</p>
          <p className="truncate text-xs text-gray-600">{player.currentClub || player.country}</p>
          <p className="mt-1 text-xs text-gray-500">
            {player.position} • {player.age}y • ELO {player.elo}
          </p>
        </div>
        {actions ? <div className="w-full sm:w-auto sm:shrink-0">{actions}</div> : null}
      </div>
    </article>
  )
}
