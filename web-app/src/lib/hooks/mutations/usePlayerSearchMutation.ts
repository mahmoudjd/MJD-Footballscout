import { useMutation } from "@tanstack/react-query"
import type { PlayerType } from "@/lib/types/type"
import { apiClient } from "@/lib/hooks/apiClient"

export function usePlayerSearchMutation() {
  return useMutation({
    mutationFn: (name: string) => searchPlayers(name),
  })
}

async function searchPlayers(name: string) {
  const response = await apiClient.post<PlayerType[]>(`/search`, { name })
  return response.data
}
