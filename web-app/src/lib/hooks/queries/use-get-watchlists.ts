import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"
import { WatchlistType } from "@/lib/types/type"

async function fetchWatchlists() {
  const response = await apiClient.get<WatchlistType[]>("/watchlists")
  return response.data
}

export function useGetWatchlists(enabled = true) {
  return useQuery({
    queryKey: ["watchlists"],
    queryFn: fetchWatchlists,
    enabled,
  })
}
