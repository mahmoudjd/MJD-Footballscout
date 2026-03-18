import type { PlayerType } from "@/lib/types/type"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { fetchPlayerById } from "@/features/players/api/players-api"

export function usePlayerQuery(playerId: string, enabled = true) {
  return useQuery<PlayerType>({
    queryKey: queryKeys.players.detail(playerId),
    queryFn: () => fetchPlayerById(playerId),
    enabled: enabled && Boolean(playerId),
  })
}
