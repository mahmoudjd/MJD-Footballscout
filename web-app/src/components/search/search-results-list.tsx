import { PlayerType } from "@/lib/types/type"
import { Player } from "@/components/search/Player"
import { Panel } from "@/components/ui/panel"

export function SearchResultsList({ players }: { players: PlayerType[] }) {
  if (players.length === 0) return null

  return (
    <Panel className="mt-0 overflow-hidden p-0">
      <div className="flex flex-col divide-y divide-gray-200">
        {players.map((player, index) => (
          <Player
            player={player}
            key={player._id || `${player.fullName}-${player.country}-${index}`}
          />
        ))}
      </div>
    </Panel>
  )
}
