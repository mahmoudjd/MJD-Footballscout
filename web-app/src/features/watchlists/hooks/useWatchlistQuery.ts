import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"
import type { WatchlistDetailType } from "@/lib/types/type"
import { queryKeys } from "@/lib/react-query/query-keys"

async function fetchWatchlist(watchlistId: string) {
  const response = await apiClient.get<WatchlistDetailType>(`/watchlists/${watchlistId}`)
  return response.data
}

export function useWatchlistQuery(watchlistId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.watchlists.detail(watchlistId),
    queryFn: () => fetchWatchlist(watchlistId),
    enabled: enabled && Boolean(watchlistId),
  })
}
