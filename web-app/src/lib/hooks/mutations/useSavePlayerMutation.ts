import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import type { PlayerType } from "@/lib/types/type"
import { apiClient } from "@/lib/hooks/apiClient"

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

async function savePlayer(player: PlayerType) {
  const response = await apiClient.post(`/players`, {
    data: player,
  })
  return response.data
}
