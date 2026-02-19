import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"
import type { WatchlistType } from "@/lib/types/type"

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

export function useRemovePlayerFromWatchlistMutation(
  options?: UseMutationOptions<WatchlistType, Error, RemovePlayerFromWatchlistInput>,
) {
  return useMutation<WatchlistType, Error, RemovePlayerFromWatchlistInput>({
    ...options,
    mutationFn: removePlayerFromWatchlist,
  })
}
