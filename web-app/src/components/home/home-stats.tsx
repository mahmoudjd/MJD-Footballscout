"use client"

import { usePlayerStatsQuery } from "@/lib/hooks/queries/usePlayerStatsQuery"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { StatTile } from "@/components/ui/stat-tile"
import { RankedList } from "@/components/ui/ranked-list"
import { usePlayerHighlightsQuery } from "@/lib/hooks/queries/usePlayerHighlightsQuery"
import { PlayerSpotlightList } from "@/components/ui/player-spotlight-list"
import { HomeInsightsSkeleton } from "@/components/ui/skeleton"
import { SectionHeader } from "@/components/ui/section-header"

export function HomeStats() {
  const statsQuery = usePlayerStatsQuery()
  const highlightsQuery = usePlayerHighlightsQuery()

  if (statsQuery.isLoading || highlightsQuery.isLoading) {
    return (
      <Panel tone="glass" className="mt-8 w-full max-w-6xl">
        <HomeInsightsSkeleton />
      </Panel>
    )
  }

  if (statsQuery.isError || highlightsQuery.isError || !statsQuery.data || !highlightsQuery.data) {
    return (
      <Panel tone="glass" className="mt-8 w-full max-w-6xl">
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
    <div className="w-full max-w-6xl space-y-4">
      <SectionHeader
        title="Live Player Insights"
        description="Combined stats and highlights from your current database."
        icon="ChartBarIcon"
        badge={`Last sync: ${latestUpdate}`}
        tone="glass"
      />

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Total Players" value={stats.totalPlayers} tone="glass" />
        <StatTile label="Average Age" value={stats.averageAge} tone="glass" />
        <StatTile label="Average ELO" value={stats.averageElo} tone="glass" />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <RankedList
          title="Top Positions"
          emptyText="No position data available."
          tone="glass"
          items={stats.positions.slice(0, 4).map((entry) => ({
            key: entry.position,
            label: entry.position,
            value: entry.count,
          }))}
        />
        <RankedList
          title="Top Countries"
          emptyText="No country data available."
          tone="glass"
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
          tone="glass"
        />
        <PlayerSpotlightList
          title="Young Talents"
          players={highlights.youngTalents}
          emptyText="No young talents found."
          tone="glass"
        />
        <PlayerSpotlightList
          title="Market Leaders"
          players={highlights.marketLeaders}
          emptyText="No market value data available."
          tone="glass"
        />
      </div>
    </div>
  )
}
