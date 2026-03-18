import type { PlayerType } from "@/lib/types/type"
import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { updatePlayerById } from "@/features/players/api/players-api"

interface UpdatePlayerMutationInput {
  playerId: string
}

export function useUpdatePlayerMutation(
  options?: UseMutationOptions<PlayerType, Error, UpdatePlayerMutationInput>,
) {
  return useMutation<PlayerType, Error, UpdatePlayerMutationInput>({
    ...options,
    mutationFn: (input) => updatePlayerById(input.playerId),
  })
}
