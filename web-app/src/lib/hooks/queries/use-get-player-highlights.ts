import { useQuery } from "@tanstack/react-query"
import { PlayerHighlightsType } from "@/lib/types/type"
import { apiClient } from "@/lib/hooks/api-client"

export function useGetPlayerHighlights() {
  return useQuery({
    queryKey: ["players", "highlights"],
    queryFn: fetchPlayerHighlights,
    staleTime: 60_000,
  })
}

async function fetchPlayerHighlights() {
  const response = await apiClient.get<PlayerHighlightsType>("/players/highlights")
  return response.data
}
