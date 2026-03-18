import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { fetchPlayers } from "@/features/players/api/players-api"

export function usePlayersQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.players.all,
    queryFn: fetchPlayers,
    enabled,
  })
}
