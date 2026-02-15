import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"
import { PlayerReportsResponseType } from "@/lib/types/type"

async function fetchPlayerReports(playerId: string) {
  const response = await apiClient.get<PlayerReportsResponseType>(`/players/${playerId}/reports`)
  return response.data
}

export function useGetPlayerReports(playerId: string) {
  return useQuery({
    queryKey: ["players", playerId, "reports"],
    queryFn: () => fetchPlayerReports(playerId),
    enabled: Boolean(playerId),
  })
}
