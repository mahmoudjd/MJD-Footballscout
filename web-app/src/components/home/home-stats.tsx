"use client"

import { useGetPlayerStats } from "@/lib/hooks/queries/use-get-player-stats"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { StatTile } from "@/components/ui/stat-tile"
import { RankedList } from "@/components/ui/ranked-list"
import { useGetPlayerHighlights } from "@/lib/hooks/queries/use-get-player-highlights"
import { PlayerSpotlightList } from "@/components/ui/player-spotlight-list"
import { HomeInsightsSkeleton } from "@/components/ui/skeleton"

export function HomeStats() {
  const statsQuery = useGetPlayerStats()
  const highlightsQuery = useGetPlayerHighlights()

  if (statsQuery.isLoading || highlightsQuery.isLoading) {
    return (
      <Panel tone="glass" className="mt-8 w-full max-w-5xl">
        <HomeInsightsSkeleton />
      </Panel>
    )
  }

  if (statsQuery.isError || highlightsQuery.isError || !statsQuery.data || !highlightsQuery.data) {
    return (
      <Panel tone="glass" className="mt-8 w-full max-w-5xl">
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
    <Panel tone="glass" className="mt-8 w-full max-w-5xl text-left">
      <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
        Live Player Insights
      </h3>
      <p className="mt-1 text-sm text-gray-200">
        Combined stats and highlights from your current database.
      </p>

      <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Total Players" value={stats.totalPlayers} />
        <StatTile label="Average Age" value={stats.averageAge} />
        <StatTile label="Average ELO" value={stats.averageElo} />
      </div>

      <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="mt-6 grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
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

      <p className="mt-5 text-xs text-gray-300">Last sync: {latestUpdate}</p>
    </Panel>
  )
}
