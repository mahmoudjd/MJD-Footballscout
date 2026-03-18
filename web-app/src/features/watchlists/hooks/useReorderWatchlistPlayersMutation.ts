import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"
import type { WatchlistType } from "@/lib/types/type"

interface ReorderWatchlistPlayersInput {
  watchlistId: string
  playerIds: string[]
}

async function reorderWatchlistPlayers(input: ReorderWatchlistPlayersInput) {
  const response = await apiClient.put<WatchlistType>(
    `/watchlists/${input.watchlistId}/players/reorder`,
    {
      playerIds: input.playerIds,
    },
  )
  return response.data
}

export function useReorderWatchlistPlayersMutation(
  options?: UseMutationOptions<WatchlistType, Error, ReorderWatchlistPlayersInput>,
) {
  return useMutation<WatchlistType, Error, ReorderWatchlistPlayersInput>({
    ...options,
    mutationFn: reorderWatchlistPlayers,
  })
}
