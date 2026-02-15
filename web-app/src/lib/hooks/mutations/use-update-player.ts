import { PlayerType } from "@/lib/types/type"
import { useMutation } from "@tanstack/react-query"
import type { UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"

interface UpdatePlayerMutationType {
  playerId: string
}

export function useUpdateMutation(
  options?: UseMutationOptions<PlayerType, Error, UpdatePlayerMutationType>,
) {
  return useMutation<PlayerType, Error, UpdatePlayerMutationType>({
    ...options,
    mutationFn: (input) => updatePlayer(input),
  })
}

async function updatePlayer(input: UpdatePlayerMutationType) {
  const res = await apiClient.put<PlayerType>(`/players/${input.playerId}`)
  return res.data
}
