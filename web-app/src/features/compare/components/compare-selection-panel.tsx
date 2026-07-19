import Image from "next/image"
import type { PlayerType } from "@/lib/types/type"
import { StatusState } from "@/components/ui/status-state"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"
import { Input } from "@/components/ui/input"
import { Chip } from "@/components/ui/chip"
import { getPlayerImageSrc } from "@/lib/player-image"

type CompareSelectionPanelProps = {
  selectedIds: string[]
  selectedPreview: PlayerType[]
  selectedOverflow: number
  search: string
  onSearchChange: (value: string) => void
  onApplySelection: () => void
  onCompareAllPlayers: () => void
  onClearSelection: () => void
  selectionDirty: boolean
  allPlayersCount: number
  isPlayersLoading: boolean
  isPlayersError: boolean
  visibleCandidates: PlayerType[]
  selectedSet: Set<string>
  onTogglePlayer: (playerId: string) => void
  hasMoreCandidates: boolean
  onLoadMoreCandidates: () => void
}

export function CompareSelectionPanel({
  selectedIds,
  selectedPreview,
  selectedOverflow,
  search,
  onSearchChange,
  onApplySelection,
  onCompareAllPlayers,
  onClearSelection,
  selectionDirty,
  allPlayersCount,
  isPlayersLoading,
  isPlayersError,
  visibleCandidates,
  selectedSet,
  onTogglePlayer,
  hasMoreCandidates,
  onLoadMoreCandidates,
}: CompareSelectionPanelProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onApplySelection}
          disabled={selectedIds.length < 2 || !selectionDirty}
          variant="primary"
          size="sm"
        >
          Compare selected players
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={onCompareAllPlayers}
                disabled={isPlayersLoading || allPlayersCount < 2}
                variant="outline"
                size="sm"
                className="border-stone-300 text-stone-700 hover:bg-stone-100"
              >
                Compare all players ({allPlayersCount})
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Runs ranking against all currently available players.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          type="button"
          onClick={onClearSelection}
          disabled={selectedIds.length === 0}
          variant="outline"
          size="sm"
        >
          Clear selection
        </Button>
      </div>

      <div>
        <label htmlFor="compare-player-search" className="sr-only">
          Search Players for Comparison
        </label>
        <Input
          id="compare-player-search"
          name="comparePlayerSearch"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, club, country, or position…"
          autoComplete="off"
          spellCheck={false}
          inputSize="sm"
        />
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50/90 p-3">
        {selectedIds.length === 0 ? (
          <Text as="p" tone="muted">
            No players selected.
          </Text>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {selectedPreview.map((player) => (
              <Chip key={player._id} tone="amber" className="bg-amber-100/80 text-amber-800">
                {player.name}
              </Chip>
            ))}
            {selectedOverflow > 0 && <Chip tone="slate">+{selectedOverflow} more</Chip>}
          </div>
        )}
      </div>

      {isPlayersLoading && <StatusState tone="loading" title="Loading players" />}
      {isPlayersError && <StatusState tone="error" title="Unable to load players" />}

      {!isPlayersLoading && !isPlayersError && (
        <>
          <div className="max-h-[62vh] overflow-y-auto rounded-xl border border-stone-200">
            {visibleCandidates.length === 0 ? (
              <div className="p-4">
                <StatusState
                  tone="empty"
                  title="No players found"
                  description="Try a different search term."
                />
              </div>
            ) : (
              <ul className="divide-y divide-stone-200">
                {visibleCandidates.map((player) => {
                  const selected = selectedSet.has(player._id)
                  return (
                    <li key={player._id} className="flex items-center gap-3 px-3 py-3">
                      <Image
                        src={getPlayerImageSrc(player.image)}
                        alt={player.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                        sizes="40px"
                      />
                      <div className="min-w-0 flex-1">
                        <Text as="p" weight="semibold" className="truncate text-slate-900">
                          {player.name}
                        </Text>
                        <Text as="p" variant="caption" tone="muted" className="truncate">
                          {player.currentClub || "-"} • {player.country} • ELO {player.elo}
                        </Text>
                      </div>
                      <Button
                        type="button"
                        onClick={() => onTogglePlayer(player._id)}
                        variant={selected ? "primary" : "outline"}
                        size="xs"
                        className={cn(
                          "rounded-md",
                          !selected && "border-stone-300 text-stone-700 hover:bg-stone-100",
                        )}
                      >
                        {selected ? "Selected" : "Add"}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          {hasMoreCandidates && (
            <Button type="button" onClick={onLoadMoreCandidates} variant="outline" size="sm">
              Load more players
            </Button>
          )}
        </>
      )}
    </>
  )
}
