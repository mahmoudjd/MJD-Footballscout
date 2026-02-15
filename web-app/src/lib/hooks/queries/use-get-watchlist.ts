import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"
import { WatchlistDetailType } from "@/lib/types/type"

async function fetchWatchlist(watchlistId: string) {
  const response = await apiClient.get<WatchlistDetailType>(`/watchlists/${watchlistId}`)
  return response.data
}

export function useGetWatchlist(watchlistId: string, enabled = true) {
  return useQuery({
    queryKey: ["watchlists", watchlistId],
    queryFn: () => fetchWatchlist(watchlistId),
    enabled: enabled && Boolean(watchlistId),
  })
}
