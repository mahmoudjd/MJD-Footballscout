import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"
import type { WatchlistType } from "@/lib/types/type"

interface AddPlayerToWatchlistInput {
  watchlistId: string
  playerId: string
}

async function addPlayerToWatchlist(input: AddPlayerToWatchlistInput) {
  const response = await apiClient.post<WatchlistType>(`/watchlists/${input.watchlistId}/players`, {
    playerId: input.playerId,
  })
  return response.data
}

export function useAddPlayerToWatchlistMutation(
  options?: UseMutationOptions<WatchlistType, Error, AddPlayerToWatchlistInput>,
) {
  return useMutation<WatchlistType, Error, AddPlayerToWatchlistInput>({
    ...options,
    mutationFn: addPlayerToWatchlist,
  })
}
