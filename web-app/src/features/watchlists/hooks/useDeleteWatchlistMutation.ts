import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"

interface DeleteWatchlistInput {
  watchlistId: string
}

async function deleteWatchlist(input: DeleteWatchlistInput) {
  await apiClient.delete(`/watchlists/${input.watchlistId}`)
}

export function useDeleteWatchlistMutation(
  options?: UseMutationOptions<void, Error, DeleteWatchlistInput>,
) {
  return useMutation<void, Error, DeleteWatchlistInput>({
    ...options,
    mutationFn: deleteWatchlist,
  })
}
