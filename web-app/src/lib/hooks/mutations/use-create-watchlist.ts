import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"
import { WatchlistInputType, WatchlistType } from "@/lib/types/type"

async function createWatchlist(input: WatchlistInputType) {
  const response = await apiClient.post<WatchlistType>("/watchlists", input)
  return response.data
}

export function useCreateWatchlist(
  options?: UseMutationOptions<WatchlistType, Error, WatchlistInputType>,
) {
  return useMutation<WatchlistType, Error, WatchlistInputType>({
    ...options,
    mutationFn: createWatchlist,
  })
}
