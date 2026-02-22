import type { PlayerType } from "@/lib/types/type"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"

async function fetchPlayerById(id: string) {
  const response = await apiClient.get<PlayerType>(`/players/${id}`)
  return response.data
}

export function usePlayerQuery(playerId: string, enabled = true) {
  return useQuery<PlayerType>({
    queryKey: ["players", playerId],
    queryFn: () => fetchPlayerById(playerId),
    enabled: enabled && Boolean(playerId),
  })
}
