"use client"

import { usePlayerStatsQuery } from "@/features/players/hooks/usePlayerStatsQuery"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { StatTile } from "@/components/ui/stat-tile"
import { RankedList } from "@/components/ui/ranked-list"
import { usePlayerHighlightsQuery } from "@/features/players/hooks/usePlayerHighlightsQuery"
import { PlayerSpotlightList } from "@/components/ui/player-spotlight-list"
import { HomeInsightsSkeleton } from "@/components/ui/skeleton"

export function HomeStats() {
  const statsQuery = usePlayerStatsQuery()
  const highlightsQuery = usePlayerHighlightsQuery()

  if (statsQuery.isLoading || highlightsQuery.isLoading) {
    return (
      <Panel className="w-full">
        <HomeInsightsSkeleton />
      </Panel>
    )
  }

  if (statsQuery.isError || highlightsQuery.isError || !statsQuery.data || !highlightsQuery.data) {
    return (
      <Panel className="w-full">
        <StatusState
          tone="error"
          title="Insights unavailable"
          description="The backend data feed is currently not reachable."
        />
      </Panel>
    )
  }

  const stats = statsQuery.data
  const highlights = highlightsQuery.data
  const latestUpdate = stats.latestUpdate
    ? new Date(stats.latestUpdate).toLocaleString()
    : "Not available"

  return (
    <div className="w-full space-y-5">
      <div className="flex justify-end">
        <span className="rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 shadow-sm">
          Last sync: {latestUpdate}
        </span>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total Players" value={stats.totalPlayers} />
        <StatTile label="Average Age" value={stats.averageAge} />
        <StatTile label="Average ELO" value={stats.averageElo} />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <RankedList
          title="Top Positions"
          emptyText="No position data available."
          items={stats.positions.slice(0, 4).map((entry) => ({
            key: entry.position,
            label: entry.position,
            value: entry.count,
          }))}
        />
        <RankedList
          title="Top Countries"
          emptyText="No country data available."
          items={stats.topCountries.map((entry) => ({
            key: entry.country,
            label: entry.country,
            value: entry.count,
          }))}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
        <PlayerSpotlightList
          title="Top ELO Players"
          players={highlights.topEloPlayers}
          emptyText="No player rankings available."
        />
        <PlayerSpotlightList
          title="Young Talents"
          players={highlights.youngTalents}
          emptyText="No young talents found."
        />
        <PlayerSpotlightList
          title="Market Leaders"
          players={highlights.marketLeaders}
          emptyText="No market value data available."
        />
      </div>
    </div>
  )
}
