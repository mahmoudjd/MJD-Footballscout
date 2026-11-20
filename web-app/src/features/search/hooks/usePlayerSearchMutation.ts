import { useMutation, useQuery } from "@tanstack/react-query"
import type { PlayerType } from "@/lib/types/type"
import { apiClient } from "@/lib/hooks/apiClient"

export function usePlayerSearchMutation() {
  return useMutation({
    mutationFn: (name: string) => searchPlayers(name),
  })
}

export function useSearchNoticeQuery() {
  return useQuery({
    queryKey: ["search-status"],
    queryFn: async () =>
      (await apiClient.get<{ notice: string | null }>(`/search/status`)).data.notice,
    staleTime: 5 * 60 * 1000,
  })
}

async function searchPlayers(name: string) {
  const response = await apiClient.post<PlayerType[]>(`/search`, { name })
  return response.data
}
