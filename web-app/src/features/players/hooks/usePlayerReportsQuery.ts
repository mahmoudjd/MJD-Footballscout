import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/query-keys"
import { fetchPlayerReports } from "@/features/players/api/players-api"

export function usePlayerReportsQuery(playerId: string) {
  return useQuery({
    queryKey: queryKeys.players.reports(playerId),
    queryFn: () => fetchPlayerReports(playerId),
    enabled: Boolean(playerId),
  })
}
