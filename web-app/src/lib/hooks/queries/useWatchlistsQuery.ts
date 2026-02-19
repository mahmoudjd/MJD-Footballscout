import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"
import type { WatchlistType } from "@/lib/types/type"

async function fetchWatchlists() {
  const response = await apiClient.get<WatchlistType[]>("/watchlists")
  return response.data
}

export function useWatchlistsQuery(enabled = true) {
  return useQuery({
    queryKey: ["watchlists"],
    queryFn: fetchWatchlists,
    enabled,
  })
}
