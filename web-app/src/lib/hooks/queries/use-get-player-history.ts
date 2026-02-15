import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"
import { PlayerHistoryResponseType } from "@/lib/types/type"

async function fetchPlayerHistory(playerId: string, limit = 30) {
  const response = await apiClient.get<PlayerHistoryResponseType>(
    `/players/${playerId}/history?limit=${limit}`,
  )
  return response.data
}

export function useGetPlayerHistory(playerId: string, limit = 30) {
  return useQuery({
    queryKey: ["players", playerId, "history", limit],
    queryFn: () => fetchPlayerHistory(playerId, limit),
    enabled: Boolean(playerId),
  })
}
