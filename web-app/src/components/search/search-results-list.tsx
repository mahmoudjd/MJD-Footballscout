import { PlayerType } from "@/lib/types/type"
import { SearchPlayerCard } from "@/components/search/SearchPlayerCard"
import { Panel } from "@/components/ui/panel"

interface SearchResultsListProps {
  players: PlayerType[]
}

export function SearchResultsList({ players }: SearchResultsListProps) {
  if (players.length === 0) return null

  return (
    <Panel className="mt-0 overflow-hidden p-0">
      <div className="flex flex-col divide-y divide-gray-200">
        {players.map((player, index) => (
          <SearchPlayerCard
            player={player}
            key={player._id || `${player.fullName}-${player.country}-${index}`}
          />
        ))}
      </div>
    </Panel>
  )
}
