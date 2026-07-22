import type { CompareMetricsType, PlayerType } from "@/lib/types/type"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Chip } from "@/components/ui/chip"
import { cn } from "@/lib/cn"

type CompareResultsPanelProps = {
  allPlayersCount: number
  appliedScope: "selection" | "all"
  appliedIdsCount: number
  selectionDirty: boolean
  selectedIdsCount: number
  onApplySelection: () => void
  hasActiveComparison: boolean
  isComparisonLoading: boolean
  isComparisonError: boolean
  metrics: CompareMetricsType | undefined
  comparedPlayers: PlayerType[]
  visibleComparedPlayers: PlayerType[]
  rankOrderById: Map<string, number>
  scoreById: Map<string, number>
  playersById: Map<string, PlayerType>
  hasMoreResults: boolean
  onLoadMoreResults: () => void
}

function isWinner(group: string[] | undefined, playerId: string) {
  return !!group?.includes(playerId)
}

function metricWinners(ids: string[] | undefined, playersById: Map<string, PlayerType>) {
  if (!ids || ids.length === 0) return "-"
  return ids.map((id) => playersById.get(id)?.name || id).join(", ")
}

function metricCardValueClass(highlighted: boolean) {
  return cn(
    "rounded-md border px-2 py-1",
    highlighted ? "border-amber-200 bg-amber-50 text-amber-800" : "border-stone-200 text-stone-700",
  )
}

function metricTableCellClass(highlighted: boolean) {
  return cn(
    "px-3 py-2",
    highlighted ? "bg-amber-50 font-semibold text-amber-800" : "text-stone-700",
  )
}

function MetricLeaders({
  metrics,
  playersById,
}: {
  metrics: CompareMetricsType | undefined
  playersById: Map<string, PlayerType>
}) {
  return (
    <Panel className="space-y-3">
      <Text as="h3" variant="body-lg" weight="semibold" className="text-stone-900">
        Leaders
      </Text>
      <div className="grid grid-cols-1 gap-2">
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <Text as="p" variant="overline" weight="semibold" tone="subtle">
            Highest ELO
          </Text>
          <Text as="p" className="mt-1 text-stone-800">
            {metricWinners(metrics?.highestElo, playersById)}
          </Text>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <Text as="p" variant="overline" weight="semibold" tone="subtle">
            Highest Market Value
          </Text>
          <Text as="p" className="mt-1 text-stone-800">
            {metricWinners(metrics?.highestMarketValue, playersById)}
          </Text>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <Text as="p" variant="overline" weight="semibold" tone="subtle">
            Youngest
          </Text>
          <Text as="p" className="mt-1 text-stone-800">
            {metricWinners(metrics?.youngest, playersById)}
          </Text>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <Text as="p" variant="overline" weight="semibold" tone="subtle">
            Recently Updated
          </Text>
          <Text as="p" className="mt-1 text-stone-800">
            {metricWinners(metrics?.recentlyUpdated, playersById)}
          </Text>
        </div>
      </div>
    </Panel>
  )
}

function ScoreboardCards({
  players,
  metrics,
  rankOrderById,
  scoreById,
}: {
  players: PlayerType[]
  metrics: CompareMetricsType | undefined
  rankOrderById: Map<string, number>
  scoreById: Map<string, number>
}) {
  return (
    <div className="space-y-3 md:hidden">
      {players.map((player) => (
        <article key={player._id} className="rounded-lg border border-stone-200 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Text as="p" weight="semibold" className="truncate text-stone-900">
                {rankOrderById.get(player._id) || "-"} . {player.name}
              </Text>
              <Text as="p" variant="caption" tone="muted" className="truncate">
                {player.currentClub || player.country}
              </Text>
              {isWinner(metrics?.recentlyUpdated, player._id) && (
                <Chip tone="success" size="xs" className="mt-1">
                  Recently updated
                </Chip>
              )}
            </div>
            <Chip tone="amber" size="xs" className="rounded-md bg-amber-100 text-amber-800">
              {scoreById.get(player._id) ?? 0} pts
            </Chip>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className={metricCardValueClass(isWinner(metrics?.youngest, player._id))}>
              <Text as="p" variant="overline" weight="semibold">
                Age
              </Text>
              <Text as="p" weight="semibold" className="mt-0.5">
                {player.age}
              </Text>
            </div>
            <div className={metricCardValueClass(isWinner(metrics?.highestElo, player._id))}>
              <Text as="p" variant="overline" weight="semibold">
                ELO
              </Text>
              <Text as="p" weight="semibold" className="mt-0.5">
                {player.elo}
              </Text>
            </div>
            <div
              className={cn(
                "col-span-2",
                metricCardValueClass(isWinner(metrics?.highestMarketValue, player._id)),
              )}
            >
              <Text as="p" variant="overline" weight="semibold">
                Market value
              </Text>
              <Text as="p" weight="semibold" className="mt-0.5">
                {player.value} {player.currency}
              </Text>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function ScoreboardTable({
  players,
  metrics,
  rankOrderById,
  scoreById,
}: {
  players: PlayerType[]
  metrics: CompareMetricsType | undefined
  rankOrderById: Map<string, number>
  scoreById: Map<string, number>
}) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-stone-200 md:block">
      <table className="min-w-full divide-y divide-stone-200 text-xs lg:text-sm">
        <thead className="bg-stone-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-stone-700">#</th>
            <th className="px-3 py-2 text-left font-semibold text-stone-700">Player</th>
            <th className="px-3 py-2 text-left font-semibold text-stone-700">Score</th>
            <th className="px-3 py-2 text-left font-semibold text-stone-700">Age</th>
            <th className="px-3 py-2 text-left font-semibold text-stone-700">ELO</th>
            <th className="px-3 py-2 text-left font-semibold text-stone-700">Value</th>
            <th className="hidden px-3 py-2 text-left font-semibold text-stone-700 lg:table-cell">
              Club
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {players.map((player) => (
            <tr key={player._id} className="align-top">
              <td className="px-3 py-2 text-stone-600">{rankOrderById.get(player._id) || "-"}</td>
              <td className="px-3 py-2 font-medium text-stone-900">
                <Text as="p">{player.name}</Text>
                {isWinner(metrics?.recentlyUpdated, player._id) && (
                  <Chip tone="success" size="xs" className="mt-1">
                    Recently updated
                  </Chip>
                )}
              </td>
              <td className="px-3 py-2 text-stone-700">{scoreById.get(player._id) ?? 0}</td>
              <td className={metricTableCellClass(isWinner(metrics?.youngest, player._id))}>
                {player.age}
              </td>
              <td className={metricTableCellClass(isWinner(metrics?.highestElo, player._id))}>
                {player.elo}
              </td>
              <td className={metricTableCellClass(isWinner(metrics?.highestMarketValue, player._id))}>
                {player.value} {player.currency}
              </td>
              <td className="hidden px-3 py-2 text-stone-700 lg:table-cell">
                {player.currentClub || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Scoreboard({
  visibleComparedPlayers,
  metrics,
  rankOrderById,
  scoreById,
  hasMoreResults,
  onLoadMoreResults,
}: {
  visibleComparedPlayers: PlayerType[]
  metrics: CompareMetricsType | undefined
  rankOrderById: Map<string, number>
  scoreById: Map<string, number>
  hasMoreResults: boolean
  onLoadMoreResults: () => void
}) {
  return (
    <Panel className="space-y-3">
      <Text as="h3" variant="body-lg" weight="semibold" className="text-stone-900">
        Scoreboard
      </Text>
      <ScoreboardCards
        players={visibleComparedPlayers}
        metrics={metrics}
        rankOrderById={rankOrderById}
        scoreById={scoreById}
      />
      <ScoreboardTable
        players={visibleComparedPlayers}
        metrics={metrics}
        rankOrderById={rankOrderById}
        scoreById={scoreById}
      />
      {hasMoreResults && (
        <Button
          type="button"
          onClick={onLoadMoreResults}
          variant="outline"
          size="sm"
        >
          Show more results
        </Button>
      )}
    </Panel>
  )
}

export function CompareResultsPanel({
  allPlayersCount,
  appliedScope,
  appliedIdsCount,
  selectionDirty,
  selectedIdsCount,
  onApplySelection,
  hasActiveComparison,
  isComparisonLoading,
  isComparisonError,
  metrics,
  comparedPlayers,
  visibleComparedPlayers,
  rankOrderById,
  scoreById,
  playersById,
  hasMoreResults,
  onLoadMoreResults,
}: CompareResultsPanelProps) {
  return (
    <>
      <Panel className="space-y-2">
        <Text as="h3" variant="body-lg" weight="semibold" className="text-stone-900">
          Comparison status
        </Text>
        <Text as="p" className="text-stone-700">
          Applied players:{" "}
          <Text as="span" weight="semibold">
            {appliedScope === "all" ? allPlayersCount : appliedIdsCount}
          </Text>
        </Text>
        {selectionDirty && selectedIdsCount >= 2 && (
          <Button
            type="button"
            onClick={onApplySelection}
            variant="outline"
            size="xs"
            className="border-stone-300 text-stone-700 hover:bg-stone-100"
          >
            Update results with current selection
          </Button>
        )}
      </Panel>

      {!hasActiveComparison ? (
        <Panel>
          <StatusState
            tone="empty"
            title="Select at least two players"
            description="Use the selection panel to start comparison."
          />
        </Panel>
      ) : null}

      {hasActiveComparison && isComparisonLoading && (
        <Panel>
          <StatusState tone="loading" title="Building comparison" />
        </Panel>
      )}

      {hasActiveComparison && isComparisonError && (
        <Panel>
          <StatusState
            tone="error"
            title="Comparison failed"
            description="Try again with another selection."
          />
        </Panel>
      )}

      {hasActiveComparison && !isComparisonLoading && !isComparisonError && comparedPlayers.length > 0 && (
        <>
          <MetricLeaders metrics={metrics} playersById={playersById} />
          <Scoreboard
            visibleComparedPlayers={visibleComparedPlayers}
            metrics={metrics}
            rankOrderById={rankOrderById}
            scoreById={scoreById}
            hasMoreResults={hasMoreResults}
            onLoadMoreResults={onLoadMoreResults}
          />
        </>
      )}
    </>
  )
}
