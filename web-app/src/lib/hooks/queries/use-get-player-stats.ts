import { useQuery } from "@tanstack/react-query"
import { PlayerStatsType } from "@/lib/types/type"
import { apiClient } from "@/lib/hooks/api-client"

export function useGetPlayerStats() {
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
