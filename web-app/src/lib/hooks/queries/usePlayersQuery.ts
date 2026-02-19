import { useQuery } from "@tanstack/react-query"
import type { PlayerType } from "@/lib/types/type"
import { apiClient } from "@/lib/hooks/apiClient"

export function usePlayersQuery() {
  return useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
  })
}

async function fetchPlayers() {
  const response = await apiClient.get<PlayerType[]>(`/players`)
  return response.data
}
