import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { deletePlayerById } from "@/features/players/api/players-api"

interface DeletePlayerMutationInput {
  playerId: string
}

export function useDeletePlayerMutation(
  options?: UseMutationOptions<void, Error, DeletePlayerMutationInput>,
) {
  return useMutation<void, Error, DeletePlayerMutationInput>({
    ...options,
    mutationFn: (input: DeletePlayerMutationInput) => deletePlayerById(input.playerId),
  })
}
