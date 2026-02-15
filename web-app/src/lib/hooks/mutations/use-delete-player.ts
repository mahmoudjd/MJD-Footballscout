import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"

interface DeletePlayerMutationType {
  playerId: string
}
async function deletePlayer(id: string) {
  await apiClient.delete(`/players/${id}`)
}

export function useDeletePlayer(
  options?: UseMutationOptions<void, Error, DeletePlayerMutationType>,
) {
  return useMutation<void, Error, DeletePlayerMutationType>({
    ...options,
    mutationFn: (input) => deletePlayer(input.playerId),
  })
}
