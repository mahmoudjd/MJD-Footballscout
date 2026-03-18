import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import type { PlayerType } from "@/lib/types/type"
import { savePlayer } from "@/features/players/api/players-api"

interface SavePlayerMutationInput {
  player: PlayerType
}

export function useSavePlayerMutation(
  options?: UseMutationOptions<PlayerType, Error, SavePlayerMutationInput>,
) {
  return useMutation<PlayerType, Error, SavePlayerMutationInput>({
    ...options,
    mutationFn: (input) => savePlayer(input.player),
  })
}
