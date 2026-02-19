import type { PlayerType } from "@/lib/types/type"
import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"

interface UpdatePlayerMutationInput {
  playerId: string
}

export function useUpdatePlayerMutation(
  options?: UseMutationOptions<PlayerType, Error, UpdatePlayerMutationInput>,
) {
  return useMutation<PlayerType, Error, UpdatePlayerMutationInput>({
    ...options,
    mutationFn: (input) => updatePlayer(input),
  })
}

async function updatePlayer(input: UpdatePlayerMutationInput) {
  const res = await apiClient.put<PlayerType>(`/players/${input.playerId}`)
  return res.data
}
