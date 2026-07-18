import { useQuery } from "@tanstack/react-query"
import { fetchSimilarPlayers } from "@/features/players/api/players-api"
import { queryKeys } from "@/lib/react-query/query-keys"
import type { SimilarPlayersResponseType } from "@/lib/types/type"

export function useSimilarPlayersQuery(playerId: string, limit = 6) {
  return useQuery<SimilarPlayersResponseType>({
    queryKey: queryKeys.players.similar(playerId, limit),
    queryFn: () => fetchSimilarPlayers(playerId, limit),
    enabled: Boolean(playerId),
    staleTime: 5 * 60 * 1000,
  })
}
