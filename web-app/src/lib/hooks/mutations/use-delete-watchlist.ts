import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"

interface DeleteWatchlistInput {
  watchlistId: string
}

async function deleteWatchlist(input: DeleteWatchlistInput) {
  await apiClient.delete(`/watchlists/${input.watchlistId}`)
}

export function useDeleteWatchlist(
  options?: UseMutationOptions<void, Error, DeleteWatchlistInput>,
) {
  return useMutation<void, Error, DeleteWatchlistInput>({
    ...options,
    mutationFn: deleteWatchlist,
  })
}
