import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"
import { WatchlistType } from "@/lib/types/type"

interface RemovePlayerFromWatchlistInput {
  watchlistId: string
  playerId: string
}

async function removePlayerFromWatchlist(input: RemovePlayerFromWatchlistInput) {
  const response = await apiClient.delete<WatchlistType>(
    `/watchlists/${input.watchlistId}/players/${input.playerId}`,
  )
  return response.data
}

export function useRemovePlayerFromWatchlist(
  options?: UseMutationOptions<WatchlistType, Error, RemovePlayerFromWatchlistInput>,
) {
  return useMutation<WatchlistType, Error, RemovePlayerFromWatchlistInput>({
    ...options,
    mutationFn: removePlayerFromWatchlist,
  })
}
