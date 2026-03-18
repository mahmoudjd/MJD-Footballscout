import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { fetchPlayerStats } from "@/features/players/api/players-api"

export function usePlayerStatsQuery() {
  return useQuery({
    queryKey: queryKeys.players.stats(),
    queryFn: fetchPlayerStats,
    staleTime: 60_000,
  })
}
