import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"
import type { WatchlistType } from "@/lib/types/type"
import { queryKeys } from "@/lib/react-query/query-keys"

async function fetchWatchlists() {
  const response = await apiClient.get<WatchlistType[]>("/watchlists")
  return response.data
}

export function useWatchlistsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.watchlists.all,
    queryFn: fetchWatchlists,
    enabled,
  })
}
