import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { fetchPlayerHighlights } from "@/features/players/api/players-api"

export function usePlayerHighlightsQuery() {
  return useQuery({
    queryKey: queryKeys.players.highlights(),
    queryFn: fetchPlayerHighlights,
    staleTime: 60_000,
  })
}
