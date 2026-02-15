import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"
import { WatchlistInputType, WatchlistType } from "@/lib/types/type"

interface UpdateWatchlistInput {
  watchlistId: string
  payload: WatchlistInputType
}

async function updateWatchlist(input: UpdateWatchlistInput) {
  const response = await apiClient.put<WatchlistType>(
    `/watchlists/${input.watchlistId}`,
    input.payload,
  )
  return response.data
}

export function useUpdateWatchlist(
  options?: UseMutationOptions<WatchlistType, Error, UpdateWatchlistInput>,
) {
  return useMutation<WatchlistType, Error, UpdateWatchlistInput>({
    ...options,
    mutationFn: updateWatchlist,
  })
}
