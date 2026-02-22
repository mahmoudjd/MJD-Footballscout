import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"
import type { ComparePlayersResponseType } from "@/lib/types/type"
import axios from "axios"

async function fetchComparedPlayers(ids: string[], compareAll: boolean) {
  try {
    const payload = compareAll ? { all: true } : { ids }
    const response = await apiClient.post<ComparePlayersResponseType>("/players/compare", payload)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const fallbackPath = compareAll
        ? "/players/compare?all=true"
        : `/players/compare?ids=${encodeURIComponent(ids.join(","))}`
      const fallbackResponse = await apiClient.get<ComparePlayersResponseType>(fallbackPath)
      return fallbackResponse.data
    }
    throw error
  }
}

export function usePlayerComparisonQuery(ids: string[], compareAll = false) {
  const normalizedIds = compareAll ? [] : Array.from(new Set(ids)).sort()

  return useQuery({
    queryKey: ["players", "compare", compareAll ? "all" : normalizedIds],
    queryFn: () => fetchComparedPlayers(normalizedIds, compareAll),
    enabled: compareAll || normalizedIds.length >= 2,
  })
}
