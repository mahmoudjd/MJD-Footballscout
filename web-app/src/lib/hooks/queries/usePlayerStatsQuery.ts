import { useQuery } from "@tanstack/react-query"
import type { PlayerStatsType } from "@/lib/types/type"
import { apiClient } from "@/lib/hooks/apiClient"

export function usePlayerStatsQuery() {
  return useQuery({
    queryKey: ["players", "stats"],
    queryFn: fetchPlayerStats,
    staleTime: 60_000,
  })
}

async function fetchPlayerStats() {
  const response = await apiClient.get<PlayerStatsType>("/players/stats")
  return response.data
}
