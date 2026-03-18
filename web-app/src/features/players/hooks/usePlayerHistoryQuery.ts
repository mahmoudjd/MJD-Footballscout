import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { fetchPlayerHistory } from "@/features/players/api/players-api"

export function usePlayerHistoryQuery(playerId: string, limit = 30) {
  return useQuery({
    queryKey: queryKeys.players.history(playerId, limit),
    queryFn: () => fetchPlayerHistory(playerId, limit),
    enabled: Boolean(playerId),
  })
}
