import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"

interface DeletePlayerMutationInput {
  playerId: string
}
async function deletePlayer(id: string) {
  await apiClient.delete(`/players/${id}`)
}

export function useDeletePlayerMutation(
  options?: UseMutationOptions<void, Error, DeletePlayerMutationInput>,
) {
  return useMutation<void, Error, DeletePlayerMutationInput>({
    ...options,
    mutationFn: (input: DeletePlayerMutationInput) => deletePlayer(input.playerId),
  })
}
